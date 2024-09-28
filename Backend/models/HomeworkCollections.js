const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true,
  },
  submittedDate: {
    type: Date,
    required: true,
  },
});

const homeworkSchema = new mongoose.Schema({
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
    ref: 'Course',
    required: true,
  },
  dueDate: {
    type: Date,
    required: true,
  },
  assignedDate: {
    type: Date,
    required: true,
  },
  assignedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher', 
    required: true,
  }],
  submission: [submissionSchema],
}, { timestamps: true });

const homeworkCollections = mongoose.model('HomeworkCollections', homeworkSchema);

module.exports = homeworkCollections;