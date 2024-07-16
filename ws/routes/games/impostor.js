const Room = require('./../../../models/room')
const RoomMember = require('./../../../models/room_member')
const User = require('./../../../models/user')
const WebSocketRouter = require('./../../router');
const { count_votes, shuffle_array } = require('./../../../utils/other');
const { generate_random_integer } = require('./../../../utils/generators')
const { games_config } = require('./../../../config')

const impostor_config = games_config.impostor

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
            
            const topics = impostor_config.topics
            const members = await room.getMembers()
        
            // Choosing a random topic and sending it to all users
            const random_topic_index = generate_random_integer(0, topics.length)
            const topic = topics[random_topic_index]

            roomStorage.setAttr("topic", topic)
            
            await ws.send_all({
                room: room_id
            }, {
                type: "topic",
                data: topic
            })

            // Choosing roles

            const random_member_index = generate_random_integer(0, members.length)
            const impostor = members[random_member_index]
            
            var crew = member
            delete crew[random_member_index]
            
            roomStorage.setAttr("impostor", impostor)
            roomStorage.setAttr("crew", crew)
            
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
            
            // Sorting members randomly (random order)
            
            const member_order = shuffle_array(members)
            
            roomStorage.setAttr("members", member_order)
            
            const member_order_json = []
            for await (let member of member_order) {
                const member_json = await member.json()
                member_order_json.push(member_json)
            }

            // Sending order
            await ws.send_all({
                room: room_id
            }, {
                type: "member_order",
                data: member_order_json
            })
            
            
            roomStorage.setAttr("status", "inside_game")
            
            await ws.send_all({
                room: room_id,
            },{
                type: "inside_game"
            })

            roomStorage.setAttr("turn", 0)
            const first_turn = member_order[0]
            await ws.send_all({
                room: room_id
            }, {
                type: "turn",
                data: first_turn.getAttr("user")
            })

        }, 5000)
    }

    ws.on("message", async (message) => {
        status = roomStorage.getAttr("status")
        if (status != "inside_game") {
            ws.send({
                type: "error",
                data: "Cannot do that while not status is not inside_game"
            })
            return
        }

        if (message.type == "word") {
            
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