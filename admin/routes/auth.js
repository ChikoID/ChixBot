const express = require("express");
const {
	requireAuth,
	requireGuest,
} = require("../middleware/auth");
const AuthController = require("../controllers/authController");
const DashboardController = require("../controllers/dashboardController");

const router = express.Router();

router.get("/login", requireGuest, AuthController.renderLogin);
router.post("/login", requireGuest, AuthController.handleLogin);
router.get("/me", requireAuth, DashboardController.dashboardGet);
router.get("/logout", requireAuth, AuthController.handleLogout);

module.exports = router;
