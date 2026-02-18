class AuthController {
    static getAdminCredentials() {
        const username = process.env.ADMIN_USERNAME || "admin";
        const password = process.env.ADMIN_PASSWORD || "admin123";
        return { username, password };
    }

    static renderLogin(req, res) {
        const error = req.query.error || "";
        return res.render("login", { error });
    }

    static handleLogin(req, res) {
        const { username, password } = req.body || {};
        const { username: adminUsername, password: adminPassword } = AuthController.getAdminCredentials();

        if (username !== adminUsername || password !== adminPassword) {
            return res.redirect("/auth/login?error=Username%20atau%20password%20salah");
        }

        const cookieData = JSON.stringify({
            isAdmin: true,
            username: adminUsername,
        });
        res.cookie("chix_admin_sid", cookieData, {
            maxAge: 1000 * 60 * 60 * 24 * 7,
            httpOnly: true,
            signed: true,
            sameSite: "lax",
        });

        return res.redirect("/auth/me");
    }

    static handleLogout(req, res) {
        res.clearCookie("chix_admin_sid");
        return res.redirect("/auth/login");
    }

    static renderMe(req, res) {
        let username = "admin";
        if (req.signedCookies && req.signedCookies.chix_admin_sid) {
            try {
                const cookieData = JSON.parse(req.signedCookies.chix_admin_sid);
                username = cookieData.username || "admin";
            } catch (_) {
                username = "admin";
            }
        }
        return res.render("admin-home", { username });
    }
}

module.exports = AuthController;
