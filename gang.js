const express = require('express');
const router = express.Router();

const guildBase = require('../guildBase');
const userBase = require('../User');
const { hasLaptop, currentLevelFor, levelProgress } = require('../gangEngine');

// ⚠️ ADJUST ME: hook this up to however your existing site already knows
// who's logged in (the same session your /api/me and MDT endpoints use).
function getDiscordId(req) {
    return req.session?.user?.id || null;
}

// ⚠️ ADJUST ME: your guild id (or pull it from req, subdomain, etc — same
// pattern the police site already uses).
function getGuildId(req) {
    return req.session?.guild || process.env.GUILD_ID;
}

/**
 * Access gate, run before every route below:
 *  1) must be logged in via Discord
 *  2) the game must tell us which character opened the laptop (?id=<citizenId>,
 *     passed by the FiveM NUI resource that opens this page)
 *  3) that character must actually be carrying a laptop item
 *  4) that character must be a member of a gang
 * On success, attaches req.gangCtx = { guildData, userData, character, gang, member }
 */
async function resolveGangContext(req, res, next) {
    try {
        const discordId = getDiscordId(req);
        if (!discordId) {
            return res.status(401).json({ error: 'not_logged_in', message: 'يجب تسجيل الدخول عبر ديسكورد' });
        }

        const citizenId = Number(req.query.id);
        if (!citizenId || isNaN(citizenId)) {
            return res.status(400).json({ error: 'missing_character', message: 'لم يتم تمرير هوية الشخصية من داخل اللعبة' });
        }

        const guild = getGuildId(req);
        const [guildData, userData] = await Promise.all([
            guildBase.findOne({ guild }),
            userBase.findOne({ guild, user: discordId })
        ]);

        if (!guildData || !userData) {
            return res.status(404).json({ error: 'no_data', message: 'تعذر العثور على بياناتك' });
        }

        const character = userData.characters.find(c => c.id?.number === citizenId);
        if (!character) {
            return res.status(404).json({ error: 'character_not_found', message: 'لم يتم العثور على هذه الشخصية' });
        }

        if (!hasLaptop(character)) {
            return res.status(403).json({ error: 'no_laptop', message: 'يجب أن تملك لابتوب في حقيبتك لفتح هذا الموقع' });
        }

        const gang = guildData.gangs.find(g => g.members.some(m => m.identity === citizenId));
        if (!gang) {
            return res.status(403).json({ error: 'not_in_gang', message: 'لست عضوًا في أي عصابة' });
        }

        const member = gang.members.find(m => m.identity === citizenId);

        req.gangCtx = { guildData, userData, character, citizenId, gang, member };
        next();
    } catch (err) {
        console.error('Gang access gate error:', err);
        res.status(500).json({ error: 'server_error', message: 'خطأ في السيرفر' });
    }
}

// ===== GET /api/gang/access =====
// The first call the page makes: are we allowed in, and here's the shell data.
router.get('/access', resolveGangContext, (req, res) => {
    const { guildData, character, gang, member, citizenId } = req.gangCtx;
    const level = currentLevelFor(guildData.gang_levels, gang.xp);

    res.json({
        citizen: {
            id: citizenId,
            first: character.id?.first,
            last: character.id?.last
        },
        gang: {
            name: gang.name,
            image: gang.image,
            color: gang.color,
            official: !!gang.official,
            points: gang.points,
            xp: gang.xp,
            level: level?.level || 0,
            levelName: level?.name || '—',
            memberCount: gang.members.length
        },
        role: member.role,
        isBoss: gang.bossIdentity === citizenId,
        isDeputy: gang.deputyIdentity === citizenId
    });
});

// ===== GET /api/gang/awards =====
// Battle pass ladder for the member's own gang.
router.get('/awards', resolveGangContext, (req, res) => {
    const { guildData, gang } = req.gangCtx;
    const progress = levelProgress(guildData.gang_levels, gang.xp);

    const levels = [...(guildData.gang_levels || [])]
        .sort((a, b) => a.level - b.level)
        .map(lvl => ({
            level: lvl.level,
            name: lvl.name,
            icon: lvl.icon,
            requiredXp: lvl.requiredXp,
            description: lvl.description,
            rewardType: lvl.rewardType,
            reached: gang.xp >= lvl.requiredXp,
            granted: gang.grantedLevels.includes(lvl.level)
        }));

    res.json({
        xp: gang.xp,
        currentLevel: progress.current?.level || 0,
        nextLevel: progress.next?.level || null,
        into: progress.into,
        span: progress.span,
        levels
    });
});

// ===== GET /api/gang/quests =====
router.get('/quests', resolveGangContext, (req, res) => {
    const { guildData, gang } = req.gangCtx;
    const tasks = guildData.gang_tasks || { points: [], xp: [], projects: [] };

    const forThisGang = arr => (arr || []).filter(t => !t.gangName || t.gangName === gang.name);

    res.json({
        pointsQuests: forThisGang(tasks.points),
        xpQuests: forThisGang(tasks.xp),
        projects: tasks.projects || []
    });
});

// ===== GET /api/gang/leaderboard/players =====
router.get('/leaderboard/players', resolveGangContext, async (req, res) => {
    const { guildData } = req.gangCtx;
    const guild = guildData.guild;

    // Build identity -> character name map once
    const users = await userBase.find({ guild }).catch(() => []);
    const nameByIdentity = new Map();
    for (const u of users) {
        for (const c of (u.characters || [])) {
            if (c?.id?.number) {
                nameByIdentity.set(c.id.number, `${c.id.first || ''} ${c.id.last || ''}`.trim());
            }
        }
    }

    const rows = [];
    for (const gang of guildData.gangs) {
        for (const m of gang.members) {
            rows.push({
                identity: m.identity,
                name: nameByIdentity.get(m.identity) || 'غير معروف',
                gang: gang.name,
                role: m.role,
                xp: m.xp || 0,
                flags: m.flags || 0,
                arrests: m.arrests || 0,
                kills: m.kills || 0,
                deaths: m.deaths || 0,
                kd: m.deaths > 0 ? +(m.kills / m.deaths).toFixed(2) : (m.kills || 0).toFixed(2)
            });
        }
    }

    rows.sort((a, b) => b.xp - a.xp);
    res.json(rows.slice(0, 100));
});

// ===== GET /api/gang/leaderboard/gangs =====
router.get('/leaderboard/gangs', resolveGangContext, (req, res) => {
    const { guildData } = req.gangCtx;

    const rows = guildData.gangs.map(g => ({
        name: g.name,
        image: g.image,
        color: g.color,
        official: !!g.official,
        points: g.points || 0,
        xp: g.xp || 0,
        level: currentLevelFor(guildData.gang_levels, g.xp)?.level || 0,
        memberCount: g.members.length
    }));

    rows.sort((a, b) => b.xp - a.xp);
    res.json(rows);
});

// ===== GET /api/gang/turfs =====
router.get('/turfs', resolveGangContext, (req, res) => {
    const { guildData } = req.gangCtx;
    const rows = [];
    for (const gang of guildData.gangs) {
        for (const turf of (gang.turfs || [])) {
            rows.push({ turf, gang: gang.name, color: gang.color });
        }
    }
    res.json(rows);
});

// ===== GET /api/gang/events =====
router.get('/events', resolveGangContext, (req, res) => {
    const { guildData } = req.gangCtx;
    const events = [...(guildData.gang_events || [])].sort((a, b) => new Date(a.startAt) - new Date(b.startAt));
    res.json(events);
});

// ===== GET /api/gang/announcements =====
router.get('/announcements', resolveGangContext, (req, res) => {
    const { guildData } = req.gangCtx;
    const posts = [...(guildData.gang_announcements || [])].sort((a, b) => new Date(b.date) - new Date(a.date));
    res.json(posts);
});

module.exports = router;
