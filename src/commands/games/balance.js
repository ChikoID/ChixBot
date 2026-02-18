const { ensureUser } = require("../../shared/utility/ensureUser");

module.exports = {
    name: "balance",
    "description": "Menampilkan total saldo chix kamu saat ini, sehingga kamu tahu berapa banyak koin yang tersedia untuk digunakan.",
    aliases: ["bal", "money", "chix"],
    /**
     * @param {import("whatsapp-web.js").Message} message
     * @param {import("whatsapp-web.js").Client} client
     * @param {string[]} args
     */
    async execute(message, client, args) {
        const user = await ensureUser(message);
        if (!user) return;

        await message.reply(`Saldo kamu: $${user.chix}`);
    }
}