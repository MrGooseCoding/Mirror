const Validator = require('./validator')
const Model = require('../models/model.js');
// Regular expressions for username and email validation
/**
 * Basic validator class
 */
class basicValidator extends Validator {
    constructor (data) {
        super(Model, '', data)
    }

    /** Combines individual validations to perform an overall validation. This method determines `data_valid` attribute */
    async validate_all() {
    }

    /**
     * Formats user data by converting the username and email fields to lowercase and ensures that all data types are correctly formatted according to the _format_data method.
     */
    async format_data () {
        // await this._format_data()
    }

    async create () {
        return await this._create()
    }

}

module.exports = basicValidator