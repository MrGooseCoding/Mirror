const Room = require('./../../../models/room')
const RoomMember = require('./../../../models/room_member')
const User = require('./../../../models/user')
const WebSocketRouter = require('./../../router');
const { count_votes } = require('./../../../utils/other');
const wsRouter = new WebSocketRouter()

/**
 * Used to Send updates of member joins, exits and vote.
 */
wsRouter.ws('/impostor/', async (ws, user, model_params, parameters, roomStorage) => {
    console.log("Hey")
    
}, {
    required_parameters: [],
    auth: false,
    model_parameters : [],
    inner_logic_validation: async (user, model_params, url_params) => {},
    storage_identifier: ""
})

module.exports = wsRouter