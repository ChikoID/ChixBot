const Inventory = require("../../models/inventory");
const { ensureUser } = require("../../shared/utility/ensureUser");

module.exports = {
    name: "limited",
    description: "Melihat seluruh item limited yang saya miliki di inventori, termasuk jumlah dan detail singkatnya.",
    aliases: ["limiteds", "ltd"],
    /**
     * @param {import("whatsapp-web.js").Message} message
     * @param {import("whatsapp-web.js").Client} client
     * @param {string[]} args
     */
    async execute(message, client, args) {
        const user = await ensureUser(message);
        if (!user) return;

        const inventory = await Inventory.getAllByUser(user.id);
        const filteredInventory = inventory.filter((inv) => inv.item_type === "items_limited");
        if (filteredInventory.length === 0)
            return await message.reply("Kamu tidak memiliki item limited di backpack kamu!");
        const backpackList = filteredInventory.map((inv) => `- ${inv.name}: *${inv.quantity}x*`).join("\n");

        await message.reply(`🎒 Item limited yang kamu miliki:\n\n${backpackList}`);
    },
};
