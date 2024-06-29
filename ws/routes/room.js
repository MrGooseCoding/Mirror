function roomWS (ws) {
    console.log('New chat WebSocket connection');

    ws.on('message', (message) => {
        console.log(`Done`);
        ws.send(`Chat: You said: ${message}`);
    });

    ws.on('close', () => {
        console.log('Chat WebSocket connection closed');
    });
}

module.exports = roomWS