const express = require('express');
const http = require('http');

const config = require('./config.js')
const api = require('./api/urls.js'); // Import the user routes
const WebSocketServer = require('./ws/server')

const app = express();

app.use(express.json())
app.use('/api', api);

const server = http.createServer(app)
const wss = WebSocketServer(server)

// Add more route files as needed

const port = config.port
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});