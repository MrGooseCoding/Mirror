const WebSocketRouter = require('./router')
const roomWS = require('./routes/room')

const router = new WebSocketRouter()

router.use('/ws/room/', roomWS)

module.exports = router