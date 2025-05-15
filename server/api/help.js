const express = require('express')
const router = express.Router()
const config = require('./../config')


// Using router.post instead of api because no database actions or validations are required
router.post('/game/:game/', async(req, res) => {
    const { game } = req.params

    if (!config.games.includes(game)) {
        return res.status(400).json({ error: "Invalid game"})
    }

    const c = config.games_config[game]
    const help = {
        players: c.players,
        description: c.description
    }
    return res.status(200).json(help)
})

router.post('/getGames/', async(req, res) => {
    return res.status(200).json(config.games)
})
module.exports = router