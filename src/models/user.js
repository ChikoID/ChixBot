const { runAsync, getAsync, allAsync } = require("../shared/configuration/database");

class User {
    static async create(phoneId, name = "Player") {
        const now = Date.now();
        await runAsync("INSERT INTO users (phoneId, name, last_update) VALUES (?, ?, ?)", [phoneId, name, now]);
        return await this.getByPhone(phoneId);
    }

    static async getByPhone(phoneId) {
        return await getAsync("SELECT * FROM users WHERE phoneId = ?", [phoneId]);
    }

    static async getById(id) {
        return await getAsync("SELECT * FROM users WHERE id = ?", [id]);
    }

    static async list() {
        return allAsync("SELECT * FROM users ORDER BY id ASC");
    }

    static async update(id, data) {
        const fields = Object.keys(data)
            .map((key) => `${key} = ?`)
            .join(", ");
        const values = Object.values(data);
        return await runAsync(`UPDATE users SET ${fields}, updated_at = datetime('now') WHERE id = ?`, [...values, id]);
    }
}

module.exports = User;
