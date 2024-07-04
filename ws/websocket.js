const basicValidator = require('./../validators/basicValidator')

class WrappedWebSocket {
    constructor(ws) {
        this.ws = ws
    }

    send(json) {
        this.ws.send(JSON.stringify(json))
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