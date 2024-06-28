const express = require('express');
const router = express.Router();
const usersRouter = require('./users.js'); // Make sure to include the file extension
const roomsRouter = require('./rooms.js')

router.use('/users', usersRouter);
router.use('/rooms', roomsRouter);

module.exports = router;