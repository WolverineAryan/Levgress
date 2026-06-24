const milestoneService = require('../services/milestone.service');
const asyncHandler = require('../middleware/asyncHandler');

const submitEvidence = asyncHandler(async (req, res) => {
  const { type, text, url, fileName, fileData } = req.body;
  const milestone = await milestoneService.submitEvidence(
    req.params.id,
    req.user._id,
    { type, text, url, fileName, fileData }
  );

  res.status(200).json({
    status: 'success',
    data: { milestone },
  });
});

const staffApproveMilestone = asyncHandler(async (req, res) => {
  const milestone = await milestoneService.staffApproveMilestone(
    req.params.id,
    req.user._id,
    req.body.feedback
  );

  res.status(200).json({
    status: 'success',
    data: { milestone },
  });
});

const staffRejectMilestone = asyncHandler(async (req, res) => {
  const milestone = await milestoneService.staffRejectMilestone(
    req.params.id,
    req.user._id,
    req.body.feedback
  );

  res.status(200).json({
    status: 'success',
    data: { milestone },
  });
});

module.exports = {
  submitEvidence,
  staffApproveMilestone,
  staffRejectMilestone,
};
