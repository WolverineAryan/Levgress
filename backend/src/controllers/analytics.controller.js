const analyticsService = require("../services/analytics.service");

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
