const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth.middleware");
const role = require("../middleware/role.middleware");
const statsController = require("../controllers/stats.controller");

router.get("/me", auth, statsController.getMyStats);
router.get(
  "/student/:id",
  auth,
  role("STAFF"),
  statsController.getStudentStats
);

module.exports = router;
