const Model = require('./model')
const RoomMember = require('./room_member')
const { generate_uuid, generate_code } = require('../utils/generators')

class Room extends Model {
    static name = "Room"
    static table = "rooms"

    constructor (data = {}) {
        super(data, 'rooms')
    }

    static async create(admin) {
        const data = {
            id: generate_uuid(),
            code: generate_code(),
            admin: admin.json().id,
            game: ""
        }
        const room = await this._create(data)
        return room
    }

    async addMember (user) {
        return await RoomMember.create({
            room: this,
            user: user,
            voted: ""
        })
    }

    is_admin (user) {
        return this.data.admin == user.json().id
    }

    async getMembers () {
        return await RoomMember.objects_searchBy('room', this.json().id, 20)
    }

    async getMemberCount () {
        return await this.getMembers().length
    }
}

module.exports = Room