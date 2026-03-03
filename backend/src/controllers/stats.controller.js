const StudentStats = require("../models/StudentStats");
const detectEngagementRisk = require("../utils/detectEngagementRisk");

/* ===============================
   GET MY STATS (Student)
================================ */
exports.getMyStats = async (req, res) => {
  try {
    const stats = await StudentStats.findOne({
      studentId: req.user._id,
    });

    if (!stats) {
      return res.status(404).json({ message: "Stats not found" });
    }

    const risk = await detectEngagementRisk(req.user._id);

    res.json({
      ...stats._doc,
      engagementRisk: risk,
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ===============================
   GET STUDENT STATS (Staff)
================================ */
exports.getStudentStats = async (req, res) => {
  try {
    const stats = await StudentStats.findOne({
      studentId: req.params.id,
    });

    if (!stats) {
      return res.status(404).json({ message: "Stats not found" });
    }

    const risk = await detectEngagementRisk(req.params.id);

    res.json({
      ...stats._doc,
      engagementRisk: risk,
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};