const express = require("express");
const { requireAuth } = require("../middleware/auth");
const ItemsLimitedController = require("../controllers/itemsLimitedController");

const router = express.Router();

router.get("/", requireAuth, ItemsLimitedController.renderItems);
router.get("/:id/edit", requireAuth, ItemsLimitedController.renderEdit);
router.post("/create", requireAuth, ItemsLimitedController.createItem);
router.post("/:id/update", requireAuth, ItemsLimitedController.updateItem);
router.post("/:id/delete", requireAuth, ItemsLimitedController.deleteItem);

module.exports = router;
