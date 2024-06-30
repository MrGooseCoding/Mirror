const  router = require('./urls');
const WebSocket = require('ws')

const { port } = require('./../config')

const { URL } = require('url');

function WebSocketServer(server) {
    const wss = new WebSocket.Server({ noServer:true });

    server.on('upgrade', (request, socket, head) => {
        const url = request.url.startsWith('/') ? `ws://localhost:${port}${request.url}` : request.url
        const pathname = new URL(url).pathname

        const handlerFunction = router.getHandler(pathname)
        if (handlerFunction['error']) {
            return socket.destroy()
        }

        wss.handleUpgrade(request, socket, head, (ws) => {
            wss.emit('connection', ws, request);
            handlerFunction(url, ws);
        });
    });

    return wss;
}

module.exports = WebSocketServer;
