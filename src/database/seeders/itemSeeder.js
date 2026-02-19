const Item = require("../../models/item");

// Seed data untuk item-item dalam game yang berisi sampah luar angkasa
const items = [
    // Common (murah & sering ditemui)
    { name: "plastic", price: 3, rarity: "common", dropRate: 10 },
    { name: "paper", price: 2, rarity: "common", dropRate: 10 },
    { name: "glass", price: 4, rarity: "common", dropRate: 10 },
    { name: "metal", price: 5, rarity: "common", dropRate: 10 },
    { name: "bottle", price: 3, rarity: "common", dropRate: 10 },

    // Tambahan common
    { name: "cardboard", price: 2, rarity: "common", dropRate: 10 },
    { name: "tin", price: 4, rarity: "common", dropRate: 10 },
    { name: "wrapper", price: 1, rarity: "common", dropRate: 10 },
    { name: "rubber", price: 3, rarity: "common", dropRate: 10 },
    { name: "fabric", price: 3, rarity: "common", dropRate: 10 },

    // Rare (mulai bernilai)
    { name: "panel", price: 25, rarity: "rare", dropRate: 4.8 },
    { name: "cable", price: 22, rarity: "rare", dropRate: 4.8 },
    { name: "casing", price: 30, rarity: "rare", dropRate: 4.8 },
    { name: "circuit", price: 28, rarity: "rare", dropRate: 4.8 },

    // Epic (jarang & mahal)
    { name: "qchip", price: 120, rarity: "epic", dropRate: 0.6 },
    { name: "alloy", price: 140, rarity: "epic", dropRate: 0.6 },
    { name: "residue", price: 160, rarity: "epic", dropRate: 0.6 },

    // Legendary (super langka)
    { name: "chixcore", price: 600, rarity: "legendary", dropRate: 0.12 },
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
