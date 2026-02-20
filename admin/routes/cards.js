const express = require("express");
const { requireAuth } = require("../middleware/auth");
const CardsController = require("../controllers/cardsController");
const router = express.Router();

router.get("/", requireAuth, CardsController.renderCards);
router.get("/:id/edit", requireAuth, CardsController.renderEdit);
router.post("/create", requireAuth, CardsController.createCards);
router.post("/:id/update", requireAuth, CardsController.updateCards);
router.post("/:id/delete", requireAuth, CardsController.deleteCards);

module.exports = router;
