const { runAsync, getAsync, allAsync } = require("../shared/configuration/database");
const Item = require("./item");
const ItemLimited = require("./itemLimited");

class Inventory {
    static async create(userId, itemId, quantity, itemType = "items") {
        const result = await runAsync(
            "INSERT INTO inventory (user_id, item_id, item_type, quantity) VALUES (?, ?, ?, ?)",
            [userId, itemId, itemType, quantity],
        );
        return await this.getById(result.lastID);
    }

    static async getById(id) {
        return await getAsync("SELECT * FROM inventory WHERE id = ?", [id]);
    }

    static async list() {
        return allAsync("SELECT * FROM inventory ORDER BY id ASC");
    }

    static async listWithDetails() {
        return allAsync(
            `SELECT
                inventory.*,
                users.name AS username,
                COALESCE(items.name, items_limited.name) AS item_name,
                COALESCE(items.price, items_limited.price) AS item_price
            FROM inventory
            LEFT JOIN users ON users.id = inventory.user_id
            LEFT JOIN items ON inventory.item_type = 'items' AND inventory.item_id = items.id
            LEFT JOIN items_limited ON inventory.item_type = 'items_limited' AND inventory.item_id = items_limited.id
            ORDER BY inventory.id ASC`,
        );
    }

    static async getByUser(userId) {
        return allAsync("SELECT * FROM inventory WHERE user_id = ?", [userId]);
    }

    static async getAllByUser(userId) {
        return allAsync(
            `SELECT
                inventory.*,
                COALESCE(items.name, items_limited.name) AS name,
                COALESCE(items.price, items_limited.price) AS price,
                items.drop_rate
            FROM inventory
            LEFT JOIN items ON inventory.item_type = 'items' AND inventory.item_id = items.id
            LEFT JOIN items_limited ON inventory.item_type = 'items_limited' AND inventory.item_id = items_limited.id
            WHERE inventory.user_id = ?
            ORDER BY inventory.id ASC`,
            [userId],
        );
    }

    static async getByUserAndItem(userId, itemId, itemType = "items") {
        return await getAsync("SELECT * FROM inventory WHERE user_id = ? AND item_id = ? AND item_type = ?", [
            userId,
            itemId,
            itemType,
        ]);
    }

    static async getItemDetails(inventory) {
        if (inventory.item_type === "items") {
            return await Item.getById(inventory.item_id);
        }

        if (inventory.item_type === "items_limited") {
            return await ItemLimited.getById(inventory.item_id);
        }

        return null;
    }

    static async updateOrCreate(inv) {
        const itemType = inv.item_type || "items";

        const existing = await this.getByUserAndItem(inv.user_id, inv.item_id, itemType);

        if (existing) {
            await runAsync(
                "UPDATE inventory SET quantity = ?, updated_at = datetime('now') WHERE user_id = ? AND item_id = ? AND item_type = ?",
                [inv.quantity, inv.user_id, inv.item_id, itemType],
            );
            return await this.getByUserAndItem(inv.user_id, inv.item_id, itemType);
        } else {
            return await this.create(inv.user_id, inv.item_id, inv.quantity, itemType);
        }
    }

    static async update(id, userId, itemId, quantity, itemType = "items") {
        return await runAsync(
            "UPDATE inventory SET user_id = ?, item_id = ?, item_type = ?, quantity = ?, updated_at = datetime('now') WHERE id = ?",
            [userId, itemId, itemType, quantity, id],
        );
    }

    static async addToInventory(userId, itemId, amount = 1, itemType = "items") {
        // Khusus untuk increment quantity (market buy)
        const existing = await this.getByUserAndItem(userId, itemId, itemType);

        if (existing) {
            await runAsync(
                "UPDATE inventory SET quantity = quantity + ?, updated_at = datetime('now') WHERE user_id = ? AND item_id = ? AND item_type = ?",
                [amount, userId, itemId, itemType],
            );
            return await this.getByUserAndItem(userId, itemId, itemType);
        } else {
            return await this.create(userId, itemId, amount, itemType);
        }
    }

    static async delete(id) {
        return await runAsync("DELETE FROM inventory WHERE id = ?", [id]);
    }
}

module.exports = Inventory;
