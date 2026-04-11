const {
  generateStudentAIInsights
} = require("../services/aiInsightsAI.service");

exports.getAIInsights = async (req, res) => {
  try {
    const studentId = req.user._id;

    const insights = await generateStudentAIInsights(studentId);

    res.json(insights);

  } catch (err) {
    res.status(500).json({
      message: "Failed to generate AI insights",
      error: err.message
    });
  }
};