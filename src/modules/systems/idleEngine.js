function updateIdle(player, items, inventory, userId) {
    const now = Date.now();
    const minutes = (now - player.last_update) / 60000;

    if (minutes <= 0) return { player, inventory };

    let totalStorage = inventory.reduce((acc, inv) => acc + inv.quantity, 0);

    for (const item of items) {
        if (totalStorage >= player.storage_cap) break;

        const produced = item.drop_rate * minutes;
        
        // if (produced < 1) continue;
        
        const spaceLeft = player.storage_cap - totalStorage;
        if (spaceLeft <= 0) break;

        const addAmount = Math.floor(Math.min(produced, spaceLeft));
        
        if (addAmount <= 0) continue;

        const itm = inventory.find((inv) => inv.item_id === item.id);

        if (itm) {
            itm.quantity += addAmount;
        } else {
            inventory.push({
                user_id: userId,
                item_id: item.id,
                quantity: addAmount,
            });
        }

        totalStorage += addAmount;
    }

    player.last_update = now;
    return { player, inventory };
}

module.exports = { updateIdle };