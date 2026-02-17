module.exports = {
    name: "001_user_table",
    async up({ runAsync }) {
        await runAsync(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT, 
            phoneId TEXT UNIQUE,
            name TEXT DEFAULT 'Player',
            chix INTEGER DEFAULT 0,
            storage_cap INTEGER DEFAULT 100,
            last_update INTEGER DEFAULT 0,
            daily_streak INTEGER DEFAULT 0,
            daily_streak_date INTEGER DEFAULT 0,
            created_at TEXT DEFAULT (datetime('now')),
            updated_at TEXT DEFAULT (datetime('now'))
            )`);
    },
    async down({ runAsync }) {
        await runAsync("DROP TABLE IF EXISTS users");
    },
};
