const express = require("express");
const { requireAuth } = require("../middleware/auth");
const UsersController = require("../controllers/usersController");
const router = express.Router();

router.get("/", requireAuth, UsersController.renderUsers);
router.get("/:id/edit", requireAuth, UsersController.renderEdit);
router.post("/:id/update", requireAuth, UsersController.update);

module.exports = router;
