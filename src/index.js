const { Client, LocalAuth } = require("whatsapp-web.js");
require("dotenv").config({ quiet: true });

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage", "--disable-accelerated-2d-canvas", "--no-first-run", "--no-zygote", "--disable-gpu"],
    },
});

module.exports = client;

require("./modules/handlers/command")(client);
require("./modules/handlers/event")(client);

client.initialize();