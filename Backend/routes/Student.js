const express = require("express");
const {who, getAllBook, addBookToUser, deletebook} = require('../controllers/jaimin')
const router = express.Router();
const {createBook,getBook} = require('../controllers/jaimin');

module.exports = router;