const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
require("dotenv").config();
const { uploadOnCloudinary } = require("./config/cloudinary");
const { ConnectMongoDB } = require(".//config/connection");
const app = express();
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const PORT = process.env.PORT || 7000;
const MONGO_URL = process.env.MONGO_URL;
ConnectMongoDB(MONGO_URL)
  .then(() => {
    console.log("DATABASE CONNECTED SUCCESSFULLY");
  })
  .catch((error) => {
    console.log("mongoose error", error);
  });

const student_router = require("./routes/Student");

app.use("/student", student_router);
app.listen(PORT, () => {
  console.log(
    "Server has been started at link: " + `http://localhost:${PORT}/`
  );
});
