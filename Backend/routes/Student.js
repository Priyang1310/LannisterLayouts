const express = require('express');
const router = express.Router();
const { submitAssignment } = require('../controllers/Student');

// Route to upload a file
router.post('/upload', submitAssignment);

module.exports = router;