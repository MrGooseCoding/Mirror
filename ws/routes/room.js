const WebSocketRouter = require('../router');

const wsRouter = new WebSocketRouter()

wsRouter.ws('/room/', (ws) => {
    console.log('New chat WebSocket connection');

    ws.on('message', (message) => {
        ws.send(`Chat: You said: ${message}`);
    });

    ws.on('close', () => {
        console.log('Chat WebSocket connection closed');
    });
})

module.exports = wsRouter