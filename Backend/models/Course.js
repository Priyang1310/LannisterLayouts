const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Define the Course schema
const CourseSchema = new Schema({
  coursename: {
    type: String,
    required: true,
  },
  teachers: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Teacher', 
      default: []
    },
  ],
  students: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Student', 
    },
  ],
  announcements: [
    {
      date: {
        type: Date,
        // required: true,
        default: Date.now,
      },
      content: {
        type: String,
        // required: true,
      },
    },
  ],
  homework: [
    {
      homework_id: {
        type: Schema.Types.ObjectId,
        ref: 'HomeworkCollections', 
      },
      
    },
  ],
  quizzes: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Quiz', 
    },
  ],
}, { timestamps: true }); 
CourseSchema.index({ coursename: 1 }, { unique: false }); // Remove unique constraint
// Export the Course model
const Course = mongoose.model("Course", CourseSchema);

module.exports = Course;
