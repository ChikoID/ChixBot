const { runAsync, getAsync, allAsync } = require("../shared/configuration/database");

class Item {
    static async create(name, price, rarity, dropRate, isIdleItem = 1) {
        const result = await runAsync(
            "INSERT INTO items (name, price, rarity, drop_rate, is_idle_item) VALUES (?, ?, ?, ?, ?)",
            [name, price, rarity, dropRate, isIdleItem],
        );
        return await this.getById(result.lastID);
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

    static async update(id, name, price, rarity, dropRate, isIdleItem) {
        return await runAsync(
            "UPDATE items SET name = ?, price = ?, rarity = ?, drop_rate = ?, is_idle_item = ? WHERE id = ?",
            [name, price, rarity, dropRate, isIdleItem, id],
        );
    }

    static async delete(id) {
        return await runAsync("DELETE FROM items WHERE id = ?", [id]);
    }
}

module.exports = Item;
