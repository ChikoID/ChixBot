const { runAsync, getAsync, allAsync } = require("../shared/configuration/database");

class Item {
    static async create(name, price, rarity, dropRate) {
        await runAsync("INSERT INTO items (name, price, rarity, drop_rate) VALUES (?, ?, ?, ?)", [name, price, rarity, dropRate]);
        return await this.getById(this.lastID);
    }

    static async getById(id) {
        return await getAsync("SELECT * FROM items WHERE id = ?", [id]);
    }

    static async getByName(name) {
        return await getAsync("SELECT * FROM items WHERE name = ?", [name]);
    }

    static async list() {
        return allAsync("SELECT * FROM items ORDER BY id ASC");
    }

    static async update(id, name, price, rarity, dropRate) {
        return await runAsync("UPDATE items SET name = ?, price = ?, rarity = ?, drop_rate = ? WHERE id = ?", [name, price, rarity, dropRate, id]);
    }

    static async delete(id) {
        return await runAsync("DELETE FROM items WHERE id = ?", [id]);
    }
}

module.exports = Item;
