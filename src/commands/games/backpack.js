const Inventory = require("../../models/inventory");
const User = require("../../models/user");
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
        const phoneId = message.from.split("@")[0];
        const user = await User.getByPhone(phoneId);

        if (!user) return await message.reply("Kamu belum memulai permainan! Ketik */start* untuk memulai.");
        const inventory = await Inventory.getAllByUser(user.id);
        if (inventory.length === 0) return await message.reply("Backpack kamu kosong!");

        const totalItems = inventory.reduce((sum, inv) => sum + inv.quantity, 0);
        const backpackList = inventory.map((inv) => `- ${inv.name}: *${inv.quantity}x*`).join("\n");

        const estimate = await StorageEstimator.calculateTimeToFull(totalItems, user.storage_cap)
        const estimateText = estimate.isFull ? `⚠️ ${estimate.formattedTime}` : `⏱️ Penuh dalam: ${estimate.formattedTime}`;

        await message.reply(`🎒 Isi backpack kamu:\n\n${backpackList}\n\nTotal items: ${totalItems}/${user.storage_cap}\n${estimateText}`);
    },
};
