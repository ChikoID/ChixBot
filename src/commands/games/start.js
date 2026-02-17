const User = require("../../models/user");

module.exports = {
    name: "start",
    description: "Mulai permainan dari ChixBot",
    aliases: ["mulai", "play"],
    /**
     * @param {import("whatsapp-web.js").Message} message
     * @param {import("whatsapp-web.js").Client} client
     * @param {string[]} args
     */
    async execute(message, client, args) {
        const userId = message.from.split("@")[0];
        
        const existingUser = await User.getByPhone(userId);
        if(existingUser) return await message.reply("⚠️ Kamu sudah memulai permainan sebelumnya!");
        
        await User.create(userId);
        await message.reply("🎮 Permainan dimulai! Selamat bermain dengan ChixBot!");
    },
};
