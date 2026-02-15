module.exports = {
    name: "ready",
    once: true,
    /**
     * @param {import("whatsapp-web.js").Client} client
     */
    execute(client) {
        console.log(`Bot is ready!\nLogged in as: ${client.info.pushname}`);
    },
};
