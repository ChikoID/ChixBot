const ItemLimited = require("../../models/itemLimited");

const limitedItems = [
	{ name: "ancient-relic", price: 2500, quantity: 25 },
	{ name: "void-crystal", price: 5000, quantity: 10 },
	{ name: "stellar-core", price: 10000, quantity: 5 },
];

async function seedLimitedItems() {
	try {
		for (const item of limitedItems) {
			const existing = await ItemLimited.getByName(item.name);
			if (!existing) {
				await ItemLimited.create(item.name, item.price, item.quantity);
			}
		}
	} catch (error) {
		console.error("❌ Error seeding limited items:", error);
	}
}

module.exports = { seedLimitedItems };