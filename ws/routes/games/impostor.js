const Room = require('./../../../models/room')
const RoomMember = require('./../../../models/room_member')
const User = require('./../../../models/user')
const WebSocketRouter = require('./../../router');
const { count_votes } = require('./../../../utils/other');
const wsRouter = new WebSocketRouter()

/**
 * Used to Send updates of member joins, exits and vote.
 */
wsRouter.ws('/impostor/', async (ws, u, model_params, parameters, roomStorage) => {
    const member = model_params.roommember
    const member_json = await member.json()

    const room_id = member.getAttr("room")
    const room = await Room.objects_getBy("id", room_id)

    // The ws of the first user who joins is going to run the logic

    // This starts a 5 second countdown once the first member joins
    const status = roomStorage.getAttr("status", "start")
    if (status === "start") {
        roomStorage.setAttr("status", "joining_countdown")
        setTimeout(async () => {
            await room.refresh()
            const member_count = await room.getMemberCount()
            const joined_count = await ws.count_all({
                room: room_id
            })
            
            if (member_count != joined_count) {
                await ws.send_all({
                    room: room_id
                }, { type: "error", error: "Missing users"})
                await ws.close_all({
                    room: room_id
                })

                // Because some room members haven't joined, we must delete them manually
                await RoomMember.objects_deleteBy("room", room_id)
                return
            }
            roomStorage.setAttr("status", "inside_game")
        }, 5000)
    }

    // Once a member disconnects or is forced to disconnect, then the whole game is over
    // However, the ws.close_all will not be executed here
    ws.on('close', async () => {
        await room.refresh()
        await RoomMember.objects_deleteBy('user', member_json.id)

        const joined_count = await ws.count_all({
            room: room_id
        })
        if (joined_count === 0) {
            roomStorage.empty()
            await Room.objects_deleteBy('id', room_id)
            return
        } 
    });

}, {
    required_parameters: ["key"],
    auth: false,
    model_parameters : [
        {
            "param_name": "key",
            "database_name": "redirection_key",
            "model": RoomMember
        }
    ],
    inner_logic_validation: async (user, model_params, url_params) => {
        // Check that the user has joined the correct game
        const member = model_params.roommember
        const room = await Room.objects_getBy("id", member.getAttr("room"))

        if (room.getAttr("game") !== 'impostor') {
            return "You have not joined your room's game"
        }
    },
    // In this case we will use room id as the identifier
    room_identifier: async (user, model_params, url_params) => await model_params.roommember.getAttr("room")
})

module.exports = wsRouter