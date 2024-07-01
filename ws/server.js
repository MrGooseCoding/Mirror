const  router = require('./urls');
const WebSocket = require('ws')

const { port } = require('./../config')

const { URL } = require('url');

function WebSocketServer(server) {
    const wss = new WebSocket.Server({ noServer:true });

    server.on('upgrade', async (request, socket, head) => {
        const url = request.url.startsWith('/') ? `ws://localhost:${port}${request.url}` : request.url
        const pathname = new URL(url).pathname

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
            wss.handleUpgrade(request, socket, head, async (ws) => {
                wss.emit('connection', ws, request);
                await handlerFunction(url, ws);
            });
        }
    });

    return wss;
}

module.exports = WebSocketServer;
