/**
 * Gang system core logic — shared by the web API (routes/gang.js) and by
 * any existing bot file that awards gang XP (thefts, missions, etc).
 *
 * Wherever your bot currently does something like:
 *     gang.xp += reward;
 *     await guildData.save();
 *
 * replace it with:
 *     const { applyGangXp } = require('./gangEngine');
 *     await applyGangXp(client, guildId, gang.name, reward);
 *
 * so the battle pass grants happen everywhere xp is earned, not just here.
 */

const guildBase = require('./guildBase');
const userBase = require('./User');

// Adjust this to whatever your inventory system actually calls the item.
const LAPTOP_ITEM_NAMES = ['laptop', 'لابتوب'];

/** Does this character currently have a laptop in their inventory? */
function hasLaptop(character) {
    if (!character?.inv || !Array.isArray(character.inv)) return false;
    return character.inv.some(i => {
        const name = (i?.item || i?.name || '').toString().toLowerCase();
        const count = i?.count ?? i?.amount ?? 1;
        return LAPTOP_ITEM_NAMES.includes(name) && count > 0;
    });
}

/** Highest battle-pass level this xp total has reached, given the level table. */
function currentLevelFor(gangLevels, xp) {
    const sorted = [...(gangLevels || [])].sort((a, b) => a.requiredXp - b.requiredXp);
    let current = null;
    for (const lvl of sorted) {
        if (xp >= lvl.requiredXp) current = lvl;
        else break;
    }
    return current;
}

/** Progress toward the next level: { current, next, into, span } */
function levelProgress(gangLevels, xp) {
    const sorted = [...(gangLevels || [])].sort((a, b) => a.requiredXp - b.requiredXp);
    let current = null, next = null;
    for (const lvl of sorted) {
        if (xp >= lvl.requiredXp) current = lvl;
        else { next = lvl; break; }
    }
    const floor = current?.requiredXp ?? 0;
    const ceil = next?.requiredXp ?? floor;
    return {
        current, next,
        into: xp - floor,
        span: Math.max(ceil - floor, 1)
    };
}

/**
 * Add xp to a gang and auto-grant any battle-pass level rewards just crossed.
 * Rewards go straight to the boss's inventory — no manual claim.
 * Returns { gang, grantedLevels } (grantedLevels = newly granted this call).
 */
async function applyGangXp(client, guild, gangName, amount) {
    const guildData = await guildBase.findOne({ guild });
    if (!guildData) throw new Error('guild not found');

    const gang = guildData.gangs.find(g => g.name === gangName);
    if (!gang) throw new Error('gang not found');

    gang.xp = (gang.xp || 0) + amount;
    gang.points = (gang.points || 0) + amount;

    const newlyGranted = [];
    const levels = [...(guildData.gang_levels || [])].sort((a, b) => a.requiredXp - b.requiredXp);

    for (const lvl of levels) {
        if (gang.xp < lvl.requiredXp) continue;
        if (gang.grantedLevels.includes(lvl.level)) continue;

        await grantLevelReward(guildData, gang, lvl);
        gang.grantedLevels.push(lvl.level);
        newlyGranted.push(lvl);
    }

    await guildData.save();

    if (newlyGranted.length && guildData.gang_log && client) {
        const channel = client.channels.cache.get(guildData.gang_log);
        if (channel) {
            for (const lvl of newlyGranted) {
                channel.send({
                    embeds: [{
                        title: '# - ترقية باتل باس',
                        description:
`**
العصابة | ${gang.name}
اللفل الجديد | ${lvl.level} — ${lvl.name}
الجائزة | ${lvl.description || lvl.rewardType}
تم إرسال الجائزة تلقائيًا لبوس العصابة
**`,
                        color: 0xe8791a
                    }]
                }).catch(() => {});
            }
        }
    }

    return { gang, grantedLevels: newlyGranted };
}

/** Deliver one level's reward to the gang boss. */
async function grantLevelReward(guildData, gang, level) {
    const boss = await userBase.findOne({
        guild: guildData.guild,
        'characters.id.number': gang.bossIdentity
    });
    if (!boss) return; // boss identity not found — reward is skipped, not lost silently in prod: log this

    const charIndex = boss.characters.findIndex(c => c.id?.number === gang.bossIdentity);
    if (charIndex === -1) return;

    if (level.rewardType === 'item' || level.rewardType === 'mystery_box') {
        boss.characters[charIndex].inv.push({
            item: level.rewardItem || level.name,
            count: level.rewardCount || 1
        });
    } else if (level.rewardType === 'gang_upgrade') {
        // e.g. raise a member cap or similar — hook your own gang-upgrade logic here
    }

    await boss.save();
}

module.exports = {
    hasLaptop,
    currentLevelFor,
    levelProgress,
    applyGangXp,
    grantLevelReward
};
