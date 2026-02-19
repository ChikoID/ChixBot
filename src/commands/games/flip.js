const User = require("../../models/user");
const { ensureUser } = require("../../shared/utility/ensureUser");

module.exports = {
    name: "flip",
    description: "Mengikuti undian untuk memenangkan hadiah menarik dengan biaya tertentu.",
    aliases: ["flipcoin"],
    /**
     * @param {import("whatsapp-web.js").Message} message
     * @param {import("whatsapp-web.js").Client} client
     * @param {string[]} args
     */
    async execute(message, client, args) {
        const user = await ensureUser(message);
        if (!user) return;

        const cost = args[0] ? parseInt(args[0]) : 100;
        if (isNaN(cost) || cost <= 0) return await message.reply("Masukkan jumlah koin yang valid untuk biaya undian.");

        if (user.chix < cost)
            return await message.reply(`Kamu tidak memiliki cukup koin. Biaya undian adalah ${cost} koin.`);

        // Mengurangi koin pengguna
        user.chix -= cost;
        await User.update(user.id, { chix: user.chix });

        // Menentukan pemenang secara acak
        const isWinner = Math.random() < 0.5; // 50% chance untuk menang
        if (isWinner) {
            const reward = cost * 2; // Hadiah adalah dua kali biaya
            user.chix += reward;
            await User.update(user.id, { chix: user.chix });
            await message.reply(`🎉 Selamat! Kamu menang dan mendapatkan ${reward} koin!`);
        } else {
            await message.reply("😞 Sayang sekali, kamu kalah. Coba lagi!");
        }
    },
};
