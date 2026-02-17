const Inventory = require("../../models/inventory");
const User = require("../../models/user");
const { ensureUser } = require("../../shared/utility/ensureUser");
const StorageEstimator = require("../../shared/utility/storageEstimation");

module.exports = {
    name: "backpack",
    description: "Cek isi backpack kamu",
    aliases: ["bp", "inv", "inventory"],
    /**
     * @param {import("whatsapp-web.js").Message} message
     * @param {import("whatsapp-web.js").Client} client
     * @param {string[]} args
     */
    async execute(message, client, args) {
        const user = await ensureUser(message, User);
        if (!user) return;

        const inventory = await Inventory.getAllByUser(user.id);
        if (inventory.length === 0) return await message.reply("Backpack kamu kosong!");

        const totalItems = inventory.reduce((sum, inv) => sum + inv.quantity, 0);
        const filteredInventory = inventory.filter((inv) => inv.item_type === "items");
        const backpackList = filteredInventory.map((inv) => `- ${inv.name}: *${inv.quantity}x*`).join("\n");

        const estimate = await StorageEstimator.calculateTimeToFull(totalItems, user.storage_cap)
        const estimateText = estimate.isFull ? `⚠️ ${estimate.formattedTime}` : `⏱️ Penuh dalam: ${estimate.formattedTime}`;

        await message.reply(`🎒 Isi backpack kamu:\n\n${backpackList}\n\nTotal items: ${totalItems}/${user.storage_cap}\n${estimateText}`);
    },
};
