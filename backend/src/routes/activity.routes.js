const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth.middleware");
const ActivityLog = require("../models/ActivityLog");

router.get("/feed", auth, async (req, res) => {
  const feed = await ActivityLog.find({ visibility: "PUBLIC" })
    .sort({ createdAt: -1 })
    .limit(50)
    .populate("userId", "name");

  res.json(feed);
});

module.exports = router;
