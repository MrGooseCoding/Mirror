const  router = require('./urls');
const WebSocket = require('ws')
const { URL } = require('url');

function WebSocketServer(server) {
    const wss = new WebSocket.Server({ noServer:true });

    server.on('upgrade', (request, socket, head) => {
        const pathname = request.url.startsWith('/') ? request.url : new URL (request.url).pathname

        const paths = router.getPaths()
        const handlerFunction = paths[pathname]

        wss.handleUpgrade(request, socket, head, (ws) => {
            wss.emit('connection', ws, request);
            handlerFunction(ws);
        });
    });

    return wss;
}

module.exports = WebSocketServer;
