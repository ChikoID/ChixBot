const { runAsync, getAsync, allAsync } = require("../shared/configuration/database");

class User {
    static async create(phoneId) {
        await runAsync("INSERT INTO users (phoneId) VALUES (?)", [phoneId]);
        return this.getByPhone(phoneId);
    }

    static getByPhone(phoneId) {
        return getAsync("SELECT * FROM users WHERE phoneId = ?", [phoneId]);
    }

    static list() {
        return allAsync("SELECT * FROM users ORDER BY id ASC");
    }
}

module.exports = User;
