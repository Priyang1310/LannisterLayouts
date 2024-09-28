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
    courses: [
      {
        courseId: {
          type: Schema.Types.ObjectId,
          ref: "Course", 
          required: true,
        },
      },
    ],
    homeworkSubmissions: [
      {
        homeworkId: {
          type: Schema.Types.ObjectId,
          ref: "HomeworkSubmission", 
          required: true,
        }
      },
    ],
    quizzes: [
      {
        quizId: {
          type: Schema.Types.ObjectId,
          ref: "Quiz", 
          required: true,
        },
        status:{
          type:Boolean,
          default:false,
        },
        score: {
          type: Number,
          min: 0,
          max: 100,
        },
        submissionDate: {
          type: Date,
          required: true,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true }
); 

const Student = mongoose.model("Student", StudentSchema);

module.exports = Student;
