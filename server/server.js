const path = require('path');
const http = require('http');
const express = require('express');
const socketIO = require('socket.io');

const clientPtah = path.join(__dirname,'../client');
const port = process.env.PORT || 3000
const app = express();
const server = http.createServer(app);
const io = socketIO(server);

app.use(express.static(clientPtah));

io.on('connection', (socket) => {
  console.log('New user connected');

  socket.on('disconnect', () => {
    console.log('User is diconnected')
  })

});

server.listen(port, () => {
  console.log(`Server is up on port ${port}`);
})
