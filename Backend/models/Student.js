const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const StudentSchema = new Schema({
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
  picture : {
   type: String,
  },
  books: [
    {
      bookId: {
        type: Schema.Types.ObjectId,
        ref: 'Book',
        required: true,
      },
      issueDate: {
        type: Date,
        required: true,
        default: Date.now,
      },
    }, 
  ],
});

const Student = mongoose.model("Student", StudentSchema);

module.exports = Student;