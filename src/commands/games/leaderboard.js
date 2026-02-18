const User = require("../../models/user");
const { ensureUser } = require("../../shared/utility/ensureUser");

module.exports = {
    name: "leaderboard",
    description: "Melihat peringkat pemain dengan jumlah chix terbanyak di server.",
    aliases: ["lb", "top", "rank"],
    /**
     * @param {import("whatsapp-web.js").Message} message
     * @param {import("whatsapp-web.js").Client} client
     * @param {string[]} args
     */
    async execute(message, client, args) {
        const user = await ensureUser(message);
        if (!user) return;

        const users = await User.list();
        const sortedUsers = users.sort((a, b) => b.chix - a.chix).slice(0, 10);

        const leaderboard = sortedUsers.map((u, index) => `#${index + 1} ${u.name}: ${u.chix} Chix`).join("\n");
        await message.reply(`🏆 *Chix Leaderboard* 🏆\n\n${leaderboard}`);
    },
};
