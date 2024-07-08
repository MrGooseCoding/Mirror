const basicValidator = require('./../validators/basicValidator')
const { WebSocket } = require('ws')

class WrappedWebSocket {
    constructor(ws, wss) {
        this.ws = ws
        this.wss = wss
    }

    send(json) {
        this.ws.send(JSON.stringify(json))
    }

    send_all(identifier, data) {
        const identifierName = Object.keys(identifier)[0]
        const identifierValue = identifier[identifierName]
        this.wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                if (client[identifierName] == identifierValue) {
                    client.send(JSON.stringify(data))
                }
            }
        });
    }

    setAttr (attrName, attrValue) {
        this.ws[attrName] = attrValue
    }

    getAttr (attrName) {
        return this.ws[attrName]
    }

    on(event_name, fun) {
        if (event_name == "message") {
            this.ws.on("message", (message) => {
                var json;
                try {
                    json = JSON.parse(message)
                } catch {
                    this.send({ type: "error", error: "message not in json format"})
                    this.close()
                    return
                }
                
                const v = new basicValidator(json)
        
                if (!v.not_null('type') || !v.of_type('type', String)) {
                    this.send({ type: "error", error: "Invalid type attribute"})
                    this.close()
                    return
                }
                fun(json)
            });

        } else {
            this.ws.on(event_name, fun)
        }
    }

    close () {
        this.ws.close()
    }
}

module.exports = WrappedWebSocket