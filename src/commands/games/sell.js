const Inventory = require("../../models/inventory");
const Item = require("../../models/item");
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

        if (!user) return await message.reply("Kamu belum memulai permainan! Ketik *!start* untuk memulai.");
        const inventory = await Inventory.getAllByUser(user.id);
        if (inventory.length === 0) return await message.reply("Backpack kamu kosong!");

        // Logika jual item (contoh: jual semua item dengan harga sesuai item)
        let totalEarnings = 0;
        for (const inv of inventory) {
            const item = await Item.getById(inv.item_id);
            totalEarnings += item.price * inv.quantity;
            await Inventory.delete(inv.id);
        }

        // Update user dengan uang yang didapatkan
        const newChix = user.chix + totalEarnings;
        await User.update(user.id, { chix: newChix });
        await message.reply(`Kamu telah menjual semua item dan mendapatkan $${totalEarnings}!`);
    },
};
