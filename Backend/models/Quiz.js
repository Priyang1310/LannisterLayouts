const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  questionText: {
    type: String,
    required: true,
  },
  options: {
    type: [Number],
    required: true,
    validate: {
      validator: function (val) {
        return val.length === 4 && val.every(num => num >= 0 && num <= 3);
      },
      message: 'Options must contain exactly 4 numbers ranging from 0 to 3',
    },
  },
  correctAnswers: {
    type: [Number],
    required: true,
  },
  type: {
    type: String,
    enum: ['multiple choice', 'single choice'],
    required: true,
  },
  points: {
    type: Number,
    required: true,
  },
});

function arrayLimit(val) {
  return val.length === 4;
}

const quizSchema = new mongoose.Schema({
  id: {
    type: mongoose.Schema.Types.ObjectId,
    default: () => new mongoose.Types.ObjectId(),
    unique: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course', // Assumes there's a "Course" model
    required: true,
  },
  questions: {
    type: [questionSchema],
    required: true,
  },
  duration: {
    type: Number, // Duration in minutes
    required: true,
  },
  assignedDate: {
    type: Date,
    required: true,
  },
  dueDate: {
    type: Date,
    required: true,
  },
}, { timestamps: true });

const Quiz = mongoose.model('Quiz', quizSchema);

module.exports = Quiz;