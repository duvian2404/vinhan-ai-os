const express = require("express");
const router = express.Router();

const registController = require("../controllers/registController");

router.post("/register", registController.register);

module.exports = router;
