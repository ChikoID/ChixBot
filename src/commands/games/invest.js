const User = require("../../models/user");
const Investment = require("../../models/investment");
const { ensureUser } = require("../../shared/utility/ensureUser");
const { applyFee } = require("../../shared/utility/fee");

function formatNumber(value) {
    return Number(value || 0).toLocaleString("id-ID");
}

function getInvestFeeRate() {
    const feeInvestRaw = Number(process.env.FEE_INVEST_RATE);
    if (Number.isFinite(feeInvestRaw) && feeInvestRaw >= 0) return feeInvestRaw;

    const feeGenericRaw = Number(process.env.FEE_RATE);
    if (Number.isFinite(feeGenericRaw) && feeGenericRaw >= 0) return feeGenericRaw;

    return 0.01;
}

function getFeeBoundaries() {
    const feeMin = process.env.MINIMUN_FEE ? parseInt(process.env.MINIMUN_FEE, 10) : 1;
    const feeMax = process.env.MAXIMUM_FEE ? parseInt(process.env.MAXIMUM_FEE, 10) : Infinity;
    return { feeMin, feeMax };
}

const INVESTMENT_PLANS = {
    quick: { label: "quick", durationMinutes: 60, rate: 0.05 },
    medium: { label: "medium", durationMinutes: 360, rate: 0.12 },
    long: { label: "long", durationMinutes: 1440, rate: 0.25 },
};

function formatDuration(minutes) {
    if (minutes < 60) return `${minutes} menit`;
    if (minutes < 1440) {
        const h = Math.floor(minutes / 60);
        const m = minutes % 60;
        return m > 0 ? `${h} jam ${m} menit` : `${h} jam`;
    }

    const d = Math.floor(minutes / 1440);
    const h = Math.floor((minutes % 1440) / 60);
    return h > 0 ? `${d} hari ${h} jam` : `${d} hari`;
}

function formatRelative(ms) {
    const totalMinutes = Math.ceil(ms / 60000);
    return formatDuration(totalMinutes);
}

function findPlan(key) {
    if (!key) return null;
    const normalized = String(key).toLowerCase();

    if (normalized === "1h") return INVESTMENT_PLANS.quick;
    if (normalized === "6h") return INVESTMENT_PLANS.medium;
    if (normalized === "24h") return INVESTMENT_PLANS.long;
    return INVESTMENT_PLANS[normalized] || null;
}

function planListText(prefix) {
    const lines = ["📈 *Pilihan Plan Investasi*", ""];

    for (const plan of Object.values(INVESTMENT_PLANS)) {
        lines.push(`- *${plan.label}* (${formatDuration(plan.durationMinutes)}): +${Math.round(plan.rate * 100)}%`);
    }

    lines.push("");
    lines.push(`Gunakan: ${prefix}invest create <jumlah> <plan>`);
    lines.push(`Contoh: ${prefix}invest create 1000 quick`);
    lines.push(`Cek status: ${prefix}invest status`);
    lines.push(`Tarik dana: ${prefix}invest withdraw`);
    return lines.join("\n");
}

module.exports = {
    name: "invest",
    description: "Menginvestasikan chix dengan pilihan durasi dan tingkat keuntungan tertentu, dengan risiko penalti jika terlambat melakukan penarikan.",
    aliases: ["investasi"],
    /**
     * @param {import("whatsapp-web.js").Message} message
     * @param {import("whatsapp-web.js").Client} client
     * @param {string[]} args
     */
    async execute(message, client, args) {
        const user = await ensureUser(message);
        if (!user) return;

        const prefix = process.env.PREFIX || "!";
        const subcommand = (args[0] || "").toLowerCase();
        switch (subcommand) {
            case "help":
            case "plans":
            case "list": {
                return await message.reply(planListText(prefix));
            }
            case "create":
            case "start":
            case "buat": {
                const amount = parseInt(args[1], 10);
                const plan = findPlan(args[2]);
                if (!Number.isFinite(amount) || amount <= 0) return await message.reply(`❌ Jumlah investasi tidak valid.\nContoh: ${prefix}invest create 1000 quick`);
                if (!plan) return await message.reply(`❌ Plan tidak valid.\nPilih: quick, medium, long (atau 1h/6h/24h)`);

                const { feeMin, feeMax } = getFeeBoundaries();
                const feeRate = getInvestFeeRate();
                const { fee: investFee } = applyFee(amount, feeRate, { minFee: feeMin, maxFee: feeMax });
                const totalCost = amount + investFee;

                if (user.chix < totalCost) {
                    return await message.reply(
                        `❌ Chix kamu tidak cukup untuk investasi.\n\n` +
                        `Modal: ${formatNumber(amount)} Chix\n` +
                        `Fee: ${formatNumber(investFee)} Chix\n` +
                        `Total: ${formatNumber(totalCost)} Chix\n` +
                        `Saldo kamu: ${formatNumber(user.chix)} Chix`
                    );
                }

                const active = await Investment.getByUser(user.id);
                if (active) return await message.reply(`❌ Kamu masih punya investasi aktif. Gunakan ${prefix}invest status atau ${prefix}invest withdraw.`);
                await User.update(user.id, { chix: user.chix - totalCost });
                const investment = await Investment.create(user.id, amount, plan.rate, plan.durationMinutes);
                const snapshot = Investment.calculateSnapshot(investment, Date.now());
                return await message.reply(
                    `✅ Investasi dibuat!\n\n` + `Plan: ${plan.label} (${formatDuration(plan.durationMinutes)})\n` + `Modal: ${formatNumber(amount)} Chix\n` + `Rate: +${Math.round(plan.rate * 100)}%\n` + `Nilai saat jatuh tempo: ${formatNumber(snapshot.maturedValue)} Chix\n` + `Fee investasi: ${formatNumber(investFee)} Chix\n` + `Total bayar: ${formatNumber(totalCost)} Chix\n\n` + `Saldo tersisa: ${formatNumber(user.chix - totalCost)} Chix`,
                );
            }
            case "status":
            case "cek": {
                const activeInvestment = await Investment.getByUser(user.id);
                if (!activeInvestment) return await message.reply(`ℹ️ Tidak ada investasi aktif. Gunakan ${prefix}invest plans untuk lihat plan.`);

                const snapshot = Investment.calculateSnapshot(activeInvestment, Date.now());
                if (!snapshot.isMatured) {
                    return await message.reply(
                        `📊 Status Investasi\n\n` +
                            `Modal: ${formatNumber(snapshot.principal)} Chix\n` +
                            `Rate: +${Math.round(Number(activeInvestment.rate || 0) * 100)}%\n` +
                            `Durasi: ${formatDuration(Number(activeInvestment.duration || 0))}\n` +
                            `Jatuh tempo: ${formatNumber(snapshot.maturedValue)} Chix\n` +
                            `Sisa waktu: ${formatRelative(snapshot.remainingMs)}\n\n` +
                            `Belum bisa ditarik.`,
                    );
                }

                const penaltyPercent = Math.round(snapshot.penaltyRate * 100);
                return await message.reply(
                    `📊 Status Investasi\n\n` +
                        `Modal: ${formatNumber(snapshot.principal)} Chix\n` +
                        `Nilai jatuh tempo: ${formatNumber(snapshot.maturedValue)} Chix\n` +
                        `Nilai tarik saat ini: ${formatNumber(snapshot.withdrawValue)} Chix\n` +
                        `Terlambat: ${formatRelative(snapshot.overdueMs)}\n` +
                        `Penalti: ${penaltyPercent}% per ${snapshot.penaltyIntervalMinutes} menit\n` +
                        `Step penalti: ${snapshot.penaltySteps}`,
                );
            }
            case "wd":
            case "withdraw":
            case "claim":
            case "tarik": {
                const activeInvestment = await Investment.getByUser(user.id);
                if (!activeInvestment) return await message.reply("❌ Tidak ada investasi aktif untuk ditarik.");

                const snapshot = Investment.calculateSnapshot(activeInvestment, Date.now());
                if (!snapshot.isMatured) return await message.reply(`⏳ Investasi belum jatuh tempo. Sisa waktu: ${formatRelative(snapshot.remainingMs)}`);

                const newBalance = Number(user.chix || 0) + snapshot.withdrawValue;
                await User.update(user.id, { chix: newBalance });
                await Investment.delete(activeInvestment.id);
                return await message.reply(
                    `💸 Investasi berhasil ditarik!\n\n` + `Modal: ${formatNumber(snapshot.principal)} Chix\n` + `Nilai jatuh tempo: ${formatNumber(snapshot.maturedValue)} Chix\n` + `Diterima: ${formatNumber(snapshot.withdrawValue)} Chix\n` + `Step penalti: ${snapshot.penaltySteps}\n\n` + `Saldo sekarang: ${formatNumber(newBalance)} Chix`,
                );
            }
            default:
                return await message.reply(`❌ Subcommand tidak dikenal. Gunakan ${prefix}invest help`);
        }
    },
};
