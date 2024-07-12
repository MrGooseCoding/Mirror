const Model = require('../models/model');
const { generate_hash } = require('../utils/generators');

/** It ensures the integrity and validity of user-provided data before it is processed further in the application. 
 * It performs a series of checks and transformations on the data to ensure it adheres to the expected format, type, and constraints defined by the application's requirements. 
 */
class Validator {
    // errors object to store validation errors.
    errors = {}
    // Private field to store attributes that are write-only.
    _write_only_attributes = []
    // Flag to indicate if the data is valid.
    data_valid = false

    /** Constructor initializes the Validator. It also opens a database connection. Has the following parameters:
     * @param {Model} model - the model data type to be validated
     * @param {string} table - the string that represents the name of the table in the database
     * @param {Object} data - the record to be validated
     */

    constructor(model, table, data) {
        this.model = model
        this.table = table
        this.data = data
        this.modelInstance;
    }

    /** Asynchronously retrieves the data types from the database and transforms them into JavaScript types.
     * This method populates the data_types object with the transformed types
     */
    async get_data_types() {
        this.data_types = {}
        const data_types_transform = {
            'TEXT': 'string',
            'INTEGER': 'int',
            'DATETIME': 'string'
        }

        const raw_data_types = await this.model.get_data_types()
        raw_data_types.forEach(element => {
            this.data_types[element.name] = data_types_transform[element.type]
        });
    }

    /** Formats the user-provided data according to the data types retrieved from the database.
     * It trims strings and converts non-string values to numbers, ensuring data integrity.
     */
    async _format_data() {
        await this.get_data_types()

        var formated_data = {}
        for (var key in this.data_types) {
            const value = this.data[key]

            if (!Boolean(value)) {
                if (this.data_types[key] === 'string') {
                    formated_data[key] = value ? String(value).trim() : ""
                } else {
                    formated_data[key] = value ? Number(value) : 0
                }

                this.data[key] = formated_data[key]
            }

        }

    }

    /** Asynchronously creates a new record in the database if the data is valid. 
     * It filters out write-only attributes before creating the record.
     */
    async _create() {
        if (!this.data_valid) {
            return [false, this.errors]
        }
        try {
            this.modelInstance = await this.model.create(this.data)

            return [true, this.modelInstance]
        } catch (e) {
            return [false, {error:'Invalid request'}]
        }
    }

    /** Checks if a given attribute is unique in the model's database. 
     * It returns false if the attribute is not unique, adding an error message to the errors object.
     */
    async unique (attrName) {
        const attrValue = this.data[attrName]
        const identifierAttr = {}
        identifierAttr[attrName] = attrValue

        const data = await this.model.objects_getBy(attrName, this.data[attrName])

        if (!data["error"]) {
            this.errors[attrName] = `${attrName} has to be unique`;
        }

        return Boolean(data["error"]);
    }

    /** Validates that a given attribute is of a selected type
     */
    of_type (attrName, type) {
        const attrValue = this.data[attrName]

        const type_name = type.name.toLowerCase()

        const isInstance = typeof attrValue == type_name || attrValue instanceof type

        const isNull = !Boolean(attrValue)

        const valid = isNull || isInstance

        if (!valid) {
            this.errors[attrName] = `${attrName} is not an instance of ${type_name}`
        }
        return valid
    }

    /** Validates that a given attribute is not null. 
     * It returns false if the attribute is null, adding an error message to the errors object.
     */
    not_null (attrName) {
        const valid = Boolean(this.data[attrName])

        if (!valid) {
            this.errors[attrName] = `${attrName} can not be null`
        }
        return valid
    }

    /** Validates that a given attribute does not exceed a specified maximum length.
     * It returns false if the attribute exceeds the maximum length, adding an error message to the errors object.
     */
    max_length (attrName, maxLength) {
        const l = this.data[attrName].length
        const valid = l <= maxLength

        if (!valid) {
            this.errors[attrName] = `${attrName} has to have a maximum of ${maxLength} characters`
        }
        return valid
    }

    /** Validates that a given attribute meets a specified minimum length. 
     * It returns false if the attribute does not meet the minimum length, adding an error message to the errors object.
     */
    min_length (attrName, maxLength) {
        const l = this.data[attrName].length
        const valid = l >= maxLength

        if (!valid) {
            this.errors[attrName] = `${attrName} has to have a minimum of ${maxLength} characters`
        }
        return valid
    }

    /** Validates that a given attribute matches a specified regular expression. 
     * It returns false if the attribute does not match the regex, adding an error message to the errors object.
     */
    follows_regex (attrName, regex) {
        const valid = regex.test(this.data[attrName])

        if (!valid) {
            this.errors[attrName] = `${attrName} does not follow regex`
        }
        return valid
    }

    /** Encrypts a given attribute using a hashing function.
     *  It replaces the attribute's value with the hashed value.
     */
    async encripted (attrName) {
        this.data[attrName] = await generate_hash(this.data[attrName])
        return true
    }

    /** Validates that a given attribute does not contain any whitespace characters. 
     * It returns false if the attribute contains whitespace, adding an error message to the errors object.
     */
    no_whitespace (attrName) {
        const regex = /^\S+$/
        const valid = regex.test(this.data[attrName])

        if (!valid) {
            this.errors[attrName] = `${attrName} can not have whitespaces`
        }
        return valid
    }

    /** Sets a given attribute to a default value if its type is string, otherwise sets it to 0. 
     * This method is used for attributes that should be read-only.
     */
    _user_readonly (attrName) {
        this.data[attrName] = this.data_types[attrName] === "string" ? "" : 0
        return true
    }

    /** Adds a given attribute to the list of write-only attributes. 
     * This method is used for attributes that should only be written to the database and not read.
     */
    _user_writeonly (attrName) {
        this._write_only_attributes.push(attrName)
        return true
    }
}

module.exports = Validator