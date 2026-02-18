const fs = require("fs");
const path = require("path");
const ejs = require("ejs");
const User = require("../../src/models/user");

const renderView = (viewName, data = {}) => {
    const viewPath = path.join(__dirname, "../views", `${viewName}.ejs`);
    const template = fs.readFileSync(viewPath, "utf8");
    return ejs.render(template, data);
};

class UsersController {
    static async renderUsers(req, res) {
        const users = await User.list();
        const body = renderView("dashboard/users", { users });
        res.render("layouts/admin", { title: "Users Management", body });
    }
}

module.exports = UsersController;
