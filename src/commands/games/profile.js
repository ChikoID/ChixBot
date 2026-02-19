const Inventory = require("../../models/inventory");
const { ensureUser } = require("../../shared/utility/ensureUser");

module.exports = {
    name: "profile",
    description: "Menampilkan profil pemainmu, termasuk statistik, progres, dan informasi penting lainnya.",
    aliases: ["me", "myprofile", "stats"],
    /**
     * @param {import("whatsapp-web.js").Message} message
     * @param {import("whatsapp-web.js").Client} client
     * @param {string[]} args
     */
    async execute(message, client, args) {
        const user = await ensureUser(message);
        if (!user) return;

        const inventory = (await Inventory.getAllByUser(user.id)) || 0;

        const userName = user.name;
        const userChix = user.chix;
        const userStorage = user.storage_cap;
        const filteredInventory = inventory.filter((inv) => inv.item_type === "items");
        const totalItems = filteredInventory.reduce((sum, inv) => sum + inv.quantity, 0);

        const LimitedItems = filteredInventory.filter((inv) => inv.item_type === "limited");
        const totalLimited = LimitedItems.reduce((sum, inv) => sum + inv.quantity, 0);

        const streak = user.daily_streak || 0;

        await message.reply(
            `👤 *Profil ${userName}* 👤\n\n💰 Saldo: $${userChix}\n🎒 Storage: ${totalItems}/${userStorage}\n🏆 Limited Items: ${totalLimited}\n🔥 Streak: ${streak}`,
        );
    },
};
