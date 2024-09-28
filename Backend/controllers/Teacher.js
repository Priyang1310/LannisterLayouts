const HomeworkCollections = require('../models/HomeworkCollections');
const Course = require('../models/Course');
const Teacher = require('../models/Teacher');

const createAssignment = async (req, res) => {
  try {
    const { title, description, courseId, dueDate, assignedBy } = req.body;

    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if teacher exists
    const teacher = await Teacher.findById(assignedBy);
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    // Create a new assignment
    const newHomework = new HomeworkCollections({
      title,
      description,
      courseId,
      dueDate,
      assignedDate: new Date(),
      assignedBy: [assignedBy],  // Add teacher who is assigning the homework
      submission: []  // Initially, no submissions are made
    });

    // Save the new homework
    const savedHomework = await newHomework.save();

    // Add the homework to the course
    course.homework.push(savedHomework._id);
    await course.save();

    return res.status(201).json({
      message: 'Assignment created successfully',
      assignment: savedHomework
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error creating assignment', error });
  }
};

module.exports = {
  createAssignment
};
