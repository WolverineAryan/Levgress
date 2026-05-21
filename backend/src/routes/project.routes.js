const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth.middleware");
const role = require("../middleware/role.middleware");
const upload = require("../middleware/upload");

const projectController = require("../controllers/project.controller");

// ---------------- STUDENT ----------------

// Create project
router.post("/", auth, role("STUDENT"), projectController.createProject);

// Get my projects
router.get("/me", auth, role("STUDENT"), projectController.getMyProjects);

// Get project details
router.get("/:projectId", auth, projectController.getProjectById);

// Update project
router.put("/:projectId", auth, role("STUDENT"), projectController.updateProject);

// Upload project images
router.post(
  "/:projectId/images",
  auth,
  role("STUDENT"),
  upload.array("images", 5),
  projectController.uploadProjectImages
);

// ---------------- COMMENTS ----------------

router.get("/:id/comments", auth, projectController.getProjectComments);

router.post("/:id/comment", auth, projectController.addProjectComment);

// ---------------- STAFF ----------------

router.get("/student/:id", auth, projectController.getStudentProjects);

module.exports = router;