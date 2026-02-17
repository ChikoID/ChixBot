module.exports = {
    name: "004_inventory_table",
    async up({ runAsync }) {
        await runAsync(`CREATE TABLE IF NOT EXISTS inventory (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            item_id INTEGER,
            item_type TEXT DEFAULT 'items',
            quantity INTEGER DEFAULT 1,
            created_at TEXT DEFAULT (datetime('now')),
            updated_at TEXT DEFAULT (datetime('now')),
            FOREIGN KEY (user_id) REFERENCES users(id)
            )`);
    },
    async down({ runAsync }) {
        await runAsync("DROP TABLE IF EXISTS inventory");
    },
};
