const cloudinary = require("cloudinary").v2;
const upload = require("../config/cloudinary"); // Assuming cloudinary config is set up in this file
const Student = require("../models/Student");
const HomeworkCollections = require("../models/HomeworkCollections");
const HomeworkSubmission = require("../models/HomeworkSubmission");

// Handle student assignment submission
const submitAssignment = async (req, res) => {
  try {
    // Using multer to handle file upload
    upload.single("file")(req, res, async (err) => {
      if (err) {
        return res
          .status(500)
          .json({ message: "File upload failed", error: err });
      }

      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const { studentId, homeworkId } = req.body; // Extract studentId and homeworkId from request body

      // Step 1: Check if the student exists
      const student = await Student.findById(studentId);
      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }

      // Step 2: Check if the homework exists
      const homework = await HomeworkCollections.findById(homeworkId);
      if (!homework) {
        return res.status(404).json({ message: "Homework not found" });
      }

      // Step 3: Check if the student is enrolled in the course of the homework
      const isEnrolled = student.courses.some((course) =>
        course.courseId.equals(homework.courseId)
      );
      if (!isEnrolled) {
        return res
          .status(403)
          .json({ message: "Student not enrolled in this course" });
      }

      try {
        // Step 4: Upload file to Cloudinary and get the URL
        const result = await cloudinary.uploader.upload(req.file.path);
        const submissionUrl = result.secure_url; // Get the Cloudinary file URL

        // Step 5: Create a new homework submission
        const newSubmission = new HomeworkSubmission({
          homeworkId,
          studentId,
          submissionUrl,
          status: "submitted", // Default status is submitted
          submittedOn: new Date(),
        });

        // Save the submission in HomeworkSubmission collection
        const savedSubmission = await newSubmission.save();

        // Step 6: Add the homework submission reference to the student's homeworkSubmissions array
        student.homeworkSubmissions.push({ homeworkId: savedSubmission._id });
        await student.save();

        // Step 7: Update the HomeworkCollections to include the student submission
        homework.submission.push({
          studentId: studentId,
          submittedDate: new Date(),
        });
        await homework.save();

        // Step 8: Return success response
        return res.status(201).json({
          message: "Homework submitted successfully",
          submission: savedSubmission,
        });
      } catch (uploadError) {
        console.error("Cloudinary upload error:", uploadError);
        return res
          .status(500)
          .json({
            message: "Error uploading file to Cloudinary",
            error: uploadError,
          });
      }
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return res
      .status(500)
      .json({ message: "Error submitting homework", error });
  }
};

const getStudentById = async (req, res) => {
  const { id } = req.body;

  try {
    const student = await Student.findById(id)
      .populate({
        path: "courses._id",
        match: { status: "Published" },
        populate: [
          { path: "teachers" },
          { path: "announcements" },
          { path: "homework._id" },
          { path: "quizzes" },
        ],
      })
      .populate("homeworkSubmissions._id")
      .populate("quizzes._id");

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    return res.status(200).json(student);
  } catch (error) {
    console.error("Error fetching student:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// Controller to fetch enrolled courses by student ID
const getEnrolledCoursesByStudentId = async (req, res) => {
  const { id } = req.body;

  try {
    const student = await Student.findById(id).populate({
      path: "courses.courseId",
      populate: [
        { path: "teachers" },
        { path: "students" },
        { path: "announcements" },
      ],
    });

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const populatedCourses = student.courses.map((course) => ({
      ...course.courseId._doc,
      _id: course._id,
    }));

    return res.status(200).json({
      message: "Enrolled courses retrieved successfully",
      courses: populatedCourses,
    });
  } catch (error) {
    console.error("Error fetching enrolled courses:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// Controller to fetch homework submissions
const getHomeworkSubmissions = async (req, res) => {
  try {
    const studentId = req.body.id;

    if (!studentId) {
      return res.status(400).json({ error: "Student ID is required" });
    }

    const student = await Student.findById(studentId).populate({
      path: "homeworkSubmissions.homeworkId",
      model: "HomeworkSubmission",
    });

    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    const homeworkSubmissions = student.homeworkSubmissions;

    return res.status(200).json({ homeworkSubmissions });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ error: "An error occurred while fetching homework submissions" });
  }
};

// Controller to fetch student quizzes
const getStudentQuizzes = async (req, res) => {
  try {
    const { studentId } = req.body;

    const student = await Student.findById(studentId);

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const quizzes = student.quizzes;

    return res.status(200).json({ quizzes });
  } catch (error) {
    console.error("Error fetching quizzes:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Controller to get student attendance with percentage
const getStudentAttendanceWithPercentage = async (req, res) => {
  const studentId = req.body.id;

  try {
    const student = await Student.findById(studentId).populate(
      "attendance.courseId"
    );
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const attendancePerSubject = student.attendance.reduce((acc, record) => {
      const courseName = record.courseId.course_name;
      if (!acc[courseName]) {
        acc[courseName] = {
          totalClasses: 0,
          presentClasses: 0,
          attendanceRecords: [],
        };
      }
      acc[courseName].totalClasses++;
      if (record.status === "present") {
        acc[courseName].presentClasses++;
      }
      acc[courseName].attendanceRecords.push({
        date: record.date,
        status: record.status,
      });
      return acc;
    }, {});

    const attendanceWithPercentage = Object.entries(attendancePerSubject).map(
      ([courseName, data]) => {
        const percentagePresence = (
          (data.presentClasses / data.totalClasses) *
          100
        ).toFixed(2);
        return {
          courseName,
          percentagePresence,
          attendanceRecords: data.attendanceRecords,
        };
      }
    );

    return res.status(200).json({
      studentId: student._id,
      attendance: attendanceWithPercentage,
    });
  } catch (error) {
    console.error("Error fetching attendance:", error);
    return res
      .status(500)
      .json({ message: "An error occurred while fetching attendance." });
  }
};

// Controller function to fetch assignment marks subject-wise
const getStudentAssignmentMarks = async (req, res) => {
  try {
    const studentId = req.body.id;

    if (!studentId) {
      return res.status(400).json({ error: "Student ID is required" });
    }

    const student = await Student.findById(studentId).populate({
      path: "homeworkSubmissions.homeworkId",
      model: "HomeworkSubmission",
      populate: {
        path: "homeworkId",
        model: "HomeworkCollections",
        select: "courseName",
      },
    });

    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    const assignments = student.homeworkSubmissions.map((submission) => ({
      courseName: submission.homeworkId.homeworkId.courseName,
      assignmentId: submission.homeworkId._id,
      marks: submission.homeworkId.marks || 0,
    }));

    return res.status(200).json({ assignments });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ error: "An error occurred while fetching assignment marks" });
  }
};

// Controller to fetch student announcements
const getStudentAnnouncements = async (req, res) => {
  try {
    const { studentId } = req.body;

    const student = await Student.findById(studentId);

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const courseIds = student.courses.map((course) => course.courseId);

    const courses = await Course.find({ _id: { $in: courseIds } });

    const allAnnouncements = courses.flatMap((course) => course.announcements);

    return res.status(200).json({ announcements: allAnnouncements });
  } catch (error) {
    console.error("Error fetching announcements:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const fetchAverageAttendanceOfStudent = async (req, res) => {
  try {
    const studentId = req.body.id; // Get student ID from request parameters

    // Step 1: Fetch the student by ID and populate the courses
    const student = await Student.findById(studentId).populate(
      "courses.courseId"
    );

    // Check if the student is found
    if (!student) {
      return res.status(404).json({ message: "Student not found." });
    }

    // Step 2: Initialize an object to hold attendance counts per course
    const attendanceData = {};
    // console.log("Error......",student)
    // Step 3: Iterate through the attendance records
    // console.log("Erorr.......",student.attendance)
    for (const attendance of student.attendance) {
      const courseId = attendance.courseId.toString(); // Convert to string for comparison
      if (!attendanceData[courseId]) {
        attendanceData[courseId] = {
          courseName:
            student.courses.find((c) => c.courseId.toString() === courseId)
              ?.courseId.course_name || "Unknown",
          presentDays: 0,
          totalDays: 0,
        };
      }
      // Count attendance
      attendanceData[courseId].totalDays += 1;
      if (attendance.status === "Present") {
        attendanceData[courseId].presentDays += 1;
      }
    }

    // Step 4: Calculate average attendance for each course
    const averageAttendance = Object.entries(attendanceData).map(
      ([courseId, data]) => ({
        courseId,
        courseName: data.courseName,
        average: (data.presentDays / data.totalDays) * 100, // Convert to percentage
      })
    );

    // Step 5: Send the average attendance data as a response
    return res.status(200).json({ averageAttendance });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({
        error: "An error occurred while calculating average attendance.",
      });
  }
};

// Consolidated exports
module.exports = {
  getStudentById,
  getEnrolledCoursesByStudentId,
  getHomeworkSubmissions,
  getStudentQuizzes,
  getStudentAttendanceWithPercentage,
  getStudentAssignmentMarks,
  getStudentAnnouncements,
  fetchAverageAttendanceOfStudent,
  submitAssignment,
};
