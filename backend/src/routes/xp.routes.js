const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth.middleware");
const controller = require("../controllers/xp.controller");

router.get("/me", auth, controller.getMyXpHistory);

module.exports = router;