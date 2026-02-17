const { seedItems } = require("../../database/seeders/itemSeeder");
const { runMigrations } = require("../../shared/configuration/database");
const { startIdleUpdater } = require("../systems/idleTimer");

module.exports = {
    name: "ready",
    once: true,
    /**
     * @param {import("whatsapp-web.js").Client} client
     */
    async execute(client) {
        try {
            const executed = await runMigrations();
            if (executed.length > 0) {
                console.log(`Migrations applied: ${executed.join(", ")}`);
            }
        } catch (error) {
            console.error("Migration error:", error);
        }

        await seedItems();
        startIdleUpdater();
        console.log(`Bot is ready!\nLogged in as: ${client.info.pushname}`);
    },
};
