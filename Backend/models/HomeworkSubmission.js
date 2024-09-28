const mongoose = require("mongoose");

const homeworkSubmissionSchema = new mongoose.Schema(
  {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      default: () => new mongoose.Types.ObjectId(),
      unique: true,
    },
    homeworkId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "HomeworkCollections",
      required: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    submissionUrl: {
      type: String,
      required: true,
      trim: true,
    },
    submittedOn: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ["submitted", "pending", "graded"],
      required: true,
    },
    marks: {
      type: Number,
      min: 0,
    },
  },
  { timestamps: true }
);

const HomeworkSubmission = mongoose.model(
  "HomeworkSubmission",
  homeworkSubmissionSchema
);

module.exports = HomeworkSubmission;
