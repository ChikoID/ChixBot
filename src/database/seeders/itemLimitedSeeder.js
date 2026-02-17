const ItemLimited = require("../../models/itemLimited");

const limitedItems = [
	{ unique_id: "COM-ANT-001", name: "Ancient Relic", price: 2500, quantity: 50 },
	{ unique_id: "RAR-VOI-002", name: "Void Crystal", price: 5000, quantity: 30 },
	{ unique_id: "EPI-STE-003", name: "Stellar Core", price: 10000, quantity: 15 },
	{ unique_id: "LEG-TIM-004", name: "Time Shard", price: 25000, quantity: 5 },
	{ unique_id: "MYT-COS-005", name: "Cosmic Fragment", price: 50000, quantity: 2 },
];

async function seedLimitedItems() {
	try {
		for (const item of limitedItems) {
			const existing = await ItemLimited.getByUniqueId(item.unique_id);
			if (!existing) {
				await ItemLimited.create(item.unique_id, item.name, item.price, item.quantity);
			}
		}
	} catch (error) {
		console.error("❌ Error seeding limited items:", error);
	}
}

module.exports = { seedLimitedItems };