const User = require("../../models/user");

module.exports = {
    name: "balance",
    "description": "Cek saldo koin kamu",
    aliases: ["bal", "money", "chix"],
    /**
     * @param {import("whatsapp-web.js").Message} message
     * @param {import("whatsapp-web.js").Client} client
     * @param {string[]} args
     */
    async execute(message, client, args) {
        const phoneId = message.from.split("@")[0];
        const user = await User.getByPhone(phoneId);

        if (!user) return await message.reply("Kamu belum memulai permainan! Ketik *!start* untuk memulai.");
        await message.reply(`Saldo kamu: $${user.chix}`);
    }
}