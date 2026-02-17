const { runMigrations } = require("../../shared/configuration/database");

module.exports = {
    name: "ready",
    once: true,
    async execute(client) {
        try {
            const executed = await runMigrations();
            if (executed.length > 0) {
                console.log(`Migrations applied: ${executed.join(", ")}`);
            }
        } catch (error) {
            console.error("Migration error:", error);
        }
    },
};
