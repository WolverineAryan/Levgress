const analyticsService = require("../services/analytics.service");
const User = require("../models/User");
const Project = require("../models/Project");

exports.studentAnalytics = async (req, res) => {
  const data = await analyticsService.computeStudentAnalytics(req.params.id);
  res.json(data);
};

exports.batchAnalytics = async (req, res) => {
  const data = await analyticsService.computeBatchAnalytics(req.params.batch);
  res.json(data);
};

exports.departmentAnalytics = async (req, res) => {
  const data = await analyticsService.computeDepartmentAnalytics(req.params.dept);
  res.json(data);
};

exports.monthlyProjectTrend = async (req, res) => {
  try {
    const trend = await Project.aggregate([
      {
        $match: { status: "COMPLETED" }
      },
      {
        $group: {
          _id: {
            year: { $year: "$updatedAt" },
            month: { $month: "$updatedAt" }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 }
      }
    ]);

    const formatted = trend.map(t => ({
      month: `${t._id.month}/${t._id.year}`,
      completed: t.count
    }));

    res.json(formatted);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Trend error" });
  }
};

exports.getOverviewAnalytics = async (req, res) => {
  try {
    const students = await User.find({ role: "STUDENT" });

    const totalStudents = students.length;

    const avgLevel =
      totalStudents === 0
        ? 0
        : students.reduce((sum, s) => sum + (s.level || 1), 0) /
          totalStudents;

    const levelMap = {};

    students.forEach((student) => {
      const lvl = student.level || 1;
      levelMap[lvl] = (levelMap[lvl] || 0) + 1;
    });

    const levelDistribution = Object.keys(levelMap).map((lvl) => ({
      level: Number(lvl),
      count: levelMap[lvl],
    }));

    const completed = await Project.countDocuments({ status: "COMPLETED" });
    const pending = await Project.countDocuments({ status: "PENDING" });
    const rejected = await Project.countDocuments({ status: "REJECTED" });

    res.json({
      totalStudents,
      avgLevel: Number(avgLevel.toFixed(2)),
      levelDistribution,
      projectStatus: {
        completed,
        pending,
        rejected,
      },
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
};