const ItemLimited = require("../../models/itemLimited");
const Inventory = require("../../models/inventory");
const User = require("../../models/user");
const { ensureUser } = require("../../shared/utility/ensureUser");
const { runAsync } = require("../../shared/configuration/database");

module.exports = {
    name: "market",
    description: "Browse and purchase limited items from the market!",
    aliases: ["shop", "store"],
    /**
     * @param {import("whatsapp-web.js").Message} message
     * @param {import("whatsapp-web.js").Client} client
     * @param {string[]} args
     */
    async execute(message, client, args) {
        const user = await ensureUser(message, User);
        if (!user) return;

        const subcommand = args[0]?.toLowerCase();
        if (!subcommand) {
            return await message.reply("Gunakan subcommand: `list`, `buy <unique_id>`, atau `sell <unique_id>`");
        }

        const itemsLimited = await ItemLimited.list();

        switch (subcommand) {
            case "list":
            case "l":
                if (itemsLimited.length === 0) {
                    return await message.reply("🛒 Market kosong saat ini!");
                }

                const lines = ["🛒 *Limited Items Market* 🛒", ""];
                for (const item of itemsLimited) {
                    const dynamicPrice = await ItemLimited.getDynamicPrice(item);
                    const stockInfo = item.quantity > 0 ? `📦 ${item.quantity}` : "❌ Sold Out";
                    lines.push(`\`${item.unique_id}\``);
                    lines.push(`${item.name}`);
                    lines.push(`💰 ${dynamicPrice} Chix | ${stockInfo}`);
                    lines.push("");
                }
                lines.push("Gunakan `!market buy <unique_id>` untuk membeli");
                return await message.reply(lines.join("\n"));

            case "buy":
            case "b":
                const buyUniqueId = args[1];
                if (!buyUniqueId) {
                    return await message.reply("❌ Masukkan unique_id item!\nContoh: `!market buy COM-UNK-001`");
                }

                const itemToBuy = await ItemLimited.getByUniqueId(buyUniqueId.toUpperCase());
                if (!itemToBuy) {
                    return await message.reply("❌ Item tidak ditemukan!");
                }

                if (itemToBuy.quantity <= 0) {
                    return await message.reply("❌ Item ini sudah sold out!");
                }

                const buyPrice = await ItemLimited.getDynamicPrice(itemToBuy);
                if (user.chix < buyPrice) {
                    return await message.reply(`❌ Chix tidak cukup!\nHarga: ${buyPrice} Chix\nKamu punya: ${user.chix} Chix`);
                }

                // Kurangi stock
                await ItemLimited.decreaseStock(itemToBuy.id, 1);

                // Tambah ke inventory user dengan item_type = 'items_limited'
                await Inventory.addToInventory(user.id, itemToBuy.id, 1, "items_limited");

                // Kurangi chix user
                await User.update(user.id, { chix: user.chix - buyPrice });

                return await message.reply(
                    `✅ *Pembelian Berhasil!*\n\n` +
                    `Item: ${itemToBuy.name}\n` +
                    `Harga: ${buyPrice} Chix\n` +
                    `Saldo: ${user.chix - buyPrice} Chix\n\n` +
                    `Stock tersisa: ${itemToBuy.quantity - 1}`
                );

            case "sell":
            case "s":
                const sellUniqueId = args[1];
                if (!sellUniqueId) {
                    return await message.reply("❌ Masukkan unique_id item!\nContoh: `!market sell COM-UNK-001`");
                }

                const itemToSell = await ItemLimited.getByUniqueId(sellUniqueId.toUpperCase());
                if (!itemToSell) {
                    return await message.reply("❌ Item tidak ditemukan di market!");
                }

                // Cek apakah user punya item ini di inventory
                const userInventory = await Inventory.getByUserAndItem(user.id, itemToSell.id, "items_limited");
                if (!userInventory || userInventory.quantity <= 0) {
                    return await message.reply("❌ Kamu tidak punya item ini!");
                }

                // Harga jual = 80% dari harga dinamis saat ini
                const currentPrice = await ItemLimited.getDynamicPrice(itemToSell);
                const sellPrice = Math.floor(currentPrice * 0.8);

                // Tambah stock di market
                await ItemLimited.increaseStock(itemToSell.id, 1);

                // Kurangi dari inventory (atau hapus jika quantity = 1)
                if (userInventory.quantity === 1) {
                    await Inventory.delete(userInventory.id);
                } else {
                    await runAsync(
                        "UPDATE inventory SET quantity = quantity - 1, updated_at = datetime('now') WHERE id = ?",
                        [userInventory.id]
                    );
                }

                // Tambah chix user
                await User.update(user.id, { chix: user.chix + sellPrice });

                return await message.reply(
                    `✅ *Penjualan Berhasil!*\n\n` +
                    `Item: ${itemToSell.name}\n` +
                    `Harga: ${sellPrice} Chix\n` +
                    `Saldo: ${user.chix + sellPrice} Chix\n\n` +
                    `Stock market: ${itemToSell.quantity + 1}`
                );

            default:
                return await message.reply("❌ Subcommand tidak dikenal!\nGunakan: `list`, `buy`, atau `sell`");
        }
    },
};
