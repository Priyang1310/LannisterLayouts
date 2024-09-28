const express = require("express");
const router = express.Router();
const { createAssignment } = require("../controllers/Teacher");

router.post("/createAssignment", createAssignment);
module.exports = router;
