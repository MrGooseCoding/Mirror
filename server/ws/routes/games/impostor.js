const Room = require('./../../../models/room')
const RoomMember = require('./../../../models/room_member')
const User = require('./../../../models/user')
const WebSocketRouter = require('./../../router');
const { count_votes, shuffle_array } = require('./../../../utils/other');
const { generate_random_integer } = require('./../../../utils/generators')
const { games_config } = require('./../../../config')
const assert = require('assert');

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

    await member.change("has_joined_game", 1)

    // The ws of the first user who joins is going to run the logic. We'll name it "main"

    // This starts a 5 second countdown once the first member joins
    var status = roomStorage.getAttr("status", "start")

    const is_main = status === "start"

    if (is_main) {
        roomStorage.setAttr("status", "joining_countdown")
        setTimeout(async () => {
            const still_exists = await room.refresh()

            if (!still_exists) {
                ws.close()
                return
            }

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

            // Choosing roles

            const random_member_index = generate_random_integer(0, members.length)
            const impostor = members[random_member_index]
            
            var crew = members.filter(( v, i ) => {
                return i !== random_member_index
            })

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
        
            // Choosing a random topic and sending it to the crew
            
            const random_topic_index = generate_random_integer(0, topics.length)
            const topic = topics[random_topic_index]

            roomStorage.setAttr("topic", topic)

            await ws.for_all_clients({
                room: room_id
            }, async (c) => {
                if (c.getAttr("user") !== impostor.getAttr("redirection_key")) {
                    await c.send({
                        type: "topic",
                        data: topic
                    })
                }
            })
            
            // Sorting members randomly (random order)

            const member_order = shuffle_array(members)
            
            roomStorage.setAttr("members", member_order)
            
            const member_order_json = []
            for await (let _ of member_order) {
                const member_json = await _.json()
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

            roomStorage.setAttr("turn", "0") // We express it in form of a string because else its interpreted as an undefined

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
        var game_status = roomStorage.getAttr("game_status", "relative_words")
        if (status != "inside_game") {
            ws.send({
                type: "error",
                data: "Cannot do that while status is not inside_game"
            })
            return
        }

        if (message.type == "relative_word") {
            const data = message.data ? message.data.trim() : ""
            if (game_status != "relative_words") {
                ws.send({
                    type: "error",
                    data: "Cannot do that while game_status is not relative_words"
                })
                return
            }

            const turn = Number(roomStorage.getAttr("turn"))
            const members = roomStorage.getAttr("members")
            let member_index
            members.map(( m, i )=> {
                if (m.getAttr("user") == member.getAttr("user")) {
                    member_index = i
                }
            })

            if (member_index != turn) {
                ws.send({
                    type: "error",
                    data: "It's not your turn"
                })
                return
            }

            if (data == "") {
                ws.send({
                    type: "error",
                    data: "Not a valid relative_word"
                })
                return
            }

            await ws.send_all({
                room: room_id
            }, {
                type: "relative_word",
                data: {
                    user: member.getAttr("user"), // User's id
                    word: data
                }
            })

            const next_turn = members[1+turn]
            
            // Then all players have said a word, so we must move on to the next fase
            if ( (1+turn) == members.length ) {
                await ws.send_all({
                    room: room_id
                },{
                    type: "end_round"
                })
                setTimeout(async () => {
                    roomStorage.setAttr("game_status", "voting")
                    await ws.send_all({
                        room: room_id
                    },{
                        type: "start_voting"
                    })
                }, 5000)
                return
            }

            roomStorage.setAttr("turn", String(1+turn))

            await ws.send_all({
                room: room_id
            }, {
                type: "turn",
                data: next_turn.getAttr("user")
            })
        }

        if (message.type == "vote") {
            const voted_user_id = message.data
            if (roomStorage.getAttr("game_status") !== "voting") {
                ws.send({
                    type: "error",
                    data: "You can only vote during voting game_status"
                })
                return
            }
            
            const members = roomStorage.getAttr("members")
            let member_index = -1
            members.map(( m, i )=> {
                if (m.getAttr("user") == voted_user_id) {
                    member_index = i
                }
            })

            if (member_index == -1) {
                ws.send({
                    type: "error",
                    data:"Not a valid user id"
                })
                return
            }
            
            var votes = roomStorage.getAttr("votes", {})
            votes[member_json.id] = voted_user_id
            roomStorage.setAttr("votes", votes)
            var impostor = roomStorage.getAttr("impostor")
            var impostor_json = await impostor.json()

            const number_of_votes = Object.keys(votes).length
            const member_count = members.length

            if (number_of_votes == member_count) {
                roomStorage.setAttr("status", "finishing")
                const {most_voted} = count_votes(votes)
                const most_voted_user = members.filter(v => v.getAttr("user") == most_voted)[0]
                const most_voted_user_json = await most_voted_user.json()
                await ws.send_all({
                    room: room_id
                }, { 
                    type: "most_voted",
                    data: most_voted
                })
                const crew_wins = impostor.getAttr("user") == most_voted
                setTimeout(async () => {
                    await ws.send_all({
                        room: room_id
                    }, {
                        type: "result",
                        data: {
                            message: `${most_voted_user_json.display_name} was ${crew_wins ? '' : 'not '}the impostor`,
                            winners: crew_wins ? "crew" : "impostor"
                        }
                    })
                    await ws.close()
                }, 5000)
                return
            }


        } // else -> "Error: Not valid type"
    })
    
    // Once a member disconnects or is forced to disconnect, then the whole game is over
    ws.on('close', async () => {
        
        const joined_count = await ws.count_all({
            room: room_id
        })

        await ws.send_all({
            type: "error",
            data: "Member left during game"
        })

        await RoomMember.objects_deleteBy("room", room_id)
        await Room.objects_deleteBy('id', room_id)
        roomStorage.empty()
        
        
        if (joined_count === 0) {
            // Because some room members haven't joined, we must delete them manually
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

        assert(member["error"] == undefined)
        
        const room = await Room.objects_getBy("id", member.getAttr("room"))
        
        assert(room["error"] == undefined)

        if (room.getAttr("game") !== 'impostor') {
            return "You have not joined your room's game"
        }
    },
    // In this case we will use room id as the identifier
    room_identifier: async (user, model_params, url_params) => await model_params.roommember.getAttr("room"),
    user_identifier: async (user, model_params, url_params) => await url_params.key
})

module.exports = wsRouter