const HomeworkCollections = require("../models/HomeworkCollections");
const Course = require("../models/Course");
const Teacher = require("../models/Teacher");
const Student = require("../models/Student");
const Quiz = require("../models/Quiz");
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

    return res.status(200).json({
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
        return res.status(400).json({
          message:
            "Each entry must contain a courseId and an attendance array.",
        });
      }

      // Loop through each attendance record for the course
      for (const record of attendance) {
        const { studentId, date, status } = record;

        // Validate attendance record fields
        if (!studentId || !date || !status) {
          return res.status(400).json({
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
          return res.status(400).json({
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

{
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
}

const createQuiz = async (req, res) => {
  const {
    title,
    description,
    courseId,
    questions,
    duration,
    assignedDate,
    dueDate,
  } = req.body;

  // Validate input
  if (
    !title ||
    !courseId ||
    !questions ||
    questions.length === 0 ||
    duration === undefined ||
    !assignedDate ||
    !dueDate
  ) {
    return res.status(400).json({ message: "All fields are required." });
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
    await Course.findByIdAndUpdate(courseId, {
      $push: { quizzes: savedQuiz._id },
    });

    // Find all students enrolled in the course
    const students = await Student.find({ "courses.courseId": courseId });

    // Add the quiz to each student's quizzes array
    for (const student of students) {
      student.quizzes.push({
        quizId: savedQuiz._id,
        status: false, // Initially set to false indicating quiz not attempted
        score: null, // Initially no score
        submissionDate: null, // Initially no submission date
      });
      await student.save(); // Save the updated student document
    }

    return res
      .status(201)
      .json({ message: "Quiz created successfully.", quiz: savedQuiz });
  } catch (error) {
    console.error("Error creating quiz:", error);
    return res.status(500).json({ message: "Server error." });
  }
};


// Controller to fetch teacher by ID
const getTeacherById = async (req, res) => {
  const { id } = req.body; // Extract the ID from the request body

  try {
    // Fetch teacher using findById
    const teacher = await Teacher.findById(id);

    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    return res.status(200).json(teacher); // Return the teacher data
  } catch (error) {
    console.error("Error fetching teacher:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// Controller to fetch students by teacher ID

const getStudentsByTeacherId = async (req, res) => {
  const teacherId = req.body.id; // Assuming teacherId is passed as a URL parameter

  try {
    // Step 1: Find courses taught by the specified teacher
    const courses = await Course.find({ teachers: teacherId }).exec();

    // Step 2: Collect all student IDs from the courses
    const studentIds = new Set(); // Use a Set to avoid duplicates
    courses.forEach((course) => {
      course.students.forEach((studentId) => {
        studentIds.add(studentId); // Add student IDs to the Set
      });
    });

    // Step 3: Fetch student details based on collected student IDs
    const students = await Student.find({
      _id: { $in: Array.from(studentIds) },
    }).exec();

    return res.status(200).json({ success: true, students });
  } catch (error) {
    console.error("Error fetching students:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

const getCoursesByTeacherId = async (req, res) => {
  const teacherId = req.body.id; // Accessing the teacher's unique id from the request body

  try {
    // Step 1: Find courses taught by the specified teacher
    const courses = await Course.find({ teachers: teacherId }).exec();

    // Step 2: Check if any courses are found
    if (courses.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No courses found for this teacher.",
      });
    }

    // Step 3: Return the courses
    return res.status(200).json({ success: true, courses });
  } catch (error) {
    console.error("Error fetching courses:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

const calculateAverageAttendance = async (req, res) => {
  const teacherId = req.body.id; // Assuming teacherId is passed in the request body

  // Validate teacherId
  if (!teacherId) {
    return res
      .status(400)
      .json({ success: false, message: "Teacher ID is required." });
  }

  try {
    // Step 1: Find courses taught by the specified teacher
    const courses = await Course.find({ teachers: teacherId }).exec();

    // Step 2: Collect all student IDs from the courses
    const studentIds = new Set(); // Use a Set to avoid duplicates

    courses.forEach((course) => {
      if (course.students && course.students.length) {
        course.students.forEach((studentId) => {
          studentIds.add(studentId); // Add student IDs to the Set
        });
      }
    });

    // Step 3: Fetch attendance records for the collected student IDs
    const students = await Student.find({
      _id: { $in: Array.from(studentIds) },
    })
      .populate("attendance.courseId")
      .exec();
    // Step 4: Calculate average attendance for each subject
    const attendanceStats = {}; // { courseId: { totalClasses: Number, attendedClasses: Number } }

    students.forEach((student) => {
      student.attendance.forEach((record) => {
        console.log("Student kaa attendance.....", record);
        const courseId = record.courseId._id.toString(); // Ensure we work with string IDs

        if (!attendanceStats[courseId]) {
          attendanceStats[courseId] = { totalClasses: 0, attendedClasses: 0 };
        }

        attendanceStats[courseId].totalClasses += 1;
        if (record.status === "Present") {
          attendanceStats[courseId].attendedClasses += 1;
        }
      });
    });

    // Step 5: Calculate average attendance for each course
    const averageAttendance = Object.keys(attendanceStats).map((courseId) => {
      const { totalClasses, attendedClasses } = attendanceStats[courseId];
      const average =
        totalClasses > 0 ? (attendedClasses / totalClasses) * 100 : 0; // Convert to percentage
      console.log(
        "CHECKING///////////->CourseId",
        courseId,
        "->>>>>>>attendClass",
        attendedClasses
      );
      return { courseId, averageAttendance: average.toFixed(2) }; // Round to 2 decimal places
    });

    return res.status(200).json({ success: true, averageAttendance });
  } catch (error) {
    console.error("Error calculating average attendance:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

const calculateAverageGrade = async (req, res) => {
  const teacherId = req.body.id; // Assuming teacherId is passed in the request body

  try {
    // Step 1: Find courses taught by the specified teacher
    const courses = await Course.find({ teachers: teacherId })
      .populate("students")
      .exec();

    // Step 2: Collect grades from students in the found courses
    const grades = {}; // Object to store total grades and count for each course
    const courseIds = []; // Array to store course IDs for easier processing

    courses.forEach((course) => {
      courseIds.push(course._id); // Collect course IDs

      // Iterate through the students enrolled in each course
      course.students.forEach((student) => {
        student.quizzes.forEach((quiz) => {
          if (quiz.status) {
            // Consider only quizzes that are submitted
            if (!grades[course._id]) {
              grades[course._id] = { total: 0, count: 0 };
            }
            grades[course._id].total += quiz.score; // Sum scores
            grades[course._id].count += 1; // Increment count
          }
        });
      });
    });

    // Step 3: Calculate average grades for each course
    const averageGrades = {};

    for (const courseId of courseIds) {
      if (grades[courseId]) {
        const total = grades[courseId].total;
        const count = grades[courseId].count;
        averageGrades[courseId] = (total / count).toFixed(2); // Calculate average and round to 2 decimal places
      } else {
        averageGrades[courseId] = 0; // If no quizzes were found, set average to 0
      }
    }

    return res.status(200).json({ success: true, averageGrades });
  } catch (error) {
    console.error("Error calculating average grades:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

const getAssignmentsByTeacherId = async (req, res) => {
  const teacherId = req.body.id; // Assuming the teacherId is passed as a URL parameter

  try {
    // Step 1: Find courses taught by the specified teacher
    const courses = await Course.find({ teachers: teacherId });

    // Step 2: Fetch all homework assignments from these courses
    const assignments = await homeworkCollections
      .find({ courseId: { $in: courses.map((course) => course._id) } })
      .populate("assignedBy") // Optional: populate assignedBy to get teacher details
      .exec();

    return res.status(200).json({ success: true, assignments });
  } catch (error) {
    console.error("Error fetching assignments:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

const getTeacherAnnouncements = async (req, res) => {
  try {
    const teacherId = req.body.id;

    if (!teacherId) {
      return res.status(400).json({ error: "Teacher ID is required" });
    }

    // Find the teacher by ID
    const teacher = await Teacher.findById(teacherId).populate(
      "assigned_courses"
    );

    if (!teacher) {
      return res.status(404).json({ error: "Teacher not found" });
    }

    // Extract course IDs from the teacher's assigned courses
    const courseIds = teacher.assigned_courses.map((course) => course._id);

    // Fetch all announcements for the courses taught by the teacher
    const coursesWithAnnouncements = await Course.find({
      _id: { $in: courseIds },
    })
      .select("announcements") // Only select announcements
      .populate("teachers") // Populate teacher field if necessary
      .lean(); // Convert Mongoose documents to plain JavaScript objects

    // Flatten the announcements into a single array
    const announcements = coursesWithAnnouncements.flatMap(
      (course) => course.announcements
    );

    return res.status(200).json({ announcements });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ error: "An error occurred while fetching announcements" });
  }
};

const fetchHomeworkForStudentsInTeacherCourses = async (req, res) => {
  try {
    const teacherId = req.body.id; // Assuming the teacher ID is passed in the URL

    // Find the courses taught by the teacher
    const courses = await Course.find({ teachers: teacherId }).populate(
      "students"
    );

    if (!courses || courses.length === 0) {
      return res
        .status(404)
        .json({ message: "No courses found for this teacher" });
    }

    // Prepare a list to hold homework submissions for each student
    const studentHomework = [];

    // Iterate through each course and collect homework submissions from students
    for (const course of courses) {
      for (const student of course.students) {
        // Fetch homework submissions for each student
        const studentData = await Student.findById(student._id).populate(
          "homeworkSubmissions.homeworkId"
        );

        studentHomework.push({
          studentId: student._id,
          studentName: student.name, // Assuming the Student model has a 'name' field
          courseId: course._id,
          courseName: course.course_name,
          homework: studentData.homeworkSubmissions.map((submission) => ({
            homeworkId: submission.homeworkId,
            submissionDate: submission.submissionDate,
            // Add any other relevant submission details here
          })),
        });
      }
    }

    return res.status(200).json({ studentHomework });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ error: "An error occurred while fetching homework submissions" });
  }
};

const fetchQuizDataForStudentsInTeacherCourses = async (req, res) => {
  try {
    const teacherId = req.body.teacherId; // Assuming the teacher ID is passed in the URL

    // Find the courses taught by the teacher
    const courses = await Course.find({ teachers: teacherId }).populate(
      "students"
    );

    if (!courses || courses.length === 0) {
      return res
        .status(404)
        .json({ message: "No courses found for this teacher" });
    }

    // Prepare a list to hold quiz data for each student
    const studentQuizzes = [];

    // Iterate through each course and collect quiz data from students
    for (const course of courses) {
      for (const student of course.students) {
        // Fetch quiz data for each student
        const studentData = await Student.findById(student._id).populate(
          "quizzes.quizId"
        ); // Make sure to adjust this to the correct reference

        studentQuizzes.push({
          studentId: student._id,
          studentName: student.name, // Assuming the Student model has a 'name' field
          courseId: course._id,
          courseName: course.course_name,
          quizzes: studentData.quizzes.map((quiz) => ({
            quizId: quiz.quizId,
            status: quiz.status,
            score: quiz.score,
            submissionDate: quiz.submissionDate,
          })),
        });
      }
    }

    return res.status(200).json({ studentQuizzes });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ error: "An error occurred while fetching quiz data" });
  }
};

module.exports = {
  createAssignment,
  addAttendance,
  addMultipleAttendances,
  createQuiz,
  getTeacherById,
  getStudentsByTeacherId,
  getCoursesByTeacherId,
  calculateAverageAttendance,
  calculateAverageGrade,
  getAssignmentsByTeacherId,
  getTeacherAnnouncements,
  fetchHomeworkForStudentsInTeacherCourses,
  fetchQuizDataForStudentsInTeacherCourses,
};
