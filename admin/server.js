require("dotenv").config({ quiet: true });

const bodyParser = require("body-parser");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const { requireAuth } = require("./middleware/auth");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser(process.env.SESSION_SECRET || "chikosecret"));
app.use(express.static(path.join(__dirname, "public")));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use((req, res, next) => {
    let cookieUser = null;
    if (req.signedCookies && req.signedCookies.chix_admin_sid) {
        try {
            cookieUser = JSON.parse(req.signedCookies.chix_admin_sid);
        } catch (_) {
            cookieUser = null;
        }
    }

    res.locals.user = cookieUser;
    res.locals.error = req.query.error || null;
    res.locals.currentPath = req.path;
    next();
});

app.get("/", (req, res) => {
    if (req.signedCookies.chix_admin_sid) {
        return res.redirect("/auth/me");
    }

    return res.redirect("/auth/login");
});

app.use("/auth", require("./routes/auth"));
app.use("/cards", requireAuth, require("./routes/cards"));
app.use("/users", requireAuth, require("./routes/users"));
app.use("/items", requireAuth, require("./routes/items"));
app.use("/items-limited", requireAuth, require("./routes/itemsLimited"));
app.use("/inventory", requireAuth, require("./routes/inventory"));
app.use("/assets", express.static(path.join(__dirname, "../assets")));

app.listen(PORT, () => console.log(`Admin server jalan di http://localhost:${PORT}`));
