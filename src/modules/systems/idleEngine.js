const idleRemainderState = new Map();

function getRemainderKey(userId, itemId) {
    return `${userId}:${itemId}`;
}

function updateIdle(player, items, inventory, userId) {
    const now = Date.now();
    if (!player.last_update || player.last_update <= 0) {
        player.last_update = now;
        return { player, inventory };
    }

    const elapsedMs = now - Number(player.last_update || 0);
    if (!Number.isFinite(elapsedMs) || elapsedMs <= 0) {
        player.last_update = now;
        return { player, inventory };
    }

    const minutes = elapsedMs / 60000;
    if (minutes <= 0) return { player, inventory };

    const rawEfficiency = Number(process.env.IDLE_EFFICIENCY || 0.35);
    const efficiency = Number.isFinite(rawEfficiency) && rawEfficiency > 0 ? rawEfficiency : 0;
    if (efficiency <= 0) {
        player.last_update = now;
        return { player, inventory };
    }

    const storageCapRaw = Number(player.storage_cap || 0);
    const storageCap = Number.isFinite(storageCapRaw) && storageCapRaw > 0 ? Math.floor(storageCapRaw) : 0;
    if (storageCap <= 0) {
        player.last_update = now;
        return { player, inventory };
    }

    let totalStorage = inventory.reduce((acc, inv) => {
        const qty = Number(inv.quantity || 0);
        return acc + (Number.isFinite(qty) && qty > 0 ? qty : 0);
    }, 0);
    const idleItems = items.filter(item => item.is_idle_item === 1);
    
    for (const item of idleItems) {
        if (totalStorage >= storageCap) break;

        const dropRate = Number(item.drop_rate || 0);
        if (!Number.isFinite(dropRate) || dropRate <= 0) continue;

        const produced = dropRate * minutes * efficiency;
        const remainderKey = getRemainderKey(userId, item.id);
        const previousRemainder = idleRemainderState.get(remainderKey) || 0;
        const producedWithCarry = produced + previousRemainder;

        const spaceLeft = storageCap - totalStorage;
        if (spaceLeft <= 0) break;

        const cappedProduced = Math.min(producedWithCarry, spaceLeft);
        let addAmount = Math.floor(cappedProduced);

        if (addAmount > spaceLeft) {
            addAmount = spaceLeft;
        }

        const remainder = cappedProduced - addAmount;
        idleRemainderState.set(remainderKey, remainder > 0 ? remainder : 0);
        
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