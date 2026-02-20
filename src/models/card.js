const { runAsync, getAsync, allAsync } = require("../shared/configuration/database");

class Card {
    static async create(name, price, rarity, power, effect, stickerPath = null) {
        const result = await runAsync(
            "INSERT INTO cards (name, price, rarity, power, effect, stickerPath) VALUES (?, ?, ?, ?, ?, ?)",
            [name, price, rarity, power, effect, stickerPath],
        );
        return await this.getById(result.lastID);
    }

    static async getById(id) {
        return await getAsync("SELECT * FROM cards WHERE id = ?", [id]);
    }

    static async list() {
        return allAsync("SELECT * FROM cards ORDER BY id ASC");
    }

    static async update(id, name, price, rarity, power, effect, stickerPath) {
        return await runAsync(
            "UPDATE cards SET name = ?, price = ?, rarity = ?, power = ?, effect = ?, stickerPath = ? WHERE id = ?",
            [name, price, rarity, power, effect, stickerPath, id],
        );
    }

    static async delete(id) {
        return await runAsync("DELETE FROM cards WHERE id = ?", [id]);
    }
}

module.exports = Card;
