const { Schema, model } = require('mongoose');

const Database = new Schema({
    guild: String,
    user: String,

    another_character: { type: Boolean, default: false },

    characters: [{
        cash: { type: Number, default: 0 },
        bank: { type: Number, default: 5000 },
        warehouse: {
            items: { type: Array, default: [] }
        },
        id: {
            type: Object,
            default: {
                first: "",
                last: "",
                date: "",
                place: "",
                gender: "",
                number: 0,
                job: "citizen",
                accepted: false,

                police_data: { code: 0, sector: "", rank: "", wings: "", notes: "" },
                paramedic_data: { code: 0, sector: "", rank: "", wings: "", notes: "" },
                justice_data: { code: 0, department: "", rank: "", specialization: "", notes: "" },

                mdt: ""
            }
        },

        vehicle_reservations: [{
            carId: String,
            carName: String,
            playerId: Number,
            playerName: String,
            duration: String,
            reason: String,
            carImage: String,
            reservedAt: Date,
            released: { type: Boolean, default: false },
            releaseReason: String
        }],

        // NOTE: the gang laptop's access gate reads this array looking for an
        // item whose name matches the "laptop" item (see requireLaptop() in
        // routes/gang.js) - no schema change needed, it already exists.
        inv: { type: Array, default: [] },
        builds: { type: Array, default: [] },
        cars: { type: Array, default: [] },
        twitter: String,
        twitter_verified: { type: Boolean, default: false },
        twitter_tweets: { type: Number, default: 0 },
        twitter_followers: { type: Number, default: 0 },
        twitter_following: { type: Array, default: [] },
        contacts: { type: Array, default: [] },
        headquarters: { type: Array, default: [] },

        clamped: { type: Boolean, default: false },
        clamp_before: { type: Boolean, default: false },
        deadProtection: { type: Boolean, default: false },

        prison: {
            status: { type: Boolean, default: false },
            reason: String,
            by: String,
            time: Number,
            startedAt: Date
        },

        jailCount: { type: Number, default: 0 },

        police_points: {
            type: Array,
            default: [
                { name: "login", value: 0 },
                { name: "claim_report", value: 0 },
                { name: "status", value: 0 },
                { name: "prison", value: 0 },
                { name: "others", value: 0 }
            ]
        },

        gang: {
            id: { type: String, default: null },
            name: { type: String, default: null },
            type: { type: String, default: null }
        },

        paramedic_points: {
            type: Array,
            default: [
                { name: "login", value: 0 },
                { name: "claim_report", value: 0 },
                { name: "status", value: 0 },
                { name: "others", value: 0 }
            ]
        },

        criminal_honor: {
            xp: { type: Number, default: 0 },
            level: { type: Number, default: 0 },
            met_boss: { type: Boolean, default: false },
            boss_cooldown: { type: Date, default: null },
            table_chat_done: { type: Boolean, default: false },
            table_location_sent: { type: Boolean, default: false }
        },

        justice_points: {
            type: Array,
            default: [
                { name: "login", value: 0 },
                { name: "cases_handled", value: 0 },
                { name: "court_sessions", value: 0 },
                { name: "others", value: 0 }
            ]
        },

        violations: [{
            officer: String,
            reason: String,
            amount: Number,
            date: { type: Date, default: Date.now },
            paid: { type: Boolean, default: false }
        }],

        completed_missions: { type: Array, default: [] },

        serviceBlocked: {
            status: { type: Boolean, default: false },
            type: { type: String, default: null }
        }
    }],

    points: {
        id: { type: Number, default: 0 },
        gmc: { type: Number, default: 0 },
        start_game: { type: Number, default: 0 },
        join_game: { type: Number, default: 0 },
        take_ticket: { type: Number, default: 0 },
        take_report: { type: Number, default: 0 },
        others: { type: Number, default: 0 },
        tf3el: { type: Number, default: 0 }
    }
});

module.exports = model("userBase", Database);
