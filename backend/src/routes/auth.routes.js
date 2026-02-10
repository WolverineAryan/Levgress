const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const authMiddleware = require("../middleware/auth.middleware");
const { body } = require("express-validator");
const validate = require("../middleware/validate");

router.post("/login", authController.login);
router.get("/me", authMiddleware, authController.me);

// Optional: registration (remove in production)
router.post("/register", authController.register);

//login
router.post(
  "/login",
  [
    body("email").isEmail(),
    body("password").isLength({ min: 6 })
  ],
  validate,
  authController.login
);
module.exports = router;
