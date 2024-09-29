const express = require("express");
const router = express.Router();
const { createAssignment, addAttendance ,addMultipleAttendances,createQuiz} = require("../controllers/Teacher");

router.post("/createAssignment", createAssignment);
router.post("/addAttendance", addMultipleAttendances);
router.post("/createQuiz", createQuiz);
module.exports = router;
