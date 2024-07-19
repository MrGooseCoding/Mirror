const Validator = require('./validator')
const Model = require('../models/model.js');
const User = require('./../models/user.js')
const { get_search_params, search_params_to_dict } = require('../utils/url_tools.js');
// Regular expressions for username and email validation
/**
 * Url params (?foo=abc) validator class
 * It is not asigned to any model, therefor any database method is useless
 */
class urlParamsValidator extends Validator {
    constructor (data) {
        super(Model, '', data)
    }

    async token_valid () {
        return (
            this.not_null("token") &&
            await this.model_exists("token", "token", User)
        )
    }

    async model_exists(attrName, database_name, model) {
        //await this.format_parameter(attrName, model)

        const attrValue = this.data[attrName]

        if (attrValue == undefined) {
            return false
        }

        const model_obj = await model.objects_getBy(database_name, attrValue)
        
        const model_name = model.name

        if (model_obj["error"]) {
            this.errors["token"] = `No ${model_name} with ${attrName} equal to ${attrValue}`
            return false
        }

        return true
    }

    check_required_parameters (required_parameters) {
        if (required_parameters === undefined || required_parameters.length == 0) {
            return true
        }

        var all_required_parameters = true
        
        required_parameters.forEach(element => {
            if (!this.not_null(element)) {
                all_required_parameters = false
            }
        })

        return all_required_parameters
    }

    /** Combines individual validations to perform an overall validation. This method determines `data_valid` attribute */
    async validate_all() {
    }

    /**
     *
     */
    async format_data () {
        const url_search_params = get_search_params(this.data)
        const params_to_dict = search_params_to_dict(url_search_params)

        this.data = params_to_dict
    }

    async create () {
        return await this._create()
    }

}

module.exports = urlParamsValidator