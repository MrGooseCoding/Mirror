function ws (handler) {
    const wrappedHandler = (url, ws) => {
        console.log(url)
        handler(ws)
    }

    return wrappedHandler
}

module.exports = ws