const express = require("express");
const router = express.Router();
const {
  createAssignment,
  addAttendance,
  addMultipleAttendances,
  createQuiz,
} = require("../controllers/Teacher");
const {
  getTeacherById,
  getStudentsByTeacherId,
  getCoursesByTeacherId,
  calculateAverageAttendance,
  calculateAverageGrade,
  getAssignmentsByTeacherId,
  getTeacherAnnouncements,
  fetchHomeworkForStudentsInTeacherCourses,
  fetchQuizDataForStudentsInTeacherCourses,
} = require("../controllers/Teacher");

router.post("/createAssignment", createAssignment);
router.post("/addAttendance", addMultipleAttendances);
router.post("/createQuiz", createQuiz);
router.get("/get-teacher", getTeacherById);
router.post("/getStudentsByTeacherId", getStudentsByTeacherId);
router.post("/getCoursesByTeacherId", getCoursesByTeacherId);
router.post("/getCalculatedAvgAttendance", calculateAverageAttendance);
router.post("/getCalculatedGradeAttendance", calculateAverageGrade);
router.post("/getAssignmentsByTeacherId", getAssignmentsByTeacherId);

router.post("/getNotificationsByTeacherId", getTeacherAnnouncements);
router.post(
  "/fetchHomeworkForStudentsInTeacherCourses",
  fetchHomeworkForStudentsInTeacherCourses
);
router.post(
  "/fetchQuizDataForStudentsInTeacherCourses",
  fetchQuizDataForStudentsInTeacherCourses
);
module.exports = router;
