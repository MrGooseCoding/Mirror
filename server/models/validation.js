const Model = require('./model')
const User = require('./user')
const { generate_code, generate_date_string } = require('./../utils/generators');

class Validation extends Model{
    static name = "Validation"
    static table = "validation"

    constructor (data = {}) {
        super(data, 'validation')
    }

    static async create (type, user) {
        const data = {}
        data.type=type
        data.user=user.json().id
        data.code = generate_code()
        let currentDate = new Date();
        let expireDate = new Date(currentDate.setMinutes(currentDate.getMinutes() + 15))
        data.expire_date = generate_date_string(expireDate) // 15 minutes

        // Check that the user doesn't have another validation object. If so, delete it.
        let existingValidations = await this.objects_getBy("user", user.json().id)
        if (!existingValidations["error"]) {
            return { error: "There is already a validation object for this user" }
        }
        return this._create(data)
    }

    static async validate (code, user) {
        const result = await this.objects_getBy("user", user.json().id)
        
        if (result["error"]) {
            return { error: "User not looking for validation"}
        }

        const date = new Date(result.json().expire_date)

        if (new Date() > date) {
            return { error: "Validation expired"}

        }

        if (code != result.json().code) {
            return false
        }

        return true
    }

    static async register_validated (user) {
        await this.objects_deleteBy("user", user.json().id)

        await user.change("validated", 1)
    }
}

module.exports = Validation