const WebSocket = require('ws')

class WebSocketRouter {
    constructor (server) {
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