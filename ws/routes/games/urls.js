const WebSocketRouter = require('./../../router')
const impostor = require('./impostor')

const router = new WebSocketRouter()

router.use('', impostor)

module.exports = router