const { Client } = require("whatsapp-web.js");
const fs = require("fs");
const path = require("path");

/**
 *
 * @param {Client} client
 */
module.exports = async (client) => {
    const eventsPath = path.join(__dirname, "../events");

    if (!fs.existsSync(eventsPath)) {
        console.log("Events folder tidak ditemukan, membuat folder...");
        fs.mkdirSync(eventsPath, { recursive: true });
        return;
    }

    const eventFiles = fs.readdirSync(eventsPath).filter((file) => file.endsWith(".js"));

    if (eventFiles.length === 0) return console.log("Tidak ada file event ditemukan");

    for (const file of eventFiles) {
        try {
            const eventPath = path.join(eventsPath, file);
            const event = require(eventPath);

            if (!event.name) {
                console.log(`Event ${file} tidak memiliki property 'name'`);
                continue;
            }

            if (event.once) {
                client.once(event.name, (...args) => event.execute(...args, client));
            } else {
                client.on(event.name, (...args) => event.execute(...args, client));
            }
        } catch (error) {
            console.error(`Error loading event ${file}:`, error);
        }
    }

    console.log(`Event handler loaded successfully!`);
};
