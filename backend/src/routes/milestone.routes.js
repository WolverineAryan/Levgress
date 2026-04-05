const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth.middleware");
const role = require("../middleware/role.middleware");

const milestone = require("../controllers/milestone.controller");

/* STUDENT */

router.post(
  "/:projectId",
  auth,
  role("STUDENT"),
  milestone.addMilestone
);

router.get(
  "/:projectId",
  auth,
  milestone.getMilestones
);

router.put(
  "/:id/complete",
  auth,
  role("STUDENT"),
  milestone.completeMilestone
);

router.put(
  "/:id/evidence",
  auth,
  role("STUDENT"),
  milestoneController.uploadEvidence
);

module.exports = router;