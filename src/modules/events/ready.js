module.exports = {
    name: "ready",
    once: true,
    /**
     * @param {import("whatsapp-web.js").Client} client
     */
    async execute(client) {
        const { runMigrations } = require("../../shared/configuration/database");

        try {
            const executed = await runMigrations();
            if (executed.length > 0) {
                console.log(`Migrations applied: ${executed.join(", ")}`);
            }
        } catch (error) {
            console.error("Migration error:", error);
        }

        console.log(`Bot is ready!\nLogged in as: ${client.info.pushname}`);
    },
};
