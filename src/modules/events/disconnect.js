const { stopIdleUpdater } = require("../systems/idleTimer");

module.exports = {
    name: "disconnected",
    once: false,
    async execute() {
        stopIdleUpdater();
        console.log("Bot is disconnected.");
    },
};
