const WebSocket = require('ws')

class WebSocketRouter {
    constructor () {
        this.paths = {}
    }

    use (path, router) {
        const relative_paths = router.getPaths()
        const relative_paths_list = Object.keys(relative_paths)
        relative_paths_list.forEach(relative_path => {
            const fun = relative_paths[relative_path]
            this.paths[path + relative_path] = fun
        })
    }

    getPaths() {
        return this.paths
    }

    getHandler(pathname) {
        const formatted_pathname = pathname.endsWith('/') ? pathname : `${pathname}/`
        const handler = this.paths[formatted_pathname]
        if (!handler) {
            return { error: "No handler found" }
        }
        return handler
    }

    ws (path, handler) {
        const wrappedHandler = (url, ws) => {
            console.log(url)
            handler(ws)
        }
    
        this.paths[path] = wrappedHandler
    }
}

module.exports = WebSocketRouter