const { updateIdle } = require("./idleEngine");
const User = require("../../models/user");
const Inventory = require("../../models/inventory");
const Item = require("../../models/item");

let updateInterval = null;

async function startIdleUpdater() {
    updateInterval = setInterval(async () => {
        try {
            const users = await User.list();
            const items = await Item.list();

            for (const user of users) {
                const inventory = await Inventory.getByUser(user.id);
                const { player, inventory: updatedInv } = updateIdle(user, items, inventory, user.id);

                await User.update(player.id, { last_update: player.last_update });

                for (const inv of updatedInv) {
                    await Inventory.updateOrCreate(inv);
                }
            }

            // console.log(`✅ Idle update completed at ${new Date().toLocaleTimeString()}`);
        } catch (error) {
            console.error("Error in idle updater:", error);
        }
    }, 5000);
}

function stopIdleUpdater() {
    if (updateInterval) {
        clearInterval(updateInterval);
        console.log("🛑 Idle updater stopped");
    }
}

module.exports = { startIdleUpdater, stopIdleUpdater };