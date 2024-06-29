const express = require('express')
const router = express.Router()
const Room = require('../models/room')
const RoomMember = require('../models/room_member')
const User = require('../models/user')
const userValidator = require('../validators/userValidator')
const api = require('./api')
const Validation = require('../models/validation')
const config = require('../config')

api('/create/', async (req, res, validator, user) => {
    const in_party = await RoomMember.in_party(user)
    
    if (in_party) {
        return res.status(400).json({ error: "User already in party"})
    }

    const room = await Room.create(user)

    return res.status(201).json(room.json())
}, router, userValidator, true)

module.exports = router