const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth.middleware");
const role = require("../middleware/role.middleware");
const controller = require("../controllers/analytics.controller");
const { getOverviewAnalytics } = require("../controllers/analytics.controller");

router.get(
  "/student/:id",
  auth,
  role("STAFF"),
  controller.studentAnalytics
);

router.get("/overview", auth, getOverviewAnalytics);

router.get(
  "/batch/:batch",
  auth,
  role("STAFF"),
  controller.batchAnalytics
);

router.get(
  "/department/:dept",
  auth,
  role("STAFF"),
  controller.departmentAnalytics
);

module.exports = router;
