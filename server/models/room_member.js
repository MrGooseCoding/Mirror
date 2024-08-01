const Model = require('./model')
const Room = require('./room')
const User = require('./user')
const { generate_uuid } = require('./../utils/generators')

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
            redirection_key: generate_uuid(),
            has_joined_game: 0
        }

        return await this._create(formatted_data)
    }

    getRedirectionKey() {
        return this.data.redirection_key
    }

    has_joined_game() {
        return this.data.has_joined_game == 1
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