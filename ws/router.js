const WebSocket = require('ws')

class WebSocketRouter {
    constructor () {
        this.paths = {}
    }

    use (path, fun) {
        this.paths[path] = fun
    }

    getPaths() {
        return this.paths
    }
}

module.exports = WebSocketRouter