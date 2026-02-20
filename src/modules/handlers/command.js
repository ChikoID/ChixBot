const { Client } = require("whatsapp-web.js");
const fs = require("fs");
const path = require("path");

/**
 *
 * @param {Client} client
 */
module.exports = async (client) => {
    const commandsPath = path.join(__dirname, "../../commands");
    if (!client.commands) {
        client.commands = new Map();
    }
    const uniqueCommands = new Set();

    if (!fs.existsSync(commandsPath)) {
        console.log("Commands folder tidak ditemukan, membuat folder...");
        fs.mkdirSync(commandsPath, { recursive: true });
        return;
    }

    /**
     * @param {string} dir
     * @param {string|null} category
     */
    const loadCommands = (dir, category = null) => {
        const files = fs.readdirSync(dir);

        for (const file of files) {
            const filePath = path.join(dir, file);
            const stat = fs.statSync(filePath);

            if (stat.isDirectory()) {
                const newCategory = category || file;
                loadCommands(filePath, newCategory);
            } else if (file.endsWith(".js")) {
                try {
                    const command = require(filePath);

                    if (!command.name) {
                        console.log(`Command ${file} tidak memiliki property 'name'`);
                        continue;
                    }

                    command.category = category || "general";

                    client.commands.set(command.name, command);
                    uniqueCommands.add(command.name);

                    if (command.aliases && Array.isArray(command.aliases)) {
                        command.aliases.forEach((alias) => {
                            client.commands.set(alias, command);
                        });
                    }

                    console.log(
                        `Loaded: ${command.name} [${command.category}]${command.aliases ? ` (${command.aliases.join(", ")})` : ""}`,
                    );
                } catch (error) {
                    console.error(`Error loading command ${file}:`, error);
                }
            }
        }
    };

    loadCommands(commandsPath);

    if (client.commands.size === 0) {
        return console.log("Tidak ada command yang berhasil dimuat");
    }

    console.log(`${uniqueCommands.size} commands loaded successfully!`);
};
