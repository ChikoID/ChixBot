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
        if(message.fromMe) return;
        const userId = message.from.split("@")[0];
        
        if(await User.getByPhone(userId)) return await message.reply("⚠️ Kamu sudah memulai permainan sebelumnya!");
        
        User.create(userId);
        await message.reply("🎮 Permainan dimulai! Selamat bermain dengan ChixBot!");
    },
};
