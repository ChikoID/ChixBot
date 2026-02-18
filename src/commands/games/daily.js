const User = require("../../models/user");
const { ensureUser } = require("../../shared/utility/ensureUser");

module.exports = {
    name: "daily",
    description: "Mengklaim hadiah chix harian sekaligus menjaga streak harianmu agar terus bertambah.",
    aliases: ["dailies", "harian", "bonus"],
    /**
     * @param {import("whatsapp-web.js").Message} message
     * @param {import("whatsapp-web.js").Client} client
     * @param {string[]} args
     */
    async execute(message, client, args) {
        const user = await ensureUser(message);
        if (!user) return;

        const now = Date.now();
        const lastClaim = user.daily_streak_date || 0;
        const timeDiff = now - lastClaim;
        const oneDay = 24 * 60 * 60 * 1000;

        if (timeDiff < oneDay) {
            const hoursLeft = Math.ceil((oneDay - timeDiff) / (60 * 60 * 1000));
            return await message.reply(`Kamu sudah mengklaim bonus harian hari ini! Kembali dalam ${hoursLeft} jam untuk klaim berikutnya.`);
        }

        let dailyReward = Math.floor(Math.random() * 1000) + 500; // Random reward antara 500-1500 chix
        const newChix = user.chix + dailyReward;
        const newStreak = user.daily_streak + 1;

        await User.update(user.id, {
            chix: newChix,
            daily_streak: newStreak,
            daily_streak_date: now
        });

        await message.reply(`🎁 Kamu telah mengklaim bonus harian sebesar ${dailyReward} chix!\n🔥 Streak kamu sekarang: ${newStreak}`);
    },
};
