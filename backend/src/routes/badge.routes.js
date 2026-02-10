const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth.middleware");
const StudentBadge = require("../models/StudentBadge");

router.get("/me", auth, async (req, res) => {
  const badges = await StudentBadge.find({ studentId: req.user._id })
    .populate("badgeId");
  res.json(badges);
});

module.exports = router;
