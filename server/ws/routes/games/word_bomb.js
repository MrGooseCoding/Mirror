const Room = require("./../../../models/room");
const RoomMember = require("./../../../models/room_member");
const User = require("./../../../models/user");
const WebSocketRouter = require("./../../router");
const { count_votes, shuffle_array } = require("./../../../utils/other");
const { generate_random_integer } = require("./../../../utils/generators");
const { games_config } = require("./../../../config");
const getConfig = require("./router_config");
const impostor_config = games_config.impostor;

const wsRouter = new WebSocketRouter();

/**
 * Used to Send updates of member joins, exits and vote.
 */
wsRouter.ws(
  "/impostor/",
  async (ws, u, model_params, parameters, roomStorage) => {},
  getConfig("impostor"),
);

module.exports = wsRouter;
