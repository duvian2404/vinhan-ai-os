const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");

const summaryController = require("../controllers/summaryController");

router.get("/", authMiddleware, summaryController.getSummaries);

router.post("/", authMiddleware, summaryController.postSummaries);

router.delete("/:id", authMiddleware, summaryController.deleteSummaries);

router.put("/:id", authMiddleware, summaryController.putSummaries);

module.exports = router;
