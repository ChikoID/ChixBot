const Item = require("../../models/item");

// const items = [
//     { name: "Common Egg", price: 100, rarity: "common", dropRate: 6 },        // 1 item per 10 detik
//     { name: "Rare Egg", price: 500, rarity: "rare", dropRate: 3 },            // 0.5 item per 10 detik
//     { name: "Epic Egg", price: 2000, rarity: "epic", dropRate: 0.6 },         // 0.1 item per 10 detik
//     { name: "Legendary Egg", price: 10000, rarity: "legendary", dropRate: 0.12 }, // 0.02 item per 10 detik
//     { name: "Chicken Feed", price: 50, rarity: "common", dropRate: 12 },      // 2 item per 10 detik
//     { name: "Golden Grain", price: 500, rarity: "rare", dropRate: 4.8 },      // 0.8 item per 10 detik
// ];

// Seed data untuk item-item dalam game yang berisi sampah luar angkasa
const items = [
    // Common
    { name: "plastic", price: 10, rarity: "common", dropRate: 12 },
    { name: "paper", price: 5, rarity: "common", dropRate: 12 },
    { name: "glass", price: 15, rarity: "common", dropRate: 12 },
    { name: "metal", price: 20, rarity: "common", dropRate: 12 },
    { name: "bottle", price: 15, rarity: "common", dropRate: 12 },

    // Rare
    { name: "panel", price: 60, rarity: "rare", dropRate: 4.8 },
    { name: "cable", price: 55, rarity: "rare", dropRate: 4.8 },
    { name: "casing", price: 70, rarity: "rare", dropRate: 4.8 },
    { name: "circuit", price: 65, rarity: "rare", dropRate: 4.8 },

    // Epic
    { name: "qchip", price: 220, rarity: "epic", dropRate: 0.6 },
    { name: "alloy", price: 250, rarity: "epic", dropRate: 0.6 },
    { name: "residue", price: 300, rarity: "epic", dropRate: 0.6 },

    // Legendary
    { name: "chixcore", price: 1200, rarity: "legendary", dropRate: 0.12, isIdleItem: 0 },
];

async function seedItems() {
    try {
        console.log("🌱 Seeding items...");

        for (const item of items) {
            const existing = await Item.getByName(item.name);
            if (!existing) {
                await Item.create(item.name, item.price, item.rarity, item.dropRate, item.isIdleItem);
                console.log(`✅ Created item: ${item.name}`);
            }
        }
    } catch (error) {
        console.error("❌ Error seeding items:", error);
    }
}

module.exports = { seedItems };
