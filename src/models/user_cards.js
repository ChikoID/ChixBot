const { runAsync, getAsync, allAsync } = require("../shared/configuration/database");

class UserCards {
    static async create(userId, cardId, quantity = 1) {
        return await runAsync(`INSERT INTO user_cards (user_id, card_id, quantity) VALUES (?, ?, ?)`, [
            userId,
            cardId,
            quantity,
        ]);
    }

    static async getById(id) {
        return await getAsync(`SELECT * FROM user_cards WHERE id = ?`, [id]);
    }

    static async list() {
        return await allAsync(`SELECT * FROM user_cards ORDER BY created_at DESC`);
    }

    static async listWithDetails() {
        return await allAsync(`
            SELECT 
                uc.id,
                uc.quantity,
                uc.created_at,
                uc.updated_at,
                u.id AS user_id,
                u.username,
                u.phone,
                c.id AS card_id,
                c.name AS card_name,
                c.rarity,
                c.power,
                c.effect,
                c.stickerPath,
                c.price
            FROM user_cards uc
            JOIN users u ON uc.user_id = u.id
            JOIN cards c ON uc.card_id = c.id
            ORDER BY uc.created_at DESC
        `);
    }

    static async getByUser(userId) {
        return await getAsync(
            `
            SELECT 
                uc.id,
                uc.quantity,
                uc.created_at,
                uc.updated_at,
                c.id AS card_id,
                c.name AS card_name,
                c.rarity,
                c.power,
                c.effect,
                c.stickerPath,
                c.price
            FROM user_cards uc
            JOIN cards c ON uc.card_id = c.id
            WHERE uc.user_id = ?
        `,
            [userId],
        );
    }

    static async getAllByUser(userId) {
        return await allAsync(
            `
            SELECT 
                uc.id,
                uc.quantity,
                uc.created_at,
                uc.updated_at,
                c.id AS card_id,
                c.name AS card_name,
                c.rarity,
                c.power,
                c.effect,
                c.stickerPath,
                c.price
            FROM user_cards uc
            JOIN cards c ON uc.card_id = c.id
            WHERE uc.user_id = ?
            ORDER BY c.rarity, c.name
        `,
            [userId],
        );
    }

    static async updateOrCreate(userId, cardId, quantity = 1) {
        return await this.addToUserCards(userId, cardId, quantity);
    }

    static async update(id, quantity) {
        return await runAsync(
            `UPDATE user_cards 
             SET quantity = ?, updated_at = datetime('now') 
             WHERE id = ?`,
            [quantity, id],
        );
    }

    static async addToUserCards(userId, cardId, quantity = 1) {
        const existing = await getAsync(`SELECT * FROM user_cards WHERE user_id = ? AND card_id = ?`, [userId, cardId]);

        if (existing) {
            return await runAsync(
                `UPDATE user_cards 
                 SET quantity = quantity + ?, updated_at = datetime('now')
                 WHERE user_id = ? AND card_id = ?`,
                [quantity, userId, cardId],
            );
        }

        return await runAsync(`INSERT INTO user_cards (user_id, card_id, quantity) VALUES (?, ?, ?)`, [
            userId,
            cardId,
            quantity,
        ]);
    }

    static async delete(id) {
        return await runAsync(`DELETE FROM user_cards WHERE id = ?`, [id]);
    }
}

module.exports = UserCards;
