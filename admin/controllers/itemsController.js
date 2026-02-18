const fs = require("fs");
const path = require("path");
const ejs = require("ejs");
const Item = require("../../src/models/item");

const renderView = (viewName, data = {}) => {
    const viewPath = path.join(__dirname, "../views", `${viewName}.ejs`);
    const template = fs.readFileSync(viewPath, "utf8");
    return ejs.render(template, data);
};

class ItemsController {
    static async renderItems(req, res) {
        const items = await Item.list();
        const body = renderView("dashboard/items", { items });
        res.render("layouts/admin", { title: "Items Management", body });
    }
}

module.exports = ItemsController;
