const Room = require('./../../models/room')
const RoomMember = require('./../../models/room_member')
const { games, games_config } = require('./../../config')
const User = require('./../../models/user')
const WebSocketRouter = require('../router');
const { count_votes } = require('../../utils/other');
const { assert } = require('chai');
const { generate_random_integer } = require('../../utils/generators');
const wsRouter = new WebSocketRouter()

/**
 * Used to Send updates of member joins, exits and vote.
 */
wsRouter.ws('/room/', async (ws, user, model_params, parameters, roomStorage) => {
    if (roomStorage.getAttr("status", "start") !== "start") {
        ws.send({
            type: "error",
            data: "Cannot join while not in start status"
        })
        ws.close()
        return
    }

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
    const member_json = await member.json()

    ws.send_all({
        room: room.json().code
    }, { 
        type: "member_joined",
        data: member_json
    })
    
    ws.on('message', async (message) => {
        if (message.type == "start_voting") {
            if (!is_admin) {
                ws.send({
                    type: "error",
                    data: "You do not have permission to do this"
                })
                ws.close()
                return
            }

            if (roomStorage.getAttr("status") === 'voting') {
                ws.send({
                    type: "error",
                    data: "Already in voting status"
                })
                ws.close()
                return
            }
            
            roomStorage.setAttr("status", "voting")

            ws.send_all({
                room: room.json().code
            }, { 
                type: message.type,
            })

            const player_count = await room.getMemberCount()

            var availiable_games = games.filter((game, i, arr) => {
                const { players } = games_config[game]
                return players.from <= player_count && player_count <= players.to
            })

            roomStorage.setAttr("games", availiable_games)

            ws.send_all({
                room: room.json().code
            }, { 
                type: "games",
                data: availiable_games
            })
        }
        
        if (message.type == "start_game") {
            if (!is_admin) {
                ws.send({
                    type: "error",
                    data: "You do not have permission to do this"
                })
                ws.close()
                return
            }

            if (roomStorage.getAttr("status") !== 'voting') {
                ws.send({ 
                    type: "error", 
                    data: "Not in voting status"
                })
                ws.close()
                return
            }
            
            var votes = roomStorage.getAttr("votes", {})
            const number_of_votes = Object.keys(votes).length
            const member_count = await room.getMemberCount()

            if (number_of_votes < member_count) {
                ws.send({
                    type: "error",
                    data: "Wait until every member has voted"
                })
                // ws.close()
                return
            }

            const {most_voted} = count_votes(votes)

            await room.change("is_game", 1)
            await room.change("game", most_voted)

            await ws.for_all_clients({
                room: room.json().code
            }, async (c) => {
                const roommember = await RoomMember.objects_getBy("user", c.getAttr("user")) 

                assert( roommember["error"] == undefined)

                await c.send({ 
                    type: "start_game",
                    data: {
                        game: most_voted,
                        redirection_key: roommember.getRedirectionKey()
                    }
                })
            
            })

            ws.close_all({
                room: room.json().code
            }) 
        }

        if (message.type == "vote") {
            const voted_game = message.data
            if (roomStorage.getAttr("status") !== "voting") {
                ws.send({
                    type: "error",
                    data: "You can only vote during voting status"
                })
                ws.close()
                return
            }

            const availiable_games = roomStorage.getAttr("games", [])
            
            if (!availiable_games.includes(voted_game)) {
                ws.send({
                    type: "error",
                    data:"Not a valid game"
                })
                ws.close()
                return
            }
            
            var votes = roomStorage.getAttr("votes", {})
            votes[member_json.id] = voted_game
            roomStorage.setAttr("votes", votes)

            var {votes_by_game} = count_votes(votes)

            ws.send_all({
                room: room.json().code
            }, { 
                type: "votes",
                data: votes_by_game
            })
        } // else -> "Error: Not valid type"
    });
    
    ws.on('close', async () => {
        await room.refresh()
        if (!room.is_game()) {
            await RoomMember.objects_deleteBy('user', user.json().id)
            const members = await room.getMembers()
            const member_count = members.length

            if (member_count === 0) {
                roomStorage.empty()
                Room.objects_deleteBy('id', room.json().id)
                return
            }
            if (roomStorage.getAttr("status") !== "start") {
                ws.send_all({
                    room: room.json().code
                }, {
                    type: "error",
                    data: `Member left during ${roomStorage.getAttr("status")} status`
                })
                ws.close_all({
                    room: room.json().code
                })
            } else {
                ws.send_all({
                    room: room.json().code
                }, {
                    type: "member_left",
                    data: member_json
                })

                if (is_admin) {
                    const new_admin_index = generate_random_integer(0, member_count)
                    const new_admin = members[new_admin_index]

                    await room.change("admin", new_admin.getAttr("user"))
                    await room.refresh()

                    ws.send_all({
                        room: room.json().code
                    }, {
                        type: "room",
                        data: room.json()
                    })
                }

            }
        }
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
        
        assert(room["error"] == undefined)

        const member_count = await room.getMemberCount()
        if (member_count >= 8) {
            return "Party is full"
        }
        
        const in_party = await RoomMember.in_party(user)
        if (in_party) {
            return "User already in party"
        }

        if (room.is_game()) {
            return "Cannot join while a game is being played"
        }

        return false
    },
    // We will use the room code as an identifier, as it is easier in this websocket
    room_identifier: async (user, model_params, url_params) => url_params["code"],
    user_identifier: async (user, model_params, url_params) => await url_params.token

})

module.exports = wsRouter