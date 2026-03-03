const User = require("../models/User");

exports.getLeaderboard = async (req, res) => {
  try {
    const topStudents = await User.find({ role: "STUDENT" })
      .sort({ xp: -1 })
      .limit(10)
      .select("name xp level department batch");

    res.json(topStudents);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch leaderboard" });
  }
};