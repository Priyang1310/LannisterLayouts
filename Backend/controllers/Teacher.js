const HomeworkCollections = require("../models/HomeworkCollections");
const Course = require("../models/Course");
const Teacher = require("../models/Teacher");
const Student = require("../models/Student");
const Quiz = require('../models/Quiz');
const createAssignment = async (req, res) => {
  try {
    const { title, description, courseId, dueDate, assignedBy } = req.body;

    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Check if teacher exists
    const teacher = await Teacher.findById(assignedBy);
    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    // Create a new assignment
    const newHomework = new HomeworkCollections({
      title,
      description,
      courseId,
      dueDate,
      assignedDate: new Date(),
      assignedBy: [assignedBy], // Add teacher who is assigning the homework
      submission: [], // Initially, no submissions are made
    });

    // Save the new homework
    const savedHomework = await newHomework.save();

    // Add the homework to the course
    course.homework.push(savedHomework._id);
    await course.save();

    return res.status(201).json({
      message: "Assignment created successfully",
      assignment: savedHomework,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error creating assignment", error });
  }
};
const addAttendance = async (req, res) => {
  const { studentId, courseId, date, status } = req.body;

  // Validate the input
  if (!studentId || !courseId || !date || !status) {
    return res.status(400).json({ message: "All fields are required." });
  }

  // Check if the status is valid
  const validStatuses = ["present", "absent"];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ message: "Invalid attendance status." });
  }

  try {
    // Find the student
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: "Student not found." });
    }

    // Create attendance record
    const attendanceRecord = {
      courseId,
      date,
      status,
    };

    // Check if attendance for the same date and course already exists
    const existingAttendance = student.attendance.find(
      (record) =>
        record.courseId.toString() === courseId &&
        record.date.toISOString().split("T")[0] ===
          new Date(date).toISOString().split("T")[0]
    );

    if (existingAttendance) {
      return res
        .status(400)
        .json({ message: "Attendance for this date already recorded." });
    }

    // Add attendance record to the student's attendance array
    student.attendance.push(attendanceRecord);

    // Save the updated student document
    await student.save();

    return res
      .status(200)
      .json({
        message: "Attendance added successfully.",
        attendance: attendanceRecord,
      });
  } catch (error) {
    console.error("Error adding attendance:", error);
    return res.status(500).json({ message: "Server error." });
  }
};
const addMultipleAttendances = async (req, res) => {
  const { entries } = req.body;

  // Validate the input
  if (!entries || !Array.isArray(entries) || entries.length === 0) {
    return res
      .status(400)
      .json({ message: "Entries field is required and must be an array." });
  }

  try {
    for (const entry of entries) {
      const { courseId, attendance } = entry;

      if (!courseId || !Array.isArray(attendance)) {
        return res
          .status(400)
          .json({
            message:
              "Each entry must contain a courseId and an attendance array.",
          });
      }

      // Loop through each attendance record for the course
      for (const record of attendance) {
        const { studentId, date, status } = record;

        // Validate attendance record fields
        if (!studentId || !date || !status) {
          return res
            .status(400)
            .json({
              message: "All fields in attendance records are required.",
            });
        }

        // Check if the status is valid
        const validStatuses = ["Present", "Absent"];
        if (!validStatuses.includes(status)) {
          return res
            .status(400)
            .json({ message: "Invalid attendance status." });
        }

        // Find the student
        const student = await Student.findById(studentId);
        if (!student) {
          return res
            .status(404)
            .json({ message: `Student with ID ${studentId} not found.` });
        }

        // Create attendance record
        const attendanceRecord = {
          courseId,
          date,
          status,
        };

        // Check if attendance for the same date and course already exists
        const existingAttendance = student.attendance.find(
          (record) =>
            record.courseId.toString() === courseId && record.date === date
        );

        if (existingAttendance) {
          return res
            .status(400)
            .json({
              message: `Attendance for student ${studentId} in course ${courseId} on ${date} already recorded.`,
            });
        }

        // Add attendance record to the student's attendance array
        student.attendance.push(attendanceRecord);

        // Save the updated student document
        await student.save();
      }
    }

    return res
      .status(200)
      .json({ message: "Attendance added successfully for all entries." });
  } catch (error) {
    console.error("Error adding attendance:", error);
    return res.status(500).json({ message: "Server error." });
  }
};

// const createQuiz = async (req, res) => {
//   const { title, description, courseId, questions, duration, assignedDate, dueDate } = req.body;

//   // Validate input
//   if (!title || !courseId || !questions || questions.length === 0 || duration === undefined || !assignedDate || !dueDate) {
//     return res.status(400).json({ message: 'All fields are required.' });
//   }

//   try {
//     // Create the quiz
//     const quiz = new Quiz({
//       title,
//       description,
//       courseId,
//       questions,
//       duration,
//       assignedDate,
//       dueDate,
//     });

//     // Save the quiz to the database
//     const savedQuiz = await quiz.save();

//     // Find all students enrolled in the course
//     const students = await Student.find({ 'courses.courseId': courseId });

//     // Add the quiz to each student's quizzes array
//     for (const student of students) {
//       student.quizzes.push({
//         quizId: savedQuiz._id,
//         status: false, // Initially set to false indicating quiz not attempted
//         score: null,   // Initially no score
//         submissionDate: null // Initially no submission date
//       });
//       await student.save(); // Save the updated student document
//     }

//     return res.status(201).json({ message: 'Quiz created successfully.', quiz: savedQuiz });
//   } catch (error) {
//     console.error('Error creating quiz:', error);
//     return res.status(500).json({ message: 'Server error.' });
//   }
// };

const createQuiz = async (req, res) => {
  const { title, description, courseId, questions, duration, assignedDate, dueDate } = req.body;

  // Validate input
  if (!title || !courseId || !questions || questions.length === 0 || duration === undefined || !assignedDate || !dueDate) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  try {
    // Create the quiz
    const quiz = new Quiz({
      title,
      description,
      courseId,
      questions,
      duration,
      assignedDate,
      dueDate,
    });

    // Save the quiz to the database
    const savedQuiz = await quiz.save();

    // Add the quiz to the course
    await Course.findByIdAndUpdate(courseId, { $push: { quizzes: savedQuiz._id } });

    // Find all students enrolled in the course
    const students = await Student.find({ 'courses.courseId': courseId });

    // Add the quiz to each student's quizzes array
    for (const student of students) {
      student.quizzes.push({
        quizId: savedQuiz._id,
        status: false, // Initially set to false indicating quiz not attempted
        score: null,   // Initially no score
        submissionDate: null // Initially no submission date
      });
      await student.save(); // Save the updated student document
    }

    return res.status(201).json({ message: 'Quiz created successfully.', quiz: savedQuiz });
  } catch (error) {
    console.error('Error creating quiz:', error);
    return res.status(500).json({ message: 'Server error.' });
  }
};


module.exports = {
  createAssignment,
  addAttendance,
  addMultipleAttendances,
  createQuiz
};
