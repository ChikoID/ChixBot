const express = require("express");
const { requireAuth } = require("../middleware/auth");
const ItemsController = require("../controllers/itemsController");
const router = express.Router();

router.get("/", requireAuth, ItemsController.renderItems);
router.get("/:id/edit", requireAuth, ItemsController.renderEdit);
router.post("/create", requireAuth, ItemsController.createItem);
router.post("/:id/update", requireAuth, ItemsController.updateItem);
router.post("/:id/delete", requireAuth, ItemsController.deleteItem);

module.exports = router;
