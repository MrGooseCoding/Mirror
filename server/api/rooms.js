const express = require('express')
const router = express.Router()
const Room = require('../models/room')
const RoomMember = require('../models/room_member')
const User = require('../models/user')
const basicValidator = require('../validators/basicValidator')
const api = require('./api')
const Validation = require('../models/validation')
const config = require('../config')

api('/create/', async (req, res, validator, user) => {
    const in_party = await RoomMember.in_party(user)
    if (in_party) {
        return res.status(400).json({ error: "User already in party"})
    }

    const room_already_created = await Room.objects_getBy("admin", user.json().id)
    if (!room_already_created['error']) {
        return res.status(201).json(room_already_created.json())
    }

    const room = await Room.create(user)

    return res.status(201).json(room.json())
}, router, basicValidator, true)

api('/canJoin/:code/', async (req, res, validator, user) => {
    const code = req.params.code

    if (isNaN(code)) {
        return res.status(400).json({ error: "Invalid code" })
    }

    const room = await Room.objects_getBy('code', code)
    
    if (room['error']) {
        return res.status(400).json({ error: "Room does not exist" })
    }
    
    const member_count = await room.getMemberCount()
    if (member_count >= 8) {
        return res.status(400).json({ error: "Party is full" })
    }
    
    const in_party = await RoomMember.in_party(user)
    if (in_party) {
        return res.status(400).json({ error: "User already in party"})
    }
    
    return res.status(201).json({can_join: true})
}, router, basicValidator, true)

module.exports = router