const { runAsync, getAsync, allAsync } = require("../shared/configuration/database");

class ItemLimited {
    static async create(name, price, quantity) {
        const result = await runAsync("INSERT INTO items_limited (name, price, quantity) VALUES (?, ?, ?)", [name, price, quantity]);
        return await this.getById(result.lastID);
    }

    static async getById(id) {
        return await getAsync("SELECT * FROM items_limited WHERE id = ?", [id]);
    }

    static async getByName(name) {
        return await getAsync("SELECT * FROM items_limited WHERE name = ?", [name]);
    }

    static async list() {
        return allAsync("SELECT * FROM items_limited ORDER BY id ASC");
    }

    static async update(id, name, price, quantity) {
        return await runAsync("UPDATE items_limited SET name = ?, price = ?, quantity = ? WHERE id = ?", [name, price, quantity, id]);
    }

    static async delete(id) {
        return await runAsync("DELETE FROM items_limited WHERE id = ?", [id]);
    }
}

module.exports = ItemLimited;
