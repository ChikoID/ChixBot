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

    if (!fs.existsSync(commandsPath)) {
        console.log("Commands folder tidak ditemukan, membuat folder...");
        fs.mkdirSync(commandsPath, { recursive: true });
        return;
    }

    const loadCommands = (dir) => {
        const files = fs.readdirSync(dir);

        for (const file of files) {
            const filePath = path.join(dir, file);
            const stat = fs.statSync(filePath);

            if (stat.isDirectory()) {
                loadCommands(filePath);
            } else if (file.endsWith(".js")) {
                try {
                    const command = require(filePath);

                    if (!command.name) {
                        console.log(`Command ${file} tidak memiliki property 'name'`);
                        continue;
                    }

                    client.commands.set(command.name, command);

                    if (command.aliases && Array.isArray(command.aliases)) {
                        command.aliases.forEach((alias) => {
                            client.commands.set(alias, command);
                        });
                    }

                    console.log(`Loaded: ${command.name}${command.aliases ? ` (${command.aliases.join(", ")})` : ""}`);
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

    console.log(`${client.commands.size} commands loaded successfully!`);
};
