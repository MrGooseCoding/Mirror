const WebSocketRouter = require('./../../router')
const impostor = require('./impostor')
const hows_yours = require('./hows_yours')

const router = new WebSocketRouter()

router.use('', impostor)
router.use('', hows_yours)

module.exports = router