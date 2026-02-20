module.exports = {
    name: "007_user_cards_table",
    async up({ runAsync }) {
        await runAsync(`CREATE TABLE IF NOT EXISTS user_cards (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            card_id INTEGER NOT NULL,
            quantity INTEGER DEFAULT 1,
            created_at TEXT DEFAULT (datetime('now')),
            updated_at TEXT DEFAULT (datetime('now')),
            FOREIGN KEY (user_id) REFERENCES users(id),
            FOREIGN KEY (card_id) REFERENCES cards(id)
            )`);
    },
    async down({ runAsync }) {
        await runAsync("DROP TABLE IF EXISTS user_cards");
    },
};
