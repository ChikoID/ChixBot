const User = require("../../models/user");
const { ensureUser } = require("../../shared/utility/ensureUser");
const { applyFee } = require("../../shared/utility/fee");

const weighted = ["🍒", "🍒", "🍒", "🍒", "🍋", "🍋", "🍋", "💎", "💎", "7️⃣"];

function roll() {
    return weighted[Math.floor(Math.random() * weighted.length)];
}

function getSlotFeeRate() {
    const feeSlotRaw = Number(process.env.FEE_SLOT_RATE);
    if (Number.isFinite(feeSlotRaw) && feeSlotRaw >= 0) return feeSlotRaw;

    const feeGenericRaw = Number(process.env.FEE_RATE);
    if (Number.isFinite(feeGenericRaw) && feeGenericRaw >= 0) return feeGenericRaw;

    return 0;
}

function getFeeBoundaries() {
    const feeMin = process.env.MINIMUN_FEE ? parseInt(process.env.MINIMUN_FEE, 10) : 1;
    const feeMax = process.env.MAXIMUM_FEE ? parseInt(process.env.MAXIMUM_FEE, 10) : Infinity;
    return { feeMin, feeMax };
}

function evaluateSpin(a, b, c) {
    const isTriple = a === b && b === c;
    const isPair = a === b || a === c || b === c;

    if (isTriple && a === "7️⃣") {
        return { code: "jackpot", label: "💥 JACKPOT 7️⃣7️⃣7️⃣", multiplier: 12 };
    }

    if (isTriple) {
        return { code: "triple", label: "🔥 Triple Match", multiplier: 5 };
    }

    if (isPair) {
        return { code: "pair", label: "✨ Pair Match", multiplier: 0.45 };
    }

    return { code: "lose", label: "💀 Zonkk", multiplier: 0 };
}

module.exports = {
    name: "slot",
    description: "Memainkan slot game untuk memenangkan hadiah menarik dengan biaya tertentu.",
    aliases: ["sl", "judi"],
    /**
     * @param {import("whatsapp-web.js").Message} message
     * @param {import("whatsapp-web.js").Client} client
     * @param {string[]} args
     */
    async execute(message, client, args) {
        const user = await ensureUser(message);
        if (!user) return;

        const cost = args[0] ? parseInt(args[0], 10) : 100;
        if (isNaN(cost) || cost <= 0)
            return await message.reply("Masukkan jumlah chix yang valid untuk biaya main slot.");

        if (user.chix < cost)
            return await message.reply(`Kamu tidak memiliki cukup chix. Biaya main slot adalah ${cost} chix.`);

        const a = roll();
        const b = roll();
        const c = roll();

        const outcome = evaluateSpin(a, b, c);

        const rewardRaw = Math.floor(cost * outcome.multiplier);
        const { feeMin, feeMax } = getFeeBoundaries();
        const feeRate = getSlotFeeRate();
        const { net: rewardFinal, fee: rewardFee } = applyFee(rewardRaw, feeRate, { minFee: feeMin, maxFee: feeMax });

        const newBalance = Number(user.chix || 0) - cost + rewardFinal;

        await User.update(user.id, { chix: newBalance });

        const profit = rewardFinal - cost;
        let resultText = `${outcome.label}\n`;

        if (rewardFinal <= 0) {
            resultText += `Kamu kalah ${cost} chix`;
        } else if (profit > 0) {
            resultText += `Kamu untung ${profit} chix${rewardFee > 0 ? ` (fee ${rewardFee} chix)` : ""}`;
        } else if (profit === 0) {
            resultText += `Kamu impas${rewardFee > 0 ? ` (fee ${rewardFee} chix)` : ""}`;
        } else {
            resultText += `Kamu rugi ${Math.abs(profit)} chix${rewardFee > 0 ? ` (fee ${rewardFee} chix)` : ""}`;
        }

        return message.reply(
            `🎰 SLOT RESULT 🎰\n\n${a} | ${b} | ${c}\n\n${resultText}\nSaldo sekarang: ${newBalance} chix`,
        );
    },
};
