const Inventory = require("../../models/inventory");
const User = require("../../models/user");
const { ensureUser } = require("../../shared/utility/ensureUser");
const { applyFee } = require("../../shared/utility/fee");

module.exports = {
    name: "sell",
    description: "Menjual item dari inventori untuk mendapatkan chix sesuai nilai jualnya. Item terbatas (limited) tidak bisa dijual di sini, melainkan melalui market.",
    aliases: ["jual"],
    /**
     * @param {import("whatsapp-web.js").Message} message
     * @param {import("whatsapp-web.js").Client} client
     * @param {string[]} args
     */
    async execute(message, client, args) {
        const user = await ensureUser(message);
        if (!user) return;

        const fee_sell = process.env.FEE_SELL_RATE ? parseFloat(process.env.FEE_SELL_RATE) : 0.05; // Default 5% fee
        const fee_rate = process.env.FEE_RATE ? parseInt(process.env.FEE_RATE) : 1; // Default minimum fee
        const fee_min = process.env.MINIMUM_FEE ? parseInt(process.env.MINIMUM_FEE) : 1; // Default minimum fee
        const fee_max = process.env.MAXIMUM_FEE ? parseInt(process.env.MAXIMUM_FEE) : Infinity; // Default no maximum fee

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
            const rate = fee_sell * fee_rate;
            const { net: netEarnings } = applyFee(earnings, rate, { minFee: fee_min, maxFee: fee_max });
            totalEarnings += netEarnings;

            soldItems.push(`• ${item.name}: ${itemQty}x = ${netEarnings} Chix`);
            await Inventory.delete(inv.id);
        }

        const newChix = user.chix + totalEarnings;
        await User.update(user.id, { chix: newChix });

        await message.reply(`💰 *Penjualan Berhasil!*\n\n` + `${soldItems.join("\n")}\n\n` + `💵 Total: +${totalEarnings} Chix\n` + `💰 Saldo: ${newChix} Chix\n\n` + `_Item limited dijual via \`/market\` sell_`);
    },
};
