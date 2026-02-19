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
        const editId = req.query.edit;
        let editUser = null;
        if (editId) {
            editUser = await User.getById(editId);
        }
        const body = renderView("dashboard/users", {
            users,
            editUser,
            error: req.query.error,
            success: req.query.success,
        });
        res.render("layouts/admin", { title: "Users Management", body });
    }

    static async renderEdit(req, res) {
        res.redirect(`/users?edit=${req.params.id}`);
    }

    static async update(req, res) {
        try {
            const { id } = req.params;
            const { name, chix, storage_cap, level, idle_speed_level, idle_speed_multiplier } = req.body;

            await User.update(id, {
                name,
                chix: parseInt(chix) || 0,
                storage_cap: parseInt(storage_cap) || 100,
                level: parseInt(level) || 1,
                idle_speed_level: parseInt(idle_speed_level) || 0,
                idle_speed_multiplier: parseFloat(idle_speed_multiplier) || 1,
            });

            res.redirect("/users?success=User berhasil diupdate");
        } catch (error) {
            console.error("Error updating user:", error);
            res.redirect(`/users?error=${encodeURIComponent(error.message)}`);
        }
    }
}

module.exports = UsersController;
