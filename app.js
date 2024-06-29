const express = require('express');
const http = require('http');

const api = require('./api/urls.js'); // Import the user routes
const WebSocketServer = require('./ws/server')

const app = express();

app.use(express.json())
app.use('/api', api);

const server = http.createServer(app)
const wss = WebSocketServer(server)

// Add more route files as needed

const port = 3000;
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});