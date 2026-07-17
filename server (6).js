require('dotenv').config();
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const { Strategy } = require('passport-discord');
const mongoose = require('mongoose');
const axios = require('axios');

const GUILD_ID = process.env.GUILD_ID;
const PARAMEDIC_ROLE_ID = process.env.PARAMEDIC_ROLE_ID;
const PARAMEDIC_HIGH_ROLE_ID = process.env.PARAMEDIC_HIGH_ROLE_ID;

mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log("MongoDB Connected"))
    .catch(err => console.error("MongoDB Connection Error:", err));

const guildBase = mongoose.model("guildBase", new mongoose.Schema({
    guild: String,
    paramedic_sectors: Array,
    paramedic_wings: Array
}, { strict: false }));

const userBase = mongoose.model("userBase", new mongoose.Schema({
    guild: String,
    user: String,
    characters: Array
}, { strict: false }));

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));
passport.use(new Strategy({
    clientID: process.env.DISCORD_CLIENT_ID,
    clientSecret: process.env.DISCORD_CLIENT_SECRET,
    callbackURL: process.env.DISCORD_CALLBACK_URL,
    scope: ['identify']
}, (accessToken, refreshToken, profile, done) => process.nextTick(() => done(null, profile))));

async function getGuildMember(userId) {
    try {
        const response = await axios.get(`https://discord.com/api/v10/guilds/${GUILD_ID}/members/${userId}`, {
            headers: { Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}` }
        });
        return response.data;
    } catch (error) {
        return null;
    }
}

function hasRole(member, roleId) {
    if (!roleId) return false;
    return member?.roles?.includes(roleId) || false;
}

function totalPoints(pointsArray) {
    if (!Array.isArray(pointsArray)) return 0;
    return pointsArray.reduce((sum, p) => sum + (Number(p?.value) || 0), 0);
}

const app = express();
app.use(express.static('public'));
app.use(session({ secret: process.env.SESSION_SECRET, resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());

app.get('/auth/discord', passport.authenticate('discord'));
app.get('/auth/discord/callback', passport.authenticate('discord', { failureRedirect: '/' }), (req, res) => res.redirect('/'));
app.get('/auth/logout', (req, res) => req.logout(() => res.redirect('/')));

app.get('/api/me', (req, res) => {
    if (!req.isAuthenticated()) return res.json({ loggedIn: false });
    res.json({ loggedIn: true, user: { id: req.user.id, username: req.user.username, avatar: req.user.avatar } });
});

app.get('/api/dashboard', async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ error: "غير مسجل دخول" });

    const member = await getGuildMember(req.user.id);
    if (!member) return res.status(403).json({ error: "أنت لست عضواً بالسيرفر" });

    const isParamedic = hasRole(member, PARAMEDIC_ROLE_ID);
    const isHigh = hasRole(member, PARAMEDIC_HIGH_ROLE_ID);

    let leaderboard = [];
    let sectors = [];
    let wings = [];

    if (isParamedic || isHigh) {
        const guildData = await guildBase.findOne({ guild: GUILD_ID });
        sectors = guildData?.paramedic_sectors || [];
        wings = guildData?.paramedic_wings || [];

        const allUsers = await userBase.find({ guild: GUILD_ID });
        allUsers.forEach(u => {
            (u.characters || []).forEach(c => {
                if (c?.id?.job !== "paramedic") return;
                leaderboard.push({
                    name: `${c.id.first || ""} ${c.id.last || ""}`.trim() || "بدون اسم",
                    rank: c.id.paramedic_data?.rank || "غير محدد",
                    sector: c.id.paramedic_data?.sector || "غير محدد",
                    wings: c.id.paramedic_data?.wings || "غير محدد",
                    points: totalPoints(c.paramedic_points)
                });
            });
        });
        leaderboard.sort((a, b) => b.points - a.points);
    }

    res.json({ isParamedic, isHigh, leaderboard, sectors, wings });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
