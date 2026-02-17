module.exports = {
    name: "002_item_table",
    async up({ runAsync }) {
        await runAsync(`CREATE TABLE IF NOT EXISTS items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            price INTEGER,
            rarity TEXT,
            drop_rate REAL,
            is_idle_item INTEGER DEFAULT 1,
            created_at TEXT DEFAULT (datetime('now')),
            updated_at TEXT DEFAULT (datetime('now'))
            )`);
    },
    async down({ runAsync }) {
        await runAsync("DROP TABLE IF EXISTS items");
    },
};
