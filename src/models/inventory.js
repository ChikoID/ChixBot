const { runAsync, getAsync, allAsync } = require("../shared/configuration/database");

class Inventory {
    static async create(userId, itemId, quantity) {
        await runAsync("INSERT INTO inventory (user_id, item_id, quantity) VALUES (?, ?, ?)", [userId, itemId, quantity]);
        return await this.getById(this.lastID);
    }

    static async getById(id) {
        return await getAsync("SELECT * FROM inventory WHERE id = ?", [id]);
    }

    static async list() {
        return allAsync("SELECT * FROM inventory ORDER BY id ASC");
    }

    static async getByUser(userId) {
        return allAsync("SELECT * FROM inventory WHERE user_id = ?", [userId]);
    }

    static async getAllByUser(userId) {
        return allAsync("SELECT inventory.*, items.name, items.drop_rate FROM inventory JOIN items ON inventory.item_id = items.id WHERE inventory.user_id = ?", [userId]);
    }

    static async getByUserAndItem(userId, itemId) {
        return await getAsync("SELECT * FROM inventory WHERE user_id = ? AND item_id = ?", [userId, itemId]);
    }

    static async updateOrCreate(inv) {
        const existing = await this.getByUserAndItem(inv.user_id, inv.item_id);

        if (existing) {
            return await this.update(existing.id, inv.user_id, inv.item_id, inv.quantity);
        } else {
            return await this.create(inv.user_id, inv.item_id, inv.quantity);
        }
    }

    static async update(id, userId, itemId, quantity) {
        return await runAsync("UPDATE inventory SET user_id = ?, item_id = ?, quantity = ? WHERE id = ?", [userId, itemId, quantity, id]);
    }

    static async delete(id) {
        return await runAsync("DELETE FROM inventory WHERE id = ?", [id]);
    }
}

module.exports = Inventory;
