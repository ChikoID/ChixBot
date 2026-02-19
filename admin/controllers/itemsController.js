const fs = require("fs");
const path = require("path");
const ejs = require("ejs");
const Item = require("../../src/models/item");

const renderView = (viewName, data = {}) => {
    const viewPath = path.join(__dirname, "../views", `${viewName}.ejs`);
    const template = fs.readFileSync(viewPath, "utf8");
    return ejs.render(template, data);
};

const toNumber = (value) => Number(value);

class ItemsController {
    static async renderItems(req, res) {
        const items = await Item.list();
        const body = renderView("dashboard/items", {
            items,
            editItem: null,
            error: req.query.error || "",
            success: req.query.success || "",
        });
        return res.render("layouts/admin", { title: "Items Management", body });
    }

    static async renderEdit(req, res) {
        const id = Number(req.params.id);
        const editItem = await Item.getById(id);

        if (!editItem) {
            return res.redirect("/items?error=Item%20tidak%20ditemukan");
        }

        const items = await Item.list();
        const body = renderView("dashboard/items", {
            items,
            editItem,
            error: req.query.error || "",
            success: req.query.success || "",
        });
        return res.render("layouts/admin", { title: "Items Management", body });
    }

    static async createItem(req, res) {
        const { name, price, rarity, drop_rate, is_idle_item } = req.body || {};
        const parsedPrice = toNumber(price);
        const parsedDropRate = Number(drop_rate);
        const parsedIdleItem = is_idle_item === "0" ? 0 : 1;

        if (!name || !rarity || Number.isNaN(parsedPrice) || Number.isNaN(parsedDropRate)) {
            return res.redirect("/items?error=Data%20item%20tidak%20valid");
        }

        await Item.create(String(name).trim(), parsedPrice, String(rarity).trim(), parsedDropRate, parsedIdleItem);
        return res.redirect("/items?success=Item%20berhasil%20ditambahkan");
    }

    static async updateItem(req, res) {
        const id = Number(req.params.id);
        const { name, price, rarity, drop_rate, is_idle_item } = req.body || {};
        const parsedPrice = toNumber(price);
        const parsedDropRate = Number(drop_rate);
        const parsedIdleItem = is_idle_item === "0" ? 0 : 1;

        if (!id || !name || !rarity || Number.isNaN(parsedPrice) || Number.isNaN(parsedDropRate)) {
            return res.redirect("/items?error=Data%20item%20tidak%20valid");
        }

        await Item.update(id, String(name).trim(), parsedPrice, String(rarity).trim(), parsedDropRate, parsedIdleItem);
        return res.redirect("/items?success=Item%20berhasil%20diupdate");
    }

    static async deleteItem(req, res) {
        const id = Number(req.params.id);

        if (!id) {
            return res.redirect("/items?error=ID%20item%20tidak%20valid");
        }

        await Item.delete(id);
        return res.redirect("/items?success=Item%20berhasil%20dihapus");
    }
}

module.exports = ItemsController;
