module.exports = {
    name: "ping",
    aliases: ["p"],
    description: "Cek response time bot",
    /**
     * @param {import("whatsapp-web.js").Message} message
     * @param {import("whatsapp-web.js").Client} client
     */
    async execute(message, client) {
        const startTime = Date.now();
        await message.reply("🏓 Pong!");
        const endTime = Date.now();
        
        const responseTime = endTime - startTime;
        await message.reply(`⏱️ Response time: ${responseTime}ms`);
    }
};
