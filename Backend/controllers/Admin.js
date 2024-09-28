const Student = require("../models/Student");
const axios = require("axios");
const bcrypt = require("bcrypt");
const Teacher = require("../models/Teacher");
const Course = require("../models/Course");

const createCourse = async (req, res) => {
  console.log(req.body);
  try {
    // Check if req.body is an array
    if (Array.isArray(req.body)) {
      const courses = await Course.insertMany(req.body); // Save multiple courses
      res.status(201).json(courses);
    } else {
      const course = new Course(req.body); // Save a single course
      await course.save();
      res.status(201).json(course);
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const createTeachers = async (req, res) => {
  try {
    const teachersData = req.body; // Expecting an array of teacher objects
    // Validate input
    if (!Array.isArray(teachersData) || teachersData.length === 0) {
      return res
        .status(400)
        .json({ message: "Invalid input, expected an array of teachers." });
    }

    const teachersToInsert = [];
    const existingEmails = new Set();
    const courseUpdates = {};

    for (const teacherData of teachersData) {
      const { name, email, password, assigned_courses } = teacherData;

      // Check for required fields
      if (!name || !email || !password) {
        return res
          .status(400)
          .json({
            message: "Name, email, and password are required for each teacher.",
          });
      }

      // Check for duplicate emails
      if (existingEmails.has(email)) {
        return res
          .status(400)
          .json({ message: `Duplicate email found: ${email}` });
      }
      existingEmails.add(email);

      const existingTeacher = await Teacher.findOne({ email });
      if (existingTeacher) {
        return res
          .status(400)
          .json({ message: `Email already exists: ${email}` });
      }

      // Prepare teacher object for insertion
      teachersToInsert.push({
        id: Math.random().toString(36).substr(2, 9),
        name,
        email,
        password, // Store plain text password
        assigned_courses,
      });

      // Collect course updates
      assigned_courses.forEach((courseId) => {
        if (!courseUpdates[courseId]) {
          courseUpdates[courseId] = [];
        }
        courseUpdates[courseId].push(email); // For reference
      });
    }

    // Insert all teachers
    const insertedTeachers = await Teacher.insertMany(teachersToInsert);

    // Update courses with new teacher IDs
    for (const courseId of Object.keys(courseUpdates)) {
      const teacherIds = insertedTeachers.map((teacher) => teacher._id); // Get the new teacher IDs

      // Update the course by adding teacher IDs
      await Course.findByIdAndUpdate(courseId, {
        $addToSet: { teachers: { $each: teacherIds } },
      });
    }

    res.status(201).json(insertedTeachers);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const createStudents = async (req, res) => {
  try {
    const students = req.body; // array of students from the request body
    console.log(req.body);
    
    // Validate that each student has a name and email
    for (const student of students) {
      if (!student.name || !student.email) {
        return res.status(400).json({
          message: "Validation Error",
          error: "Each student must have a name and email."
        });
      }
    }

    // Step 1: Create the students
    const savedStudents = await Student.insertMany(students);

    // Step 2: Iterate through saved students and update their courses
    for (const student of savedStudents) {
      if (student.courses) {
        for (const course of student.courses) {
          await Course.updateOne(
            { _id: course.courseId }, // Match the course by ID
            { $addToSet: { students: student._id } } // Add the student's ID to the students array of the course
          );
        }
      }
    }

    res.status(201).json({
      message: "Students created successfully",
      students: savedStudents,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error creating students",
      error,
    });
  }
};

module.exports = { createCourse, createStudents, createTeachers };

