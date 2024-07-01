const WebSocketRouter = require('../router');

const wsRouter = new WebSocketRouter()

/**
 * Used to Send updates of member joins, exits and vote.
 */
wsRouter.ws('/room/', (ws, parameters) => {
    ws.on('message', (message) => {
        ws.send(`Chat: You said: ${message}`);
    });

    ws.on('close', () => {
    });
}, {
    required_parameters: ["roomID"],
    auth: true
})

module.exports = wsRouter