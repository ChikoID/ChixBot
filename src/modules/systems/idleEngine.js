function updateIdle(player, items, inventory, userId) {
    const now = Date.now();
    if (!player.last_update || player.last_update <= 0) {
        player.last_update = now;
        return { player, inventory };
    }

    const minutes = (now - player.last_update) / 60000;

    if (minutes <= 0) return { player, inventory };

    let totalStorage = inventory.reduce((acc, inv) => acc + inv.quantity, 0);
    const idleItems = items.filter(item => item.is_idle_item === 1);
    
    for (const item of idleItems) {
        if (totalStorage >= player.storage_cap) break;

        const produced = item.drop_rate * minutes;    
        const spaceLeft = player.storage_cap - totalStorage;
        if (spaceLeft <= 0) break;

        const addAmount = Math.floor(Math.min(produced, spaceLeft));
        
        if (addAmount <= 0) continue;

        const itm = inventory.find((inv) => inv.item_id === item.id && (inv.item_type || "items") === "items");

        if (itm) {
            itm.quantity += addAmount;
        } else {
            inventory.push({
                user_id: userId,
                item_id: item.id,
                item_type: "items",
                quantity: addAmount,
            });
        }

        totalStorage += addAmount;
    }

    player.last_update = now;
    return { player, inventory };
}

module.exports = { updateIdle };