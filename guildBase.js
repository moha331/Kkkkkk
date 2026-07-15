const { Schema, model } = require('mongoose');

const Database = new Schema({
    guild: String,
    suggestions_channel: String,
    inquiries_channel: String,
    welcome_channel: String,
    leave_channel: String,
    activate_channel: String,
    creator_channel: String,
    administrative_channel: String,
    role_menu: Array,
    band_menu: Array,
    mute_menu: Array,
    name_log: String,
    guild_items: Array,
    builds: Array,
    headquarters: Array,
    cars: Array,
    heli: Array,
    storage: Array,
    storage1: Array,
    storage2: Array,
    storage3: Array,
    store: Array,
    paramedic_wings: Array,
    police_wings: Array,
    auto_images: Map,
    auto_role: String,
    paramedicjoins: Array,
    warehouse_admin: String,
    gang_log: String,  
    idd: {
        admin: String,
        channel: String,
        role: String,
        log: String
    },

    //تست برمجتي
    gang_admin: { type: String, default: "" },
    gang_admin_log: { type: String, default: "" },

    // ============ GANG SYSTEM (existing + new additions marked NEW) ============
    gangs: [
      {
        name: { type: String },
        bossIdentity: { type: Number },
        deputyIdentity: { type: Number },
        color: { type: String },
        image: { type: String },

        // NEW: shown as "official / unofficial" badge next to the gang name
        official: { type: Boolean, default: false },

        points: { type: Number, default: 0 },
        xp: { type: Number, default: 0 },

        // NEW: which battle-pass levels this gang has already been auto-rewarded for,
        // so the reward-grant job never gives the same level twice
        grantedLevels: { type: [Number], default: [] },

        // NEW: turf zones currently held by this gang
        turfs: { type: [String], default: [] },

        members: [
          {
            identity: { type: Number },
            role: { type: String, default: "member" }, // boss / deputy / member

            // NEW: per-member leaderboard stats (shown in the player leaderboard)
            xp: { type: Number, default: 0 },
            flags: { type: Number, default: 0 },
            arrests: { type: Number, default: 0 },
            kills: { type: Number, default: 0 },
            deaths: { type: Number, default: 0 }
          }
        ]
      }
    ],

    // Battle-pass level definitions, shared across all gangs.
    // Each entry: { level, name, icon, requiredXp, rewardType, description }
    // rewardType: "item" | "gang_upgrade" | "mystery_box"
    gang_levels: {
        type: Array,
        default: []
    },

    gang_tasks: {
      points: [
          {
          id: { type: Number },
          gangName: { type: String },
          title: { type: String },
          reward: { type: Number },
          status: { type: String, default: "pending" }
        }
      ],
      projects: {
        type: Array,
        default: []
      },

      xp: [
        {
          id: { type: Number },
          gangName: { type: String },
          title: { type: String },
          reward: { type: Number },
          status: { type: String, default: "pending" }
        }
      ]
    },

    // NEW: server-wide gang events (Events tab)
    gang_events: {
        type: Array, // { id, title, description, startAt, endAt, rewardXp }
        default: []
    },

    // NEW: server-wide gang announcements (Announcements tab)
    gang_announcements: {
        type: Array, // { id, title, body, date, by }
        default: []
    },

    gang_xp_settings: {
        type: Object,
        default: {
            thefts: [],
            headquarters: [],
            items: []
        }
    },

    gang_missions: {
        type: Array,
        default: []
    },

    gang_item_treasury: {
        type: Array,
        default: []
    },

    gang_clubhouse_settings: {
        type: Object,
        default: {
            price: 0,
            xpRequired: 0,
            laundryPrice: 0,
            laundryXpRequired: 0,
            dirtyMoneyPool: 0
        }
    },

    gang_clubhouse: {
        type: Object,
        default: {
            purchased: false,
            moneyLaundry: {
                dirtyMoney: 0,
                cleanStorage: 0
            }
        }
    },
    // ============ END GANG SYSTEM ============

    points_admin: String,
    games_admin: String,
    joins: Array,
    policejoins: Array,
    paramedicejoins: Array,
    game: { type: Boolean, default: false },
    gameStartAt: { type: Number, default: null },
    staff_role: String,
    game_channels: {
        start_game: String,
        ads: String,
        join: String
    },
    jobStats: {
        totalMoney: { type: Number, default: 0 },
        taxi: { money: { type: Number, default: 0 }, count: { type: Number, default: 0 } },
        pizza: { money: { type: Number, default: 0 }, count: { type: Number, default: 0 } },
        fishing: { money: { type: Number, default: 0 }, count: { type: Number, default: 0 } },
        mining: { money: { type: Number, default: 0 }, count: { type: Number, default: 0 } },
        wood: { money: { type: Number, default: 0 }, count: { type: Number, default: 0 } },
        lastJob: { type: Number, default: 0 }
    },
    comes: { admin: String, channel: String, all: Array, log: String },
    tf3el: { add: Array, remove: Array, log: String },
    steal_prices: [{ name: String, price: Number }],
    job_prices: [{ name: String, price: Number }],
    warehouse: { items: { type: Array, default: [] } },
    warehouse_admin: { type: String, default: "" },
    priority_channel: { type: Object, default: {} },
    theft_alert_channel: { type: String, default: "" },
    priority_log: { type: String, default: "" },

    count: {
        support: { type: Number, default: 6000 },
        high_management: { type: Number, default: 7500 },
        complaint: { type: Number, default: 8500 },
        add_items: { type: Number, default: 4000 },
        store: { type: Number, default: 3000 },
        developing_problem: { type: Number, default: 2000 },
        officials: { type: Number, default: 0 },
        presidency: { type: Number, default: 0 },
        academy: { type: Number, default: 0 },
        affairs: { type: Number, default: 0 },
        affairs1: { type: Number, default: 0 },
        ems_presidency: { type: Number, default: 0 },
        ems_officials: { type: Number, default: 0 },
        ems_academy: { type: Number, default: 0 },
        justice_presidency: { type: Number, default: 0 },
        justice_officials: { type: Number, default: 0 },
        justice_academy: { type: Number, default: 0 }
    },

    claimed: [],
    bank_log: String,
    bank_admin: String,
    inv_admin: String,
    inv_log: String,
    status: Object,
    show_inv_channel: String,
    tshher_channel: String,
    magic_admin: String,
    gmc_admin: String,
    role_admin: String,
    band_admin: String,
    mute_admin: String,
    mafia_coin: String,
    police_admin: String,
    phone: { nineoneone: String, gmc: String },
    criminal_honor_levels: { type: Array, default: [] },
    criminal_honor_table_location: { type: String, default: null },
    criminal_honor_xp_settings: { type: Object, default: { thefts: [], items: [] } },

    levels: Object,
    make_log: String,
    police_log: String,
    blacklist: String,
    reasons: { type: Array, default: [] },
    ban_log: String,
    ban_chat_log: String,
    police_high: String,
    joinChannels: { login: String, list: String },
    policeListMessage: String,
    paramedicChannels: { login: String, list: String },
    justiceChannels: { login: String, list: String },
    criminal_missions: { type: Array, default: [] },
    listMessage: String,
    panic_cahnnel: String,
    updgrade_log: String,
    police_kick: String,
    police_roles: Array,
    police_sectors: Array,
    paramedic_admin: String,
    paramedic_roles: Array,
    paramedic_log: String,
    paramedicUpdgradeLog: String,
    paramedic_kick: String,
    weaponResources: Array,
    en3ashLog: String,
    administrative_admin: String,
    creator_admin: String,
    twitterLog: String,
    twitterPosts: String,
    deliveryLog: String,
    role_log: String,
    band_log: String,
    mute_log: String,
    warn_log: String,
    build_log: String,
    administrative_role: String,
    creator_role: String,
    warehouse_log: String,
    ban_team_channel: String,
    ban_team_admin: String,
    ban_team_role: String,
    report_team_role: String,
    partItems: Array,
    report_team_admin: String,
    report_team_channel: String,
    identity_team_channel: String,
    identity_team_admin: String,
    identity_team_role: String,
    log_team_channel: String,
    log_team_admin: String,
    log_team_role: String,
    compensation_team_channel: String,
    compensation_team_admin: String,
    compensation_team_role: String,
    violation: String,
    paramedicListMessage: String,
    paramedic_high: String,
    justicejoins: Array,
    justiceListMessage: String,
    justice_high: String,
    justice_admin: String,
    justice_roles: Array,
    justice_departments: Array,
    justice_specializations: Array,
    justice_log: String,
    justice_kick: String,
    admin_points_log: String,
    jobs_log: String,
    theft_log: String,
    theft_role: String,
    thefts: { type: Array, default: [] },
    locations: { type: Array, default: [] },
    weapons_store: { type: Array, default: [] }
});

module.exports = model("guildBase", Database);
