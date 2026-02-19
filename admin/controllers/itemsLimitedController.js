const fs = require("fs");
const path = require("path");
const ejs = require("ejs");
const ItemLimited = require("../../src/models/itemLimited");

const renderView = (viewName, data = {}) => {
    const viewPath = path.join(__dirname, "../views", `${viewName}.ejs`);
    const template = fs.readFileSync(viewPath, "utf8");
    return ejs.render(template, data);
};

const toNumber = (value) => Number(value);

class ItemsLimitedController {
    static async renderItems(req, res) {
        const items = await ItemLimited.list();
        const body = renderView("dashboard/items-limited", {
            items,
            editItem: null,
            error: req.query.error || "",
            success: req.query.success || "",
        });
        return res.render("layouts/admin", { title: "Items Limited", body });
    }

    static async renderEdit(req, res) {
        const id = Number(req.params.id);
        const editItem = await ItemLimited.getById(id);

        if (!editItem) {
            return res.redirect("/items-limited?error=Item%20limited%20tidak%20ditemukan");
        }

        const items = await ItemLimited.list();
        const body = renderView("dashboard/items-limited", {
            items,
            editItem,
            error: req.query.error || "",
            success: req.query.success || "",
        });
        return res.render("layouts/admin", { title: "Items Limited", body });
    }

    static async createItem(req, res) {
        const { unique_id, name, price, quantity } = req.body || {};
        const parsedPrice = toNumber(price);
        const parsedQuantity = toNumber(quantity);

        if (!unique_id || !name || Number.isNaN(parsedPrice) || Number.isNaN(parsedQuantity)) {
            return res.redirect("/items-limited?error=Data%20item%20limited%20tidak%20valid");
        }

        try {
            await ItemLimited.create(String(unique_id).trim(), String(name).trim(), parsedPrice, parsedQuantity);
            return res.redirect("/items-limited?success=Item%20limited%20berhasil%20ditambahkan");
        } catch (_) {
            return res.redirect("/items-limited?error=Gagal%20menambahkan%20item%20limited");
        }
    }

    static async updateItem(req, res) {
        const id = Number(req.params.id);
        const { unique_id, name, price, quantity } = req.body || {};
        const parsedPrice = toNumber(price);
        const parsedQuantity = toNumber(quantity);

        if (!id || !unique_id || !name || Number.isNaN(parsedPrice) || Number.isNaN(parsedQuantity)) {
            return res.redirect("/items-limited?error=Data%20item%20limited%20tidak%20valid");
        }

        await ItemLimited.update(id, String(unique_id).trim(), String(name).trim(), parsedPrice, parsedQuantity);
        return res.redirect("/items-limited?success=Item%20limited%20berhasil%20diupdate");
    }

    static async deleteItem(req, res) {
        const id = Number(req.params.id);

        if (!id) {
            return res.redirect("/items-limited?error=ID%20item%20limited%20tidak%20valid");
        }

        await ItemLimited.delete(id);
        return res.redirect("/items-limited?success=Item%20limited%20berhasil%20dihapus");
    }
}

module.exports = ItemsLimitedController;
