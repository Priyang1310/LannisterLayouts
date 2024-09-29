const express = require("express");
const router = express.Router();
const { submitAssignment } = require("../controllers/Student");
const {
  getStudentById,
  getEnrolledCoursesByStudentId,
  getStudentHomeworkSubmissions,
  getStudentQuizzes,
  getStudentAnnouncements,
  getStudentAttendanceWithPercentage,
  getHomeworkSubmissions,
  getStudentAssignmentMarks,
  fetchAverageAttendanceOfStudent,
} = require("../controllers/Student");
router.post("/get-student", getStudentById);
router.post("/get-course-by-student-id", getEnrolledCoursesByStudentId);
// router.post('/get-homework-by-student-id', getStudentHomeworkSubmissions);
router.post("/get-quiz", getStudentQuizzes);
router.post("/get-notifications", getStudentAnnouncements);
router.post("/get-attendance", getStudentAttendanceWithPercentage);
router.post("/get-homework-by-student-id", getHomeworkSubmissions);
router.post("/get-student-assignment-marks", getStudentAssignmentMarks);
router.post(
  "/fetchAverageAttendanceOfStudent",
  fetchAverageAttendanceOfStudent
);

router.post("/upload", submitAssignment);

module.exports = router;
