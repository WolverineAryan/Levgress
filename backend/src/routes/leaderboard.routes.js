const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth.middleware");
const role = require("../middleware/role.middleware");
const controller = require("../controllers/leaderboard.controller");

router.get("/", auth, controller.getLeaderboard);

module.exports = router;