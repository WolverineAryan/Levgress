const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth.middleware");
const role = require("../middleware/role.middleware");
const { body } = require("express-validator");
const validate = require("../middleware/validate");

const skillController = require("../controllers/skill.controller");

/* ===============================
   STUDENT ROUTES
================================ */
router.post(
  "/",
  auth,
  role("STUDENT"),
  [
    body("skillId").isMongoId(),
    body("level").isIn(["BEGINNER", "INTERMEDIATE", "ADVANCED"]),
  ],
  validate,
  skillController.addSkill
);

router.put(
  "/:id",
  auth,
  role("STUDENT"),
  skillController.updateSkill
);

router.get(
  "/me",
  auth,
  role("STUDENT"),
  skillController.getMySkills
);

/* ===============================
   MASTER SKILLS
================================ */
router.get("/master", auth, skillController.getMasterSkills);

/* ===============================
   PUBLIC / STAFF VIEW
================================ */
router.get(
  "/student/:id",
  auth,
  skillController.getStudentSkills
);

module.exports = router;