const { ensureUser } = require("../../shared/utility/ensureUser");
const { formatNumber } = require("../../shared/utility/numberFormat");

module.exports = {
    name: "balance",
    description:
        "Menampilkan total saldo chix kamu saat ini, sehingga kamu tahu berapa banyak koin yang tersedia untuk digunakan.",
    aliases: ["bal", "money", "chix"],
    /**
     * @param {import("whatsapp-web.js").Message} message
     * @param {import("whatsapp-web.js").Client} client
     * @param {string[]} args
     */
    async execute(message, client, args) {
        const user = await ensureUser(message);
        if (!user) return;

        const chix = formatNumber(user.chix, "full");

        await message.reply(`💰 Saldo kamu: ${chix} Chix!`);
    },
};
