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
            game: ""
        }
        const room = await this._create(data)
        await RoomMember.create({
            room: room,
            user: admin,
            type: "admin",
            voted_game: ""
        })

        return room
    }

    async addMember (member) {
        await RoomMember.create({
            room: this,
            user: member,
            type: "participant",
            voted: ""
        })
    }

    async getMembers () {
        return await RoomMember.objects_searchBy('room', this.json().id, 20)
    }

    async getMemberCount () {
        return await this.getMembers().length
    }
}

module.exports = Room