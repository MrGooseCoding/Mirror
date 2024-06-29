function ws (handler) {
    const wrappedHandler = (ws) => {
        handler(ws)
    }

    return wrappedHandler
}

module.exports = ws