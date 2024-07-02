const Room = require('./../../models/room')
const RoomMember = require('./../../models/room_member')
const WebSocketRouter = require('../router');
const wsRouter = new WebSocketRouter()

/**
 * Used to Send updates of member joins, exits and vote.
 */
wsRouter.ws('/room/', async (ws, user, model_params, parameters) => {
    
    ws.on('message', (message) => {
        ws.send(`Chat: You said: ${message}`);
    });

    ws.on('close', () => {
    });
}, {
    required_parameters: ["code"],
    auth: true,
    model_parameters : [
        {
            "param_name": "code",
            "database_name": "code",
            "model": Room
        }
    ],
    inner_logic_validation: async (user, model_params, url_params) => {
        console.log(model_params, user)
        const room = model_params["room"]
        const member_count = await room.getMemberCount()
        if (member_count >= 8) {
            return "Party is full"
        }
        
        const in_party = await RoomMember.in_party(user)
        if (in_party) {
            return "User already in party"
        }

        return false
    }
})

module.exports = wsRouter