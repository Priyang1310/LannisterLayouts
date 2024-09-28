const mongoose = require('mongoose');


const TeacherSchema = new mongoose.Schema({
    id: {
        type: String, 
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true, 
        match: /.+\@.+\..+/ 
    },
    password: {
        type: String,
        required: true
    },
    assigned_courses: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course' 
    }]
});


module.exports = mongoose.model('Teacher', TeacherSchema);