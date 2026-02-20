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
        for (const cmd of client.commands.values()) {
            if (!cmd?.name) continue;
            if (!uniqueCommands.has(cmd.name)) {
                uniqueCommands.set(cmd.name, cmd);
            }
        }

        const categories = new Map();

        for (const command of uniqueCommands.values()) {
            const category = command.category || "other";

            if (!categories.has(category)) {
                categories.set(category, []);
            }

            categories.get(category).push(command);
        }

        const sortedCategories = Array.from(categories.keys()).sort((a, b) => a.localeCompare(b));

        const lines = [];
        lines.push("📜 *Daftar Perintah ChixBot* 📜");
        lines.push("");

        for (const category of sortedCategories) {
            lines.push(`📂 *${category.toUpperCase()}*`);

            const cmds = categories.get(category).sort((a, b) => a.name.localeCompare(b.name));

            for (const cmd of cmds) {
                const desc = cmd.description || "Tanpa deskripsi";
                lines.push(`> *${prefix}${cmd.name}* - ${desc}`);
            }

            lines.push("");
        }

        await message.reply(lines.join("\n"));
    },
};
