module.exports = {
    name: "message_create",
    once: false,
    /**
     * @param {import("whatsapp-web.js").Message} message
     * @param {import("whatsapp-web.js").Client} client
     */
    async execute(message, client) {
        if (message.from === "status@broadcast" || message.fromMe) return;

        const prefix = process.env.PREFIX || "!";

        if (!message.body.startsWith(prefix)) return;
        const args = message.body.slice(prefix.length).trim().split(/ +/);
        const commandName = args.shift().toLowerCase();

        const command = client.commands.get(commandName);

        if (!command) return;

        try {
            console.log(`Command ${commandName} executed by ${message.from}`);
            await command.execute(message, client, args);
        } catch (error) {
            console.error(`Error executing command ${commandName}:`, error);
            await message.reply("❌ Terjadi error saat menjalankan command!");
        }
    },
};
