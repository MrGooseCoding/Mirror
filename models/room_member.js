const Model = require('./model')
const User = require('./user')

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
            voted_game: data.voted_game
        }

        return await this._create(formatted_data, false)
    }

    static async in_party(user) {
        const data = await RoomMember.objects_getBy('user', user.json().id)
        return !data.error
    }

    async json() {
        const { user } = this.data
        const user_data = await User.objects_getBy('id', user)
        return user_data.json()
    }
}

module.exports = RoomMember