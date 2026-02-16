const express = require("express");
const router = express.Router();
const { getStudents } = require("../controllers/user.controller");
const auth = require("../middleware/auth.middleware");

router.get("/students", auth, getStudents);

module.exports = router;
