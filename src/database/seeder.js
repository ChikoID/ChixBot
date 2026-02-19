const { seedLimitedItems } = require("./seeders/itemLimitedSeeder");
const { seedItems } = require("./seeders/itemSeeder");

async function main() {
    await seedItems();
    await seedLimitedItems();
}

module.exports = { main };
