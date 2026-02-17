const Inventory = require("../../models/inventory");
const User = require("../../models/user");

module.exports = {
    name: "sell",
    description: "Jual item dari inventori",
    aliases: ["jual"],
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

        let totalEarnings = 0;
        for (const inv of inventory) {
            const item = await Inventory.getItemDetails(inv);
            if (!item) continue;

            const itemPrice = Number(item.price) || 0;
            const itemQty = Number(inv.quantity) || 0;
            totalEarnings += itemPrice * itemQty;
            await Inventory.delete(inv.id);
        }

        const newChix = user.chix + totalEarnings;
        await User.update(user.id, { chix: newChix });
        await message.reply(`Kamu telah menjual semua item dan mendapatkan $${totalEarnings}!`);
    },
};
