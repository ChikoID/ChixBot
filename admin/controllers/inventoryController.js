const fs = require("fs");
const path = require("path");
const ejs = require("ejs");
const Inventory = require("../../src/models/inventory");

const renderView = (viewName, data = {}) => {
    const viewPath = path.join(__dirname, "../views", `${viewName}.ejs`);
    const template = fs.readFileSync(viewPath, "utf8");
    return ejs.render(template, data);
};

class InventoryController {
    static async renderInventory(req, res) {
        const inventory = await Inventory.listWithDetails();
        const body = renderView("dashboard/inventory", { inventory });
        return res.render("layouts/admin", { title: "Inventory", body });
    }
}

module.exports = InventoryController;
