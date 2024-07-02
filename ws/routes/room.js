const Room = require('./../../models/room')
const WebSocketRouter = require('../router');
const wsRouter = new WebSocketRouter()

/**
 * Used to Send updates of member joins, exits and vote.
 */
wsRouter.ws('/room/', (ws, user, model_params, parameters) => {
    console.log(model_params)
    ws.on('message', (message) => {
        ws.send(`Chat: You said: ${message}`);
    });

    ws.on('close', () => {
    });
}, {
    required_parameters: ["roomCode"],
    auth: true,
    model_parameters : [
        {
            "param_name": "roomCode",
            "database_name": "code",
            "model": Room
        }
    ]
})

module.exports = wsRouter