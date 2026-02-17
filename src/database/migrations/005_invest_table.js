module.exports = {
    name: "005_invest_table",
    async up({ runAsync }) {
        await runAsync(`CREATE TABLE IF NOT EXISTS investments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            principal INTEGER NOT NULL,
            rate REAL NOT NULL,
            duration INTEGER NOT NULL,
            created_at TEXT DEFAULT (datetime('now')),
            updated_at TEXT DEFAULT (datetime('now')),
            FOREIGN KEY (user_id) REFERENCES users(id),
            CHECK (principal > 0),
            CHECK (rate >= 0),
            CHECK (duration > 0),
            UNIQUE(user_id)
        )
        `);
    },
    async down({ runAsync }) {
        await runAsync("DROP TABLE IF EXISTS investments");
    },
};
