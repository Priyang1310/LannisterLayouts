const express = require("express");
const {createCourse,createTeachers,createStudents}=require("../controllers/Admin")
const router = express.Router();

router.post("/createCourse", createCourse);
router.post("/createTeachers", createTeachers);
router.post("/createStudents", createStudents);

module.exports = router;