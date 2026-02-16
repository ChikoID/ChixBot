const { runAsync, getAsync, allAsync } = require("../shared/configuration/database");

class UserModel {
    static async create(phone, balance = 0) {
        await runAsync("INSERT INTO users (phone, balance) VALUES (?, ?)", [phone, balance]);
        return this.getByPhone(phone);
    }

    static getByPhone(phone) {
        return getAsync("SELECT * FROM users WHERE phone = ?", [phone]);
    }

    static async setBalance(phone, balance) {
        await runAsync("UPDATE users SET balance = ? WHERE phone = ?", [balance, phone]);
        return this.getByPhone(phone);
    }

    static async addBalance(phone, amount) {
        await runAsync("UPDATE users SET balance = balance + ? WHERE phone = ?", [amount, phone]);
        return this.getByPhone(phone);
    }

    static list() {
        return allAsync("SELECT * FROM users ORDER BY id ASC");
    }
}

module.exports = UserModel;
