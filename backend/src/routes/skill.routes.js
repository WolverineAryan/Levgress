const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth.middleware");
const role = require("../middleware/role.middleware");
const skillController = require("../controllers/skill.controller");
const { body } = require("express-validator");
const validate = require("../middleware/validate");
const { getMasterSkills } = require("../controllers/skill.controller");

// Student routes
router.post(
  "/",
  auth,
  role("STUDENT"),
  [
    body("skillId").isMongoId(),
    body("level").isIn(["BEGINNER", "INTERMEDIATE", "ADVANCED"])
  ],
  validate,
  skillController.addSkill
);
router.get("/master", auth, getMasterSkills);
router.put("/:id", auth, role("STUDENT"), skillController.updateSkill);
router.get("/me", auth, role("STUDENT"), skillController.getMySkills);

// Public / staff view
router.get(
  "/student/:id",
  auth,
  skillController.getStudentSkills
);

module.exports = router;
