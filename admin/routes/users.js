const express = require("express");
const { requireAuth } = require("../middleware/auth");
const UsersController = require("../controllers/usersController");
const router = express.Router();

router.get("/", requireAuth, UsersController.renderUsers);

module.exports = router;
