const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const StudentSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
    },
    courses: {
      type: [
        {
          courseId: {
            type: Schema.Types.ObjectId,
            ref: "Course",
            required: true,
          },
        },
      ],
      default: [], // Default to an empty array
    },
    homeworkSubmissions: {
      type: [
        {
          homeworkId: {
            type: Schema.Types.ObjectId,
            ref: "HomeworkSubmission",
            required: true,
          },
        },
      ],
      default: [], // Default to an empty array
    },
    quizzes: {
      type: [
        {
          quizId: {
            type: Schema.Types.ObjectId,
            ref: "Quiz",
            required: true,
          },
          status: {
            type: Boolean,
            default: false,
          },
          score: {
            type: Number,
            min: 0,
            max: 100,
          },
          submissionDate: {
            type: Date,
            // required: true,
            default: Date.now,
          },
        },
      ],
      default: [], // Default to an empty array
    },
    attendance: {
      type: [
        {
          courseId: {
            type: Schema.Types.ObjectId,
            ref: "Course", // Reference to the Course model
            required: true,
          },
          date: {
            type: Date,
            required: true,
          },
          status: {
            type: String,
            enum: ["Present", "Absent"], // Status can be 'present' or 'absent'
            required: true,
          },
        },
      ],
      default: [], // Default to an empty array
    },
  },
  { timestamps: true }
);

const Student = mongoose.model("Student", StudentSchema);

module.exports = Student;
