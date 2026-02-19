const express = require("express");
const { requireAuth } = require("../middleware/auth");
const InventoryController = require("../controllers/inventoryController");
const router = express.Router();

router.get("/", requireAuth, InventoryController.renderInventory);

module.exports = router;
