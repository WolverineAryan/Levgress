const StudentStats = require("../models/StudentStats");

exports.getMyStats = async (req, res) => {
  const stats = await StudentStats.findOne({ studentId: req.user._id });
  res.json(stats);
};

exports.getStudentStats = async (req, res) => {
  const stats = await StudentStats.findOne({ studentId: req.params.id });
  res.json(stats);
};
