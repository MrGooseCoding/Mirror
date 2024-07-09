const basicValidator = require('./../validators/basicValidator')
const { WebSocket } = require('ws')

class WrappedClient {
    constructor (client) {
        this.client = client
    }

    send(json) {
        this.client.send(JSON.stringify(json))
    }
    
    close() {
        this.client.close()
    }

    getAttr (attrName) {
        return this.client[attrName]
    }
}

class WrappedWebSocket {
    constructor(ws, wss) {
        this.ws = ws
        this.wss = wss
    }

    send(json) {
        this.ws.send(JSON.stringify(json))
    }

    async for_all_clients (identifier, fun) {
        const identifierName = Object.keys(identifier)[0]
        const identifierValue = identifier[identifierName]

        for await (let client of this.wss.clients) {
            if (client.readyState === WebSocket.OPEN) {
                const c = new WrappedClient(client)
                if (c.getAttr(identifierName) == identifierValue) {
                    await fun(c)
                }
            }
        }
    }

    send_all(identifier, data) {
        this.for_all_clients(identifier, async (c) => c.send(data))
    }
    
    close_all(identifier) {
        this.for_all_clients(identifier, async (c) => c.close())
    }

    async count_all(identifier) {
        var count = 0

        await this.for_all_clients(identifier, async (c) => {
            count += 1
        })

        return count
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