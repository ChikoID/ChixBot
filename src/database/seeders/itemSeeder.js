const Item = require("../../models/item");

// Seed data untuk item-item dalam game yang berisi sampah luar angkasa
const items = [
    // Common
    { name: "plastic", price: 10, rarity: "common", dropRate: 10 },
    { name: "paper", price: 5, rarity: "common", dropRate: 10 },
    { name: "glass", price: 15, rarity: "common", dropRate: 10 },
    { name: "metal", price: 20, rarity: "common", dropRate: 10 },
    { name: "bottle", price: 15, rarity: "common", dropRate: 10 },

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
    { name: "chixcore", price: 1200, rarity: "legendary", dropRate: 0.12 },
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
