const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const auth = require("../middleware/auth.middleware");
const role = require("../middleware/role.middleware");

const milestoneController = require("../controllers/milestone.controller");

/* GET MILESTONES */
router.get(
  "/:projectId",
  auth,
  milestoneController.getMilestones
);

/* ADD MILESTONE (optional) */
router.post(
  "/:projectId",
  auth,
  role("STUDENT"),
  milestoneController.addMilestone
);

/* UPLOAD EVIDENCE  */
router.put(
  "/:id/evidence",
  auth,
  role("STUDENT"),
  upload.single("file"),
  milestoneController.uploadEvidence
);

module.exports = router;