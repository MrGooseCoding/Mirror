const Model = require('./model')
const config = require('./../config')
const bcrypt = require('bcrypt');
const { generate_uuid, generate_date_string } = require('./../utils/generators');

class User extends Model{
    static name = "User"
    static table = "users"

    constructor (data = {}) { // Note that this method does not insert anything in the database
        "initializes a User class, without inserting anything in the database"
        super(data, 'users')
    }

    static async create(data) { 
        data.token = generate_uuid()
        data.date_created = generate_date_string()
        data.validated = config.validate_email ? 0 : 1

        return await this._create(data)
    }

    static async authenticate (username, password) {
        const result = await this.objects_getBy("username", username)
        if (result["error"]) {
            return result
        }
        const match = await bcrypt.compare(password, result.data.password);
        return match ? result : {error: "Invalid username or password"}
    }

    json (removePassword=true, removeToken=true) {
        let json = this.data
        if (removePassword) {
            delete json["password"]
        }
        if (removeToken) {
            delete json["token"]
        }
        return json
    }
}

module.exports = User