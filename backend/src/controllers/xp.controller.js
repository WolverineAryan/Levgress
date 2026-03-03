const XpHistory = require("../models/XpHistory");

exports.getMyXpHistory = async (req, res) => {
  try {
    const history = await XpHistory.find({
      studentId: req.user._id,
    }).sort({ createdAt: 1 });

    const formatted = history.map((h) => ({
      date: h.createdAt.toISOString().split("T")[0],
      xp: h.totalXpAfter,
    }));

    res.json(formatted);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch XP history" });
  }
};