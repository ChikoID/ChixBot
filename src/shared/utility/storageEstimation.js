const Item = require("../../models/item");

class StorageEstimator {
    /**
     * Hitung estimasi waktu hingga storage penuh
     * @param {number} currentStorage - Total item saat ini
     * @param {number} maxStorage - Kapasitas maksimal
     * @returns {Promise<Object>} { minutesToFull, formattedTime, isFull }
     */
    static async calculateTimeToFull(currentStorage, maxStorage) {
        const spaceLeft = maxStorage - currentStorage;

        if (spaceLeft <= 0) {
            return {
                minutesToFull: 0,
                formattedTime: "Storage penuh!",
                isFull: true,
            };
        }

        const items = await Item.list();
        const totalDropRate = items.reduce((sum, item) => sum + item.drop_rate, 0);

        if (totalDropRate === 0) {
            return {
                minutesToFull: Infinity,
                formattedTime: "Tidak ada produksi",
                isFull: false,
            };
        }

        const minutesToFull = spaceLeft / totalDropRate;

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
     * @returns {number} Jumlah item yang diproduksi
     */
    static calculateProduction(minutes, dropRate) {
        return Math.floor(minutes * dropRate);
    }
}

module.exports = StorageEstimator;
