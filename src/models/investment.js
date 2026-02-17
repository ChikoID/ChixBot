const { runAsync, getAsync } = require("../shared/configuration/database");

class Investment {
    static async create(userId, principal, rate, duration) {
        const result = await runAsync("INSERT INTO investments (user_id, principal, rate, duration) VALUES (?, ?, ?, ?)", [userId, principal, rate, duration]);
        return await this.getById(result.lastID);
    }

    static async getById(id) {
        return await getAsync("SELECT * FROM investments WHERE id = ?", [id]);
    }

    static async getByUser(userId) {
        return await getAsync("SELECT * FROM investments WHERE user_id = ? ORDER BY id DESC LIMIT 1", [userId]);
    }

    static async delete(id) {
        return await runAsync("DELETE FROM investments WHERE id = ?", [id]);
    }

    static calculateSnapshot(investment, now = Date.now()) {
        const principal = Number(investment?.principal || 0);
        const rate = Number(investment?.rate || 0);
        const durationMinutes = Number(investment?.duration || 0);

        const penaltyRateRaw = Number(process.env.INVEST_PENALTY_RATE || 0.03);
        const penaltyIntervalRaw = Number(process.env.INVEST_PENALTY_INTERVAL_MINUTES || 60);
        const penaltyRate = Number.isFinite(penaltyRateRaw) && penaltyRateRaw > 0 && penaltyRateRaw < 1 ? penaltyRateRaw : 0;
        const penaltyIntervalMinutes = Number.isFinite(penaltyIntervalRaw) && penaltyIntervalRaw > 0 ? penaltyIntervalRaw : 60;

        const createdAtMs = this.parseCreatedAt(investment?.created_at);
        const durationMs = durationMinutes * 60000;
        const unlockAt = createdAtMs + durationMs;

        const maturedValue = Math.max(0, Math.floor(principal * (1 + rate)));
        const isMatured = now >= unlockAt;

        if (!isMatured) {
            const remainingMs = Math.max(0, unlockAt - now);
            return {
                isMatured,
                principal,
                maturedValue,
                withdrawValue: 0,
                remainingMs,
                overdueMs: 0,
                penaltySteps: 0,
                penaltyRate,
                penaltyIntervalMinutes,
                unlockAt,
            };
        }

        const overdueMs = Math.max(0, now - unlockAt);
        const penaltySteps = Math.floor(overdueMs / (penaltyIntervalMinutes * 60000));
        const decayFactor = penaltyRate > 0 ? Math.pow(1 - penaltyRate, penaltySteps) : 1;
        const withdrawValue = Math.max(0, Math.floor(maturedValue * decayFactor));

        return {
            isMatured,
            principal,
            maturedValue,
            withdrawValue,
            remainingMs: 0,
            overdueMs,
            penaltySteps,
            penaltyRate,
            penaltyIntervalMinutes,
            unlockAt,
        };
    }

    static parseCreatedAt(createdAt) {
        if (typeof createdAt !== "string" || createdAt.length === 0) return Date.now();

        const iso = createdAt.replace(" ", "T") + "Z";
        const parsed = Date.parse(iso);
        if (Number.isFinite(parsed)) return parsed;

        const fallback = Date.parse(createdAt);
        return Number.isFinite(fallback) ? fallback : Date.now();
    }
}

module.exports = Investment;