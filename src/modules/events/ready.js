const { main } = require("../../database/seeder");
const { runMigrations } = require("../../shared/configuration/database");
const { startIdleUpdater } = require("../systems/idleTimer");

module.exports = {
    name: "ready",
    once: true,
    /**
     * @param {import("whatsapp-web.js").Client} client
     */
    async execute(client) {
        await main();
        startIdleUpdater();
        console.log(`Bot is ready!\nLogged in as: ${client.info.pushname}`);
    },
};
