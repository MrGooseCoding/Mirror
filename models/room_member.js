const Model = require('./model')

class RoomMember extends Model {
    static name = "RoomMember"
    static table = "room_members"
    
    constructor (data = {}) {
        super(data, 'room_members')
    }

    static async create (data) {
        var formatted_data = {
            room: data.room.json().id,
            user: data.user.json().id,
            type: data.type,
            voted_game: data.voted_game
        }

        return await this._create(formatted_data, false)
    }

    static async in_party(user) {
        const data = await RoomMember.objects_getBy('user', user.json().id)
        return !data.error
    }
}

module.exports = RoomMember