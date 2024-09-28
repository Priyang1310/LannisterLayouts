const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Define the Course schema
const CourseSchema = new Schema({
  course_name: {
    type: String,
    required: true,
  },
  teachers: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Teacher', // Assuming you have a Teacher model
    },
  ],
  students: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Student', // Assuming you have a Student model
    },
  ],
  announcements: [
    {
      date: {
        type: Date,
        required: true,
        default: Date.now,
      },
      content: {
        type: String,
        required: true,
      },
    },
  ],
  homework: [
    {
      homework_id: {
        type: Schema.Types.ObjectId,
        ref: 'HomeworkCollections', // Assuming you have a Homework model
      },
      title: {
        type: String,
        required: true,
      },
      description: {
        type: String,
      },
      due_date: {
        type: Date,
      },
      assigned_date: {
        type: Date,
        required: true,
        default: Date.now,
      },
    },
  ],
  quizzes: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Quiz', // Assuming you have a Quiz model
    },
  ],
}, { timestamps: true }); // Automatically adds createdAt and updatedAt timestamps

// Export the Course model
const Course = mongoose.model("Course", CourseSchema);

module.exports = Course;