module.exports = {
    name: "003_item_limited",
    async up({ runAsync }) {
        await runAsync(`CREATE TABLE IF NOT EXISTS items_limited (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            unique_id TEXT UNIQUE,
            name TEXT,
            price INTEGER,
            quantity INTEGER DEFAULT 0,
            created_at TEXT DEFAULT (datetime('now')),
            updated_at TEXT DEFAULT (datetime('now'))
            )`)
    },
    async down({ runAsync }) {},
}