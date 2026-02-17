const { runAsync, getAsync, allAsync } = require("../shared/configuration/database");

class ItemLimited {
    static async create(unique_id, name, price, quantity) {
        const result = await runAsync("INSERT INTO items_limited (unique_id, name, price, quantity) VALUES (?, ?, ?, ?)", [unique_id, name, price, quantity]);
        return await this.getById(result.lastID);
    }

    static async getById(id) {
        return await getAsync("SELECT * FROM items_limited WHERE id = ?", [id]);
    }

    static async getByName(name) {
        return await getAsync("SELECT * FROM items_limited WHERE name = ?", [name]);
    }

    static async getByUniqueId(unique_id) {
        return await getAsync("SELECT * FROM items_limited WHERE unique_id = ?", [unique_id]);
    }

    static async list() {
        return allAsync("SELECT * FROM items_limited ORDER BY id ASC");
    }

    static async update(id, unique_id, name, price, quantity) {
        return await runAsync("UPDATE items_limited SET unique_id = ?, name = ?, price = ?, quantity = ? WHERE id = ?", [unique_id, name, price, quantity, id]);
    }

    static async delete(id) {
        return await runAsync("DELETE FROM items_limited WHERE id = ?", [id]);
    }

    static async deleteByUniqueId(unique_id) {
        return await runAsync("DELETE FROM items_limited WHERE unique_id = ?", [unique_id]);
    }

    static async decreaseStock(id, amount = 1) {
        return await runAsync("UPDATE items_limited SET quantity = quantity - ?, updated_at = datetime('now') WHERE id = ? AND quantity >= ?", [amount, id, amount]);
    }

    static async increaseStock(id, amount = 1) {
        return await runAsync("UPDATE items_limited SET quantity = quantity + ?, updated_at = datetime('now') WHERE id = ?", [amount, id]);
    }

    static async getDynamicPrice(item) {
        const basePrice = item.price;
        const maxQuantity = 100;
        const currentStock = item.quantity;
        
        const scarcityMultiplier = 1 + ((maxQuantity - currentStock) / maxQuantity) * 0.5;
        
        return Math.floor(basePrice * scarcityMultiplier);
    }
}

module.exports = ItemLimited;
