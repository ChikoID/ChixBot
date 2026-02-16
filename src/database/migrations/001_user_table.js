module.exports = {
    name: "001_user_table",
    async up({ runAsync }) {
        await runAsync(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT, 
            phone TEXT UNIQUE,
            balance INTEGER DEFAULT 0,
            created_at TEXT DEFAULT (datetime('now'))
            )`);
    },
    async down({ runAsync }) {
        await runAsync("DROP TABLE IF EXISTS users");
    },
};
