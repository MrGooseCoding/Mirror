const Room = require('./../../../models/room')
const RoomMember = require('./../../../models/room_member')
const User = require('./../../../models/user')
const WebSocketRouter = require('./../../router');
const { count_votes } = require('./../../../utils/other');
const { generate_random_integer } = require('./../../../utils/generators')
const wsRouter = new WebSocketRouter()

/**
 * Used to Send updates of member joins, exits and vote.
 */
wsRouter.ws('/impostor/', async (ws, u, model_params, parameters, roomStorage) => {
    const member = model_params.roommember
    const member_json = await member.json()

    const room_id = member.getAttr("room")
    const room = await Room.objects_getBy("id", room_id)

    // The ws of the first user who joins is going to run the logic. We'll name it "main"

    // This starts a 5 second countdown once the first member joins
    var status = roomStorage.getAttr("status", "start")

    const is_main = status === "start"

    if (is_main) {
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
                }, { type: "error", data: "Missing users" })
                await ws.close()
                return
            }

            
            const members = await room.getMembers()
            const random_index = generate_random_integer(0, members.length)
            const impostor = members[random_index]

            var crew = member
            delete crew[random_index]

            roomStorage.setAttr("impostor", impostor)
            roomStorage.setAttr("crew", crew)
            
            // Sending everyone their roles
            await ws.for_all_clients({
                room: room_id
            }, async (c) => {

                if (c.getAttr("user") == impostor.getAttr("redirection_key")) {
                    await c.send({
                        type: "role",
                        data: "impostor"
                    })
                } else {
                    await c.send({
                        type: "role",
                        data: "crew"
                    })
                }
            })
            
            roomStorage.setAttr("status", "inside_game")
        }, 5000)
    }

    ws.on("message", async () => {
        status = roomStorage.getAttr("status")
        if (status != "inside_game") {
            ws.send({
                type: "error",
                data: "Cannot do that while not inside game"
            })
            return
        }

    })
    
    // Once a member disconnects or is forced to disconnect, then the whole game is over
    ws.on('close', async () => {
        await room.refresh()
        await RoomMember.objects_deleteBy('user', member_json.id)
        
        const joined_count = await ws.count_all({
            room: room_id
        })

        await ws.send_all({
            type: "error",
            data: "Member left during game"
        })
        
        if (joined_count === 0) {
            roomStorage.empty()
            
            // Because some room members haven't joined, we must delete them manually
            await RoomMember.objects_deleteBy("room", room_id)
            await Room.objects_deleteBy('id', room_id)
            return
        }

        await ws.close_all({
            room: room_id
        })
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
    room_identifier: async (user, model_params, url_params) => await model_params.roommember.getAttr("room"),
    user_identifier: async (user, model_params, url_params) => await url_params.key
})

module.exports = wsRouter