const express = require("express");
const { requireAuth } = require("../middleware/auth");
const ItemsController = require("../controllers/itemsController");
const router = express.Router();

router.get("/", requireAuth, ItemsController.renderItems);

module.exports = router;
