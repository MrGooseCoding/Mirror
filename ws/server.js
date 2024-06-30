const  router = require('./urls');
const WebSocket = require('ws')
const { URL } = require('url');

function WebSocketServer(server) {
    const wss = new WebSocket.Server({ noServer:true });

    server.on('upgrade', (request, socket, head) => {
        const url = request.url.startsWith('/') ? `ws://localhost:3000${request.url}` : request.url
        const pathname = new URL(url).pathname

        const paths = router.getPaths()
        const handlerFunction = paths[pathname]

        wss.handleUpgrade(request, socket, head, (ws) => {
            wss.emit('connection', ws, request);
            handlerFunction(url, ws);
        });
    });

    return wss;
}

module.exports = WebSocketServer;
