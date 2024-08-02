const assert = require('assert');

const RoomMember = require('./../../../models/room_member')
const Room = require('./../../../models/room')

const getConfig = game => {
    return {
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

            if (member.has_joined_game()) {
                return "You are already in a game"
            }

            assert(member["error"] == undefined)
            
            const room = await Room.objects_getBy("id", member.getAttr("room"))
            
            assert(room["error"] == undefined)

            if (room.getAttr("game") !== game) {
                return "You have not joined your room's game"
            }
        },
        // In this case we will use room id as the identifier
        room_identifier: async (user, model_params, url_params) => await model_params.roommember.getAttr("room"),
        user_identifier: async (user, model_params, url_params) => await url_params.key
    }
}

module.exports = getConfig