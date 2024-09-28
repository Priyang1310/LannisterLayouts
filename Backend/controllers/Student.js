const cloudinary = require('cloudinary').v2;
const upload = require('../config/cloudinary');  // Assuming cloudinary config is set up in this file
const Student = require('../models/Student');
const HomeworkCollections = require('../models/HomeworkCollections');
const HomeworkSubmission = require('../models/HomeworkSubmission');

// Handle student assignment submission
const submitAssignment = async (req, res) => {
  try {
    // Using multer to handle file upload
    upload.single('file')(req, res, async (err) => {
      if (err) {
        return res.status(500).json({ message: 'File upload failed', error: err });
      }

      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      const { studentId, homeworkId } = req.body; // Extract studentId and homeworkId from request body

      // Step 1: Check if the student exists
      const student = await Student.findById(studentId);
      if (!student) {
        return res.status(404).json({ message: 'Student not found' });
      }

      // Step 2: Check if the homework exists
      const homework = await HomeworkCollections.findById(homeworkId);
      if (!homework) {
        return res.status(404).json({ message: 'Homework not found' });
      }

      // Step 3: Check if the student is enrolled in the course of the homework
      const isEnrolled = student.courses.some(course => course.courseId.equals(homework.courseId));
      if (!isEnrolled) {
        return res.status(403).json({ message: 'Student not enrolled in this course' });
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
          status: 'submitted',  // Default status is submitted
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
          message: 'Homework submitted successfully',
          submission: savedSubmission,
        });
      } catch (uploadError) {
        console.error('Cloudinary upload error:', uploadError);
        return res.status(500).json({ message: 'Error uploading file to Cloudinary', error: uploadError });
      }
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return res.status(500).json({ message: 'Error submitting homework', error });
  }
};

module.exports = {
  submitAssignment
};
