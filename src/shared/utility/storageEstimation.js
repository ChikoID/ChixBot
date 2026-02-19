const Item = require("../../models/item");

class StorageEstimator {
    static resolveIdleSpeedMultiplier(player = {}) {
        const rawDirectMultiplier = Number(player?.idle_speed_multiplier ?? player?.idle_speed ?? 0);
        const directMultiplier =
            Number.isFinite(rawDirectMultiplier) && rawDirectMultiplier > 0 ? rawDirectMultiplier : 0;

        const rawSpeedLevel = Number(player?.idle_speed_level ?? player?.speed_level ?? 0);
        const speedLevel = Number.isFinite(rawSpeedLevel) && rawSpeedLevel > 0 ? Math.floor(rawSpeedLevel) : 0;

        const rawSpeedPerLevel = Number(process.env.IDLE_SPEED_PER_LEVEL ?? 0.1);
        const speedPerLevel = Number.isFinite(rawSpeedPerLevel) && rawSpeedPerLevel > 0 ? rawSpeedPerLevel : 0;

        const levelMultiplier = 1 + speedLevel * speedPerLevel;
        const candidateMultiplier = directMultiplier > 0 ? directMultiplier : levelMultiplier;

        const rawMaxMultiplier = Number(process.env.IDLE_SPEED_MAX_MULTIPLIER ?? 10);
        const maxMultiplier = Number.isFinite(rawMaxMultiplier) && rawMaxMultiplier > 0 ? rawMaxMultiplier : 10;

        if (!Number.isFinite(candidateMultiplier) || candidateMultiplier <= 0) {
            return 1;
        }

        return Math.min(candidateMultiplier, maxMultiplier);
    }

    /**
     * Hitung estimasi waktu hingga storage penuh
     * @param {number} currentStorage - Total item saat ini
     * @param {number} maxStorage - Kapasitas maksimal
     * @param {Object} player - Data user untuk speed upgrade
     * @returns {Promise<Object>} { minutesToFull, formattedTime, isFull }
     */
    static async calculateTimeToFull(currentStorage, maxStorage, player = {}) {
        const safeCurrentStorage = Number.isFinite(Number(currentStorage)) ? Number(currentStorage) : 0;
        const safeMaxStorage = Number.isFinite(Number(maxStorage)) ? Number(maxStorage) : 0;
        const spaceLeft = safeMaxStorage - safeCurrentStorage;

        if (spaceLeft <= 0) {
            return {
                minutesToFull: 0,
                formattedTime: "Storage penuh!",
                isFull: true,
            };
        }

        const items = await Item.list();
        const idleItems = items.filter((i) => i.is_idle_item === 1);
        const rawEfficiency = Number(process.env.IDLE_EFFICIENCY || 0.35);
        const efficiency = Number.isFinite(rawEfficiency) && rawEfficiency > 0 ? rawEfficiency : 0;
        const speedMultiplier = this.resolveIdleSpeedMultiplier(player);
        const productionPerMinute = idleItems.reduce(
            (sum, item) => sum + item.drop_rate * efficiency * speedMultiplier,
            0,
        );

        if (productionPerMinute <= 0) {
            return {
                minutesToFull: Infinity,
                formattedTime: "Tidak ada produksi",
                isFull: false,
            };
        }

        const minutesToFull = spaceLeft / productionPerMinute;

        return {
            minutesToFull,
            formattedTime: this.formatTime(minutesToFull),
            isFull: false,
        };
    }

    /**
     * Format waktu ke format yang mudah dibaca
     * @param {number} minutes - Waktu dalam menit
     * @returns {string} Format waktu (menit/jam/hari)
     */
    static formatTime(minutes) {
        if (minutes < 1) {
            return `~${Math.ceil(minutes * 60)} detik`;
        } else if (minutes < 60) {
            return `~${Math.ceil(minutes)} menit`;
        } else if (minutes < 1440) {
            const hours = Math.floor(minutes / 60);
            const mins = Math.ceil(minutes % 60);
            return `~${hours} jam ${mins} menit`;
        } else {
            const days = Math.floor(minutes / 1440);
            const hours = Math.floor((minutes % 1440) / 60);
            return `~${days} hari ${hours} jam`;
        }
    }

    /**
     * Hitung total drop rate per menit
     * @returns {Promise<number>}
     */
    static async getTotalDropRate() {
        const items = await Item.list();
        return items.reduce((sum, item) => sum + item.drop_rate, 0);
    }

    /**
     * Hitung produksi item dalam waktu tertentu
     * @param {number} minutes - Waktu dalam menit
     * @param {number} dropRate - Drop rate item
     * @param {Object} player - Data user untuk speed upgrade
     * @returns {number} Jumlah item yang diproduksi
     */
    static calculateProduction(minutes, dropRate, player = {}) {
        const safeMinutes = Number.isFinite(Number(minutes)) ? Number(minutes) : 0;
        const safeDropRate = Number.isFinite(Number(dropRate)) ? Number(dropRate) : 0;
        const rawEfficiency = Number(process.env.IDLE_EFFICIENCY || 0.35);
        const efficiency = Number.isFinite(rawEfficiency) && rawEfficiency > 0 ? rawEfficiency : 0;
        const speedMultiplier = this.resolveIdleSpeedMultiplier(player);
        return Math.floor(safeMinutes * safeDropRate * efficiency * speedMultiplier);
    }
}

module.exports = StorageEstimator;
