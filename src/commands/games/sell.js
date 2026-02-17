const Inventory = require("../../models/inventory");
const User = require("../../models/user");
const { ensureUser } = require("../../shared/utility/ensureUser");

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
        const user = await ensureUser(message, User);
        if (!user) return;

        const inventory = await Inventory.getAllByUser(user.id);

        // Filter hanya item biasa (bukan limited)
        const regularItems = inventory.filter((inv) => inv.item_type === "items");

        if (regularItems.length === 0) return await message.reply("Backpack kamu tidak punya item yang bisa dijual!");

        let totalEarnings = 0;
        const soldItems = [];

        for (const inv of regularItems) {
            const item = await Inventory.getItemDetails(inv);
            if (!item) continue;

            const itemPrice = Number(item.price) || 0;
            const itemQty = Number(inv.quantity) || 0;
            const earnings = itemPrice * itemQty;
            totalEarnings += earnings;

            soldItems.push(`• ${item.name}: ${itemQty}x = ${earnings} Chix`);
            await Inventory.delete(inv.id);
        }

        const newChix = user.chix + totalEarnings;
        await User.update(user.id, { chix: newChix });

        await message.reply(`💰 *Penjualan Berhasil!*\n\n` + `${soldItems.join("\n")}\n\n` + `💵 Total: +${totalEarnings} Chix\n` + `💰 Saldo: ${newChix} Chix\n\n` + `_Item limited dijual via \`/market\` sell_`);
    },
};
