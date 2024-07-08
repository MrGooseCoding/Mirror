const WebSocketRouter = require('./router')
const roomRouter = require('./routes/room')

const gamesRouter = require('./routes/games/urls')

const router = new WebSocketRouter()

router.use('/ws', roomRouter)
router.use('/ws/game', gamesRouter)

module.exports = router