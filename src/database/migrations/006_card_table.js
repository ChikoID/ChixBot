module.exports = {
    name: "006_card_table",
    async up({ runAsync }) {
        await runAsync(`CREATE TABLE IF NOT EXISTS cards (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            price INTEGER,
            rarity TEXT,
            power INTEGER,
            effect TEXT,
            stickerPath TEXT,
            created_at TEXT DEFAULT (datetime('now')),
            updated_at TEXT DEFAULT (datetime('now'))
            )`);
    },
    async down({ runAsync }) {
        await runAsync("DROP TABLE IF EXISTS cards");
    },
};
