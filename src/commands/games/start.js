const User = require("../../models/user");
const badWords = require("../../shared/configuration/badwords");

module.exports = {
    name: "start",
    description:
        "Memulai permainan dan membuat profil agar kamu bisa mulai mengumpulkan chix. Mendapatkan item secara otomatis saat memulai!",
    aliases: ["mulai", "play"],
    /**
     * @param {import("whatsapp-web.js").Message} message
     * @param {import("whatsapp-web.js").Client} client
     * @param {string[]} args
     */
    async execute(message, client, args) {
        const rawId = message.author || message.from;
        const userId = rawId.split("@")[0];
        const userName = args[0]?.toLowerCase();

        const existingUser = await User.getByPhone(userId);
        if (existingUser) return await message.reply("⚠️ Kamu sudah memulai permainan sebelumnya!");

        const userNameNotValid = ["", "chixbot", "admin", "owner", "mod", "moderator", "staff"];

        if (!userName || userName.length === 0 || userName.length > 30)
            return await message.reply("⚠️ Nama tidak valid! Panjang nama harus antara 1-30 karakter.");
        if (!/^[a-zA-Z0-9_]+$/.test(userName))
            return await message.reply("⚠️ Nama tidak valid! Hanya huruf, angka, dan underscore yang diperbolehkan.");
        if (userNameNotValid.includes(userName))
            return await message.reply("⚠️ Nama tidak valid! Nama tersebut tidak diperbolehkan.");
        if (badWords.some((word) => userName.includes(word)))
            return await message.reply("⚠️ Nama mengandung kata yang tidak diperbolehkan.");

        await User.create(userId, userName);
        await message.reply("🎮 Permainan dimulai! Selamat bermain dengan ChixBot!");
    },
};
