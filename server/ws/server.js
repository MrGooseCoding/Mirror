const router = require('./urls');
const WebSocket = require('ws')

const { format_pathname } = require('./../utils/url_tools')

const { port } = require('./../config')

const { URL } = require('url');

function WebSocketServer(server) {
    const wss_per_pathname = {}
    
    const pathnames = Object.keys(router.getHandlers())

    pathnames.forEach(path => {
        const wss = new WebSocket.Server({ noServer:true });
        wss_per_pathname[path] = wss
    });

    server.on('upgrade', async (request, socket, head) => {
        const url = request.url.startsWith('/') ? `ws://localhost:${port}${request.url}` : request.url
        const pathname = format_pathname(new URL(url).pathname)

        const handlerFunction = router.getHandler(pathname)
    
        // Destroys the socket if the url is incorrect    
        if (handlerFunction['error']) {
            socket.write('HTTP/1.1 404 Not found\r\n\r\n');
            socket.destroy()
            return
        }

        const handlerValidator = router.getValidator(pathname)

        // Validates everything else is correct

        const valid = await handlerValidator(url, socket)

        // If so, continue
        if (valid) {
            const wss = wss_per_pathname[pathname]
            wss.handleUpgrade(request, socket, head, async (ws) => {
                wss.emit('connection', ws, request);
                await handlerFunction(url, ws, wss);
            });
        }
    });
}

module.exports = WebSocketServer;
