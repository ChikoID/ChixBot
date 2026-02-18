const fs = require("fs");
const path = require("path");
const ejs = require("ejs");

const renderView = (viewName, data = {}) => {
    const viewPath = path.join(__dirname, "../views", `${viewName}.ejs`);
    const template = fs.readFileSync(viewPath, "utf8");
    return ejs.render(template, data);
};

class DashboardController {
    static dashboardGet(req, res) {
        let username = "chiko";
        if (req.signedCookies && req.signedCookies.chix_admin_sid) {
            try {
                const cookieData = JSON.parse(req.signedCookies.chix_admin_sid);
                username = cookieData.username || "chiko";
            } catch (_) {
                username = "chiko";
            }
        }
        const body = renderView("dashboard", { username });
        res.render("layouts/admin", { title: "Admin Dashboard", body });
    }
}

module.exports = DashboardController;
