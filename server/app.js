const express = require('express');
const http = require('http');
const cors = require('cors')
const path = require('path');

const config = require('./config.js')
const api = require('./api/urls.js'); // Import the user routes
const WebSocketServer = require('./ws/server')

const app = express();

app.use(cors()) // just for testing
app.use(express.json())
app.use('/api', api);

app.use((req, res, next) => {
  if (/(.ico|.js|.css|.jpg|.png|.map)$/i.test(req.path)) {
      next();
  } else {
      res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
      res.header('Expires', '-1');
      res.header('Pragma', 'no-cache');
      res.sendFile(path.join(__dirname, '../webpage/dist/index.html'));
  }
});

app.use(express.static(path.join(__dirname, '../webpage/dist/')));

const server = http.createServer(app)
WebSocketServer(server)

// Add more route files as needed

const port = config.port
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

module.exports = app