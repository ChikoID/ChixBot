module.exports = {
    name: "help",
    description: "Menampilkan panduan dan daftar lengkap command yang bisa digunakan beserta fungsi singkatnya.",
    aliases: ["commands", "menu"],
    /**
     * @param {import("whatsapp-web.js").Message} message
     * @param {import("whatsapp-web.js").Client} client
     * @param {string[]} args
     */
    async execute(message, client, args) {
        if (!client.commands || client.commands.size === 0) {
            return await message.reply("Belum ada command yang tersedia.");
        }

        const prefix = process.env.PREFIX || "!";

        const uniqueCommands = new Map();
        for (const command of client.commands.values()) {
            if (!command?.name) continue;
            if (!uniqueCommands.has(command.name)) {
                uniqueCommands.set(command.name, command);
            }
        }

        const sortedCommands = Array.from(uniqueCommands.values()).sort((a, b) => a.name.localeCompare(b.name));

        const lines = ["📜 *Daftar Perintah ChixBot* 📜", ""];

        for (const command of sortedCommands) {
            const desc = command.description || "Tanpa deskripsi";
            lines.push(`> *${prefix}${command.name}* - ${desc}\n`);

            // if (Array.isArray(command.aliases) && command.aliases.length > 0) {
            //     lines.push(`   _Alias_: ${command.aliases.map((alias) => `${prefix}${alias}`).join(", ")}`);
            // }
        }

        await message.reply(lines.join("\n"));
    },
};
