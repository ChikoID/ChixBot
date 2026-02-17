const User = require("../../models/user");
const { ensureUser } = require("../../shared/utility/ensureUser");

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
        const user = await ensureUser(message, User);
        if (!user) return;

        await message.reply(`Saldo kamu: $${user.chix}`);
    }
}