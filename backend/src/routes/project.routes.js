const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth.middleware");
const role = require("../middleware/role.middleware");
const projectController = require("../controllers/project.controller");
const {getProjectComments, addProjectComment} = require("../controllers/project.controller");

// Student
router.post("/", auth, role("STUDENT"), projectController.createProject);
router.get("/me", auth, role("STUDENT"), projectController.getMyProjects);
router.put(
  "/:projectId/progress",
  auth,
  role("STUDENT"),
  projectController.updateProgress
);
router.post(
  "/:projectId/milestones",
  auth,
  role("STUDENT"),
  projectController.addMilestone
);

// Staff
router.post(
  "/milestones/:id/approve",
  auth,
  role("STAFF"),
  projectController.approveMilestone
);
router.post(
  "/:projectId/complete",
  auth,
  role("STAFF"),
  projectController.completeProject
);

router.get("/:id/comments", auth, getProjectComments);
router.post("/:id/comment", auth, addProjectComment);

// Public / staff
router.get(
  "/student/:id",
  auth,
  projectController.getStudentProjects
);

module.exports = router;
