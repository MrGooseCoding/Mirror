/**
 * Stores temporary values in a websocket. Can be shared between multiple ws connection
 */
class Storage {
    constructor () {
        this.data = {}
    }

    setAttr(attrName, attrValue) {
        this.data[attrName] = attrValue
    }

    getAttr(attrName) {
        return this.data[attrName]
    }
}

module.exports = Storage