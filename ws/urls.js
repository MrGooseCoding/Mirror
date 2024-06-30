const WebSocketRouter = require('./router')
const roomRouter = require('./routes/room')

const router = new WebSocketRouter()

router.use('/ws', roomRouter)

module.exports = router