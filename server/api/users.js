const express = require('express')
const router = express.Router()
const User = require('./../models/user')
const userValidator = require('./../validators/userValidator')
const api = require('./api')
const Validation = require('./../models/validation')
const config = require('./../config')

api('/search/', async (req, res, validator, user) => {
    if (!validator.not_null("username")) {
        return res.status(400).json({ error: validator.errors })
    }
    
    const users = await User.objects_searchBy("username", validator.data.username, 10)
    return res.status(200).json(users.map(u => u.json()))

}, router, userValidator)

api('/getByToken/', (req, res, validator, user) => {
    res.status(user.json() ? 200 : 400).json(user.json() ? user.json() : { error: validator.errors })
}, router, userValidator, true)

api('/getById/', async (req, res, validator, user) => {
    if (!validator.not_null("id")) {
        return res.status(400).json({ error: validator.errors })
    }
    
    const data = await User.objects_getBy("id", validator.data.id)
    return res.status(!data["error"] ? 200 : 400).json(data.json())
}, router, userValidator)

api('/create/', async (req, res, validator, user) => {
    await validator.validate_all()

    const data = await validator.create()

    if (!data[0]) {
        res.status(400).json(data[1])
        return
    }
    
    config.validate_email & data[0] && await validator.send_validation_email()

    return res.status(201).json(data[1].json(true, false))
}, router, userValidator)

config.validate_email && api('/validateEmail/:code/', async (req, res, validator, user) => {
    const { code } = req.params
    
    const valid = await Validation.validate(code, user)

    if (valid["error"]) {
        return res.status(400).json(valid)
    }

    await Validation.register_validated(user)

    return res.status(valid ? 200 : 400).json({valid})

}, router, userValidator, true)

api('/update/:attrName/', async (req, res, validator, user) => {
    const options = [
        //"email",
        "username",
        "display_name",
        "description",
        "password"
    ]

    const attrName = req.params.attrName

    if (!options.includes(attrName)) {
        return res.status(400).json({error: "Invalid attribute name"})
    }

    await validator.validate_all()
    if (validator.errors[attrName]) {
        const error = {}
        error[attrName] = validator.errors[attrName]
        return res.json(error)
    }

    await user.change(attrName, validator.data[attrName])
    return res.status(201).json(user.json())

}, router, userValidator, true)

api('/login/', async (req, res, validator, user) => {
    if (!validator.not_null("username")) {
        return res.status(400).json({ error: validator.errors })
    }

    if (user.json().validated == 0) {
        res.status(400).json({ error: {"username": "Not a validated user"} })
        return
    }

    const is_unique = await validator.unique("username")

    if (is_unique) {
        return res.status(400).json({error: {"username": "username does belong to any user"}})
    }

    delete validator.errors["username"]

    const result = await User.authenticate(validator.data.username, req.body.password)
    return res.status(!result["error"] ? 200: 400).json(!result["error"] ? result.json(true, false) : {error: {password: "Invalid password"}})
    
}, router, userValidator)

module.exports = router