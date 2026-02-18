const User = require("../../models/user");
const { ensureUser } = require("../../shared/utility/ensureUser");
const { applyFee } = require("../../shared/utility/fee");

function formatNumber(value) {
    return Number(value || 0).toLocaleString("id-ID");
}

function getCurrentSpeedLevel(user) {
    const raw = Number(user?.idle_speed_level ?? user?.speed_level ?? 0);
    return Number.isFinite(raw) && raw > 0 ? Math.floor(raw) : 0;
}

function getCurrentStorageCap(user) {
    const raw = Number(user?.storage_cap ?? 0);
    return Number.isFinite(raw) && raw > 0 ? Math.floor(raw) : 0;
}

function getSpeedPerLevel() {
    const raw = Number(process.env.IDLE_SPEED_PER_LEVEL ?? 0.1);
    return Number.isFinite(raw) && raw > 0 ? raw : 0.1;
}

function getBackpackPerLevel() {
    const raw = Number(process.env.UPGRADE_BACKPACK_PER_LEVEL ?? 50);
    return Number.isFinite(raw) && raw > 0 ? Math.floor(raw) : 50;
}

function getBaseStorageCap() {
    const raw = Number(process.env.BASE_STORAGE_CAP ?? 100);
    return Number.isFinite(raw) && raw > 0 ? Math.floor(raw) : 100;
}

function getCurrentBackpackLevel(user) {
    const storageCap = getCurrentStorageCap(user);
    const baseStorageCap = getBaseStorageCap();
    const backpackPerLevel = getBackpackPerLevel();

    if (storageCap <= baseStorageCap) return 0;
    return Math.floor((storageCap - baseStorageCap) / backpackPerLevel);
}

function getNextSpeedUpgradeCost(level) {
    const safeLevel = Number.isFinite(level) && level > 0 ? level : 0;
    const baseCostRaw = Number(process.env.UPGRADE_SPEED_BASE_COST ?? 500);
    const baseCost = Number.isFinite(baseCostRaw) && baseCostRaw > 0 ? Math.floor(baseCostRaw) : 500;

    const growthRaw = Number(process.env.UPGRADE_SPEED_COST_MULTIPLIER ?? 1.5);
    const growth = Number.isFinite(growthRaw) && growthRaw > 1 ? growthRaw : 1.5;

    return Math.max(1, Math.floor(baseCost * Math.pow(growth, safeLevel)));
}

function getNextBackpackUpgradeCost(level) {
    const safeLevel = Number.isFinite(level) && level > 0 ? level : 0;
    const baseCostRaw = Number(process.env.UPGRADE_BACKPACK_BASE_COST ?? 400);
    const baseCost = Number.isFinite(baseCostRaw) && baseCostRaw > 0 ? Math.floor(baseCostRaw) : 400;

    const growthRaw = Number(process.env.UPGRADE_BACKPACK_COST_MULTIPLIER ?? 1.4);
    const growth = Number.isFinite(growthRaw) && growthRaw > 1 ? growthRaw : 1.4;

    return Math.max(1, Math.floor(baseCost * Math.pow(growth, safeLevel)));
}

function getSpeedFeeRate() {
    const feeUpgradeRaw = Number(process.env.FEE_UPGRADE_SPEED_RATE);
    if (Number.isFinite(feeUpgradeRaw) && feeUpgradeRaw >= 0) return feeUpgradeRaw;

    const feeGenericRaw = Number(process.env.FEE_UPGRADE_RATE);
    if (Number.isFinite(feeGenericRaw) && feeGenericRaw >= 0) return feeGenericRaw;

    return 0.05;
}

function getBackpackFeeRate() {
    const feeUpgradeRaw = Number(process.env.FEE_UPGRADE_BACKPACK_RATE);
    if (Number.isFinite(feeUpgradeRaw) && feeUpgradeRaw >= 0) return feeUpgradeRaw;

    const feeGenericRaw = Number(process.env.FEE_UPGRADE_RATE);
    if (Number.isFinite(feeGenericRaw) && feeGenericRaw >= 0) return feeGenericRaw;

    return 0.05;
}

function getFeeBoundaries() {
    const feeMin = process.env.MINIMUM_FEE ? parseInt(process.env.MINIMUM_FEE, 10) : 1;
    const feeMax = process.env.MAXIMUM_FEE ? parseInt(process.env.MAXIMUM_FEE, 10) : Infinity;
    return { feeMin, feeMax };
}

module.exports = {
    name: "upgrade",
    description: "Upgrade speed atau backpack dengan biaya (fee), dan cek info biaya upgrade berikutnya.",
    aliases: ["up"],
    /**
     * @param {import("whatsapp-web.js").Message} message
     * @param {import("whatsapp-web.js").Client} client
     * @param {string[]} args
     */
    async execute(message, client, args) {
        const user = await ensureUser(message);
        if (!user) return;

        const prefix = process.env.PREFIX || "!";
        const target = String(args[0] || "").toLowerCase();
        const { feeMin, feeMax } = getFeeBoundaries();

        switch (target) {
            case "speed": {
                const currentLevel = getCurrentSpeedLevel(user);
                const nextLevel = currentLevel + 1;
                const speedPerLevel = getSpeedPerLevel();
                const nextCost = getNextSpeedUpgradeCost(currentLevel);

                const feeRate = getSpeedFeeRate();
                const { fee } = applyFee(nextCost, feeRate, { minFee: feeMin, maxFee: feeMax });

                const totalCost = nextCost + fee;
                const currentBalance = Number(user.chix || 0);

                if (currentBalance < totalCost) {
                    return await message.reply(
                        `❌ Chix tidak cukup untuk upgrade speed.` +
                        `\nHarga upgrade: ${formatNumber(nextCost)} Chix` +
                        `\nFee: ${formatNumber(fee)} Chix` +
                        `\nTotal: ${formatNumber(totalCost)} Chix` +
                        `\nSaldo kamu: ${formatNumber(currentBalance)} Chix`,
                    );
                }

                const newBalance = currentBalance - totalCost;
                const oldMultiplier = 1 + currentLevel * speedPerLevel;
                const newMultiplier = 1 + nextLevel * speedPerLevel;

                await User.update(user.id, {
                    chix: newBalance,
                    idle_speed_level: nextLevel,
                    idle_speed_multiplier: newMultiplier,
                });

                return await message.reply(
                    `⚡ *Upgrade Speed Berhasil!*` +
                    `\nLevel speed: ${currentLevel} -> ${nextLevel}` +
                    `\nSpeed multiplier: x${oldMultiplier.toFixed(2)} -> x${newMultiplier.toFixed(2)}` +
                    `\nHarga: ${formatNumber(nextCost)} Chix` +
                    `\nFee: ${formatNumber(fee)} Chix` +
                    `\nTotal bayar: ${formatNumber(totalCost)} Chix` +
                    `\nSaldo sekarang: ${formatNumber(newBalance)} Chix`,
                );
            }

            case "backpack":
            case "storage":
            case "bag": {
                const currentBackpackLevel = getCurrentBackpackLevel(user);
                const nextBackpackLevel = currentBackpackLevel + 1;
                const backpackPerLevel = getBackpackPerLevel();
                const currentStorageCap = getCurrentStorageCap(user);
                const nextStorageCap = currentStorageCap + backpackPerLevel;
                const nextCost = getNextBackpackUpgradeCost(currentBackpackLevel);

                const feeRate = getBackpackFeeRate();
                const { fee } = applyFee(nextCost, feeRate, { minFee: feeMin, maxFee: feeMax });

                const totalCost = nextCost + fee;
                const currentBalance = Number(user.chix || 0);

                if (currentBalance < totalCost) {
                    return await message.reply(
                        `❌ Chix tidak cukup untuk upgrade backpack.` +
                        `\nHarga upgrade: ${formatNumber(nextCost)} Chix` +
                        `\nFee: ${formatNumber(fee)} Chix` +
                        `\nTotal: ${formatNumber(totalCost)} Chix` +
                        `\nSaldo kamu: ${formatNumber(currentBalance)} Chix`,
                    );
                }

                const newBalance = currentBalance - totalCost;

                await User.update(user.id, {
                    chix: newBalance,
                    storage_cap: nextStorageCap,
                });

                return await message.reply(
                    `🎒 *Upgrade Backpack Berhasil!*` +
                    `\nLevel backpack: ${currentBackpackLevel} -> ${nextBackpackLevel}` +
                    `\nStorage cap: ${formatNumber(currentStorageCap)} -> ${formatNumber(nextStorageCap)}` +
                    `\nHarga: ${formatNumber(nextCost)} Chix` +
                    `\nFee: ${formatNumber(fee)} Chix` +
                    `\nTotal bayar: ${formatNumber(totalCost)} Chix` +
                    `\nSaldo sekarang: ${formatNumber(newBalance)} Chix`,
                );
            }

            case "info": {
                const speedLevel = getCurrentSpeedLevel(user);
                const speedPerLevel = getSpeedPerLevel();
                const speedCost = getNextSpeedUpgradeCost(speedLevel);
                const speedFeeRate = getSpeedFeeRate();
                const { fee: speedFee } = applyFee(speedCost, speedFeeRate, { minFee: feeMin, maxFee: feeMax });
                const speedTotal = speedCost + speedFee;
                const currentSpeedMultiplier = 1 + speedLevel * speedPerLevel;
                const nextSpeedMultiplier = 1 + (speedLevel + 1) * speedPerLevel;

                const backpackLevel = getCurrentBackpackLevel(user);
                const backpackPerLevel = getBackpackPerLevel();
                const currentStorageCap = getCurrentStorageCap(user);
                const nextStorageCap = currentStorageCap + backpackPerLevel;
                const backpackCost = getNextBackpackUpgradeCost(backpackLevel);
                const backpackFeeRate = getBackpackFeeRate();
                const { fee: backpackFee } = applyFee(backpackCost, backpackFeeRate, { minFee: feeMin, maxFee: feeMax });
                const backpackTotal = backpackCost + backpackFee;

                return await message.reply(
                    `📌 *Upgrade Info*` +
                    `\nSaldo kamu: ${formatNumber(user.chix)} Chix` +
                    `\n\n⚡ *Speed*` +
                    `\nLevel: ${speedLevel}` +
                    `\nMultiplier: x${currentSpeedMultiplier.toFixed(2)} -> x${nextSpeedMultiplier.toFixed(2)}` +
                    `\nHarga: ${formatNumber(speedCost)} Chix` +
                    `\nFee: ${formatNumber(speedFee)} Chix` +
                    `\nTotal: ${formatNumber(speedTotal)} Chix` +
                    `\nGunakan: \`${prefix}upgrade speed\`` +
                    `\n\n🎒 *Backpack*` +
                    `\nLevel: ${backpackLevel}` +
                    `\nStorage cap: ${formatNumber(currentStorageCap)} -> ${formatNumber(nextStorageCap)}` +
                    `\nHarga: ${formatNumber(backpackCost)} Chix` +
                    `\nFee: ${formatNumber(backpackFee)} Chix` +
                    `\nTotal: ${formatNumber(backpackTotal)} Chix` +
                    `\nGunakan: \`${prefix}upgrade backpack\``,
                );
            }

            default:
                return await message.reply(
                    `❌ Pilihan upgrade tidak valid.` +
                    `\nGunakan:` +
                    `\n- \`${prefix}upgrade speed\`` +
                    `\n- \`${prefix}upgrade backpack\`` +
                    `\n- \`${prefix}upgrade info\``,
                );
        }
    },
};