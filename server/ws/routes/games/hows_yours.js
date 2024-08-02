const Room = require('./../../../models/room')
const RoomMember = require('./../../../models/room_member')
const User = require('./../../../models/user')
const WebSocketRouter = require('./../../router');
const { count_votes, shuffle_array } = require('./../../../utils/other');
const { generate_random_integer } = require('./../../../utils/generators')
const { games_config } = require('./../../../config')
const assert = require('assert');
const getConfig = require('./router_config');

const hows_yours_config = games_config.hows_yours

const wsRouter = new WebSocketRouter()

/**
 * Used to Send updates of member joins, exits and vote.
 */
wsRouter.ws('/hows_yours/', async (ws, u, model_params, parameters, roomStorage) => {
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
            
            const topics = hows_yours_config.topics
            const members = await room.getMembers()

            // Choosing roles

            const random_member_index = generate_random_integer(0, members.length)
            const guesser = members[random_member_index]
            
            var crew = members.filter(( v, i ) => {
                return i !== random_member_index
            })

            roomStorage.setAttr("guesser", guesser)
            roomStorage.setAttr("crew", crew)
            
            await ws.send_all({
                room: room_id
            },{
                type: "guesser",
                data: guesser.getAttr("user")
            })
            
            // Choosing a random topic and sending it to the crew
            
            const random_topic_index = generate_random_integer(0, topics.length)
            const topic = topics[random_topic_index]
            
            roomStorage.setAttr("topic", topic)
            
            await ws.for_all_clients({
                room: room_id
            }, async (c) => {
                if (c.getAttr("user") !== guesser.getAttr("redirection_key")) {
                    await c.send({
                        type: "topic",
                        data: topic
                    })
                }
            })
            
            // Sorting members randomly (random order)

            const member_order = shuffle_array(crew)
            
            roomStorage.setAttr("crew", member_order)
            roomStorage.setAttr("members", members)
            
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
        var game_status = roomStorage.getAttr("game_status", "properties")
        if (status != "inside_game") {
            ws.send({
                type: "error",
                data: "Cannot do that while status is not inside_game"
            })
            return
        }

        if (message.type == "property") {
            const data = message.data ? message.data.trim() : ""
            if (game_status != "properties") {
                ws.send({
                    type: "error",
                    data: "Cannot do that while game_status is not properties"
                })
                return
            }

            const turn = Number(roomStorage.getAttr("turn"))
            const crew = roomStorage.getAttr("crew")
            let member_index
            crew.map(( m, i )=> {
                if (m.getAttr("user") == member.getAttr("user")) {
                    member_index = i
                }
            })

            // Means the user is the guesser
            if (member_index == undefined) {
                ws.send({
                    type: "error",
                    data: "You have to be of crew to send a property"
                })
                return
            }

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
                    data: "Not a valid property"
                })
                return
            }

            await ws.send_all({
                room: room_id
            }, {
                type: "property",
                data: {
                    user: member.getAttr("user"), // User's id
                    property: data
                }
            })

            const next_turn = crew[1+turn]

            roomStorage.setAttr("turn", String(1+turn))
            
            // Then all players have said a word, so we must move on to the next fase
            if ( (1+turn) == crew.length ) {
                await ws.send_all({
                    room: room_id
                },{
                    type: "end_round"
                })
                setTimeout(async () => {
                    roomStorage.setAttr("game_status", "guessing")
                    await ws.send_all({
                        room: room_id
                    },{
                        type: "guessing"
                    })
                }, 5000)
                return
            }

            await ws.send_all({
                room: room_id
            }, {
                type: "turn",
                data: next_turn.getAttr("user")
            })
        }

        if (message.type == "guess") {
            const guess = message.data ? message.data.trim() : "" // TODO: Check message.data is a string
            const guesser = roomStorage.getAttr("guesser")

            if (member.getAttr("user") != guesser.getAttr("user")) {
                ws.send({
                    type: "error",
                    data: "You have to be the guesser to send a property"
                })
            }

            if (game_status !== "guessing") {
                ws.send({
                    type: "error",
                    data: "You can only vote during guessing game_status"
                })
                return
            }

            if (guess == "") {
                ws.send({
                    type: "error",
                    data: "Not a valid guess"
                })
                return
            }

            ws.send_all({
                room: room_id
            }, {
                type: "guess",
                data: guess
            })

            const topic = roomStorage.getAttr("topic")
            const crew_wins = guess != topic

            roomStorage.setAttr("status", "finishing")

            setTimeout(async () => {
                await ws.send_all({
                    room: room_id
                }, {
                    type: "result",
                    data: {
                        message: `${guess} was ${crew_wins ? 'not ' : ''}the topic`,
                        winners: crew_wins ? "crew" : "guess"
                    }
                })
                await ws.close()
            }, 5000)
            return


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

}, getConfig("hows_yours"))

module.exports = wsRouter