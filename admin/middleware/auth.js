function requireAuth(req, res, next) {
    let cookieAdmin = null;
    if (req.signedCookies && req.signedCookies.chix_admin_sid) {
        try {
            cookieAdmin = JSON.parse(req.signedCookies.chix_admin_sid);
            if (cookieAdmin && cookieAdmin.isAdmin === true) {
                return next();
            }
        } catch (_) {
            cookieAdmin = null;
        }
    }

    return res.redirect("/auth/login");
}

function requireGuest(req, res, next) {
    let cookieAdmin = null;
    if (req.signedCookies && req.signedCookies.chix_admin_sid) {
        try {
            cookieAdmin = JSON.parse(req.signedCookies.chix_admin_sid);
            if (cookieAdmin && cookieAdmin.isAdmin === true) {
                return res.redirect("/auth/me");
            }
        } catch (_) {
            cookieAdmin = null;
        }
    }

    return next();
}

module.exports = {
    requireAuth,
    requireGuest,
};
