const Room = require('./../../models/room')
const RoomMember = require('./../../models/room_member')
const User = require('./../../models/user')
const WebSocketRouter = require('../router');
const wsRouter = new WebSocketRouter()

/**
 * Used to Send updates of member joins, exits and vote.
 */
wsRouter.ws('/room/', async (ws, user, model_params, parameters, roomStorage) => {
    const room = model_params.room
    const is_admin =  room.is_admin(user)

    ws.send({ type: "room", data: room.json() })
    
    const members_json = []
    for await (let i of await room.getMembers()) {
        const data = await i.json()
        members_json.push(data)
    }
    
    ws.send({ type: "members", data: members_json })

    const member = await room.addMember(user)

    ws.send_all({
        room_code: room.json().code
    }, { 
        type: "member_joined",
        data: await member.json()
    })
    
    ws.on('message', async (message) => {
        ws.send(`Chat: You said: ${message.data}`);
        
        if (message.type == "start_voting") {
            if (!is_admin) {
                ws.send({ error: "You do not have permission to do this" })
                ws.close()
                return
            }
            
            roomStorage.setAttr("status", "voting")

            ws.send_all({
                room_code: room.json().code
            }, { 
                type: message.type,
            })
        }

        if (message.type == "vote") {
            if (roomStorage.getAttr("status") !== "voting") {
                ws.send({ error: "You can only vote during voting status" })
                ws.close()
                return
            }
            
            console.log(roomStorage)
        }
    });

    ws.on('close', async () => {
        RoomMember.objects_deleteBy('user', user.json().id)
        ws.send_all({
            room_code: room.json().code
        }, { 
            type: "member_left",
            data: await member.json()
        })
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
    },
    storage_identifier: "code"
})

module.exports = wsRouter