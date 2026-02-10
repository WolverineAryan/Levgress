const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth.middleware");
const role = require("../middleware/role.middleware");
const StagnationAlert = require("../models/StagnationAlert");

router.get(
  "/stagnation",
  auth,
  role("STAFF"),
  async (req, res) => {
    const alerts = await StagnationAlert.find({ isResolved: false })
      .populate("studentId", "name email batch department")
      .sort({ createdAt: -1 });

    res.json(alerts);
  }
);

module.exports = router;
