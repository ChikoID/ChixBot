module.exports = {
    name: "ping",
    aliases: ["p"],
    description: "Mengecek kecepatan respons bot untuk memastikan performanya normal.",
    /**
     * @param {import("whatsapp-web.js").Message} message
     * @param {import("whatsapp-web.js").Client} client
     * @param {string[]} args
     */
    async execute(message, client, args) {
        const startTime = Date.now();
        await message.reply("🏓 Pong!");
        const endTime = Date.now();

        const responseTime = endTime - startTime;
        await message.reply(`⏱️ Response time: ${responseTime}ms`);
    },
};
