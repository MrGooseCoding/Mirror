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

    getAttr(attrName, def) {
        if (!this.data[attrName]) {
            this.data[attrName] = def
        }
        return this.data[attrName]
    }

    empty() {
        this.data = {}
    }
}

module.exports = Storage