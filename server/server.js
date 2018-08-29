const path = require('path');
const http = require('http');
const express = require('express');
const socketIO = require('socket.io');
const axios = require('axios');

const {generateMessage, generateLocationMessage, generateButtonMessage} = require('./utils/message');
const {isRealString} = require('./utils/validation');
const {Users} = require('./utils/users');

const clientPtah = path.join(__dirname,'../client');

const port = process.env.PORT || 3000
const app = express();
const server = http.createServer(app);
const io = socketIO(server);
const users = new Users();
const roomAnswer = {};
const TRIVIA_API_URL = "https://opentdb.com/api.php?amount=1"

app.use(express.static(clientPtah));

io.on('connection', (socket) => {

  socket.on('join', (params, callback) => {
    if (!isRealString(params.name) || !isRealString(params.room)) {
      return callback('Name and room name are required.');
    }

    socket.join(params.room);
    users.removeUser(socket.id);
    users.addUser(socket.id, params.name, params.room, 0);

    io.to(params.room).emit('updateUserList', users.getUserList(params.room));
    socket.emit('newMessage', generateMessage('Admin', 'Welcome to the chat app',true));
    socket.broadcast.to(params.room).emit('newMessage', generateMessage('Admin', `${params.name} has joined.`,true));
    callback();
  });

  socket.on('createMessage', (message, callback) => {
    const user = users.getUser(socket.id);

    if (user && isRealString(message.text)) {
      io.to(user.room).emit('newMessage', generateMessage(user.name, message.text));
    }

    callback();
  });

  socket.on('createLocationMessage', (coords) => {
    const user = users.getUser(socket.id);

    if (user) {
      io.to(user.room).emit('newLocationMessage', generateLocationMessage(user.name, coords.latitude, coords.longitude));
    }
  });

  socket.on('disconnect', () => {
    const user = users.removeUser(socket.id);

    if (user) {
      io.to(user.room).emit('updateUserList', users.getUserList(user.room));
      io.to(user.room).emit('newMessage', generateMessage('Admin', `${user.name} has left.`, true));
    }
  });

  socket.on('statusReady', (message) => {
    const user = users.getUser(socket.id);
    if (message.answer) {
      user.answer = message.answer
    }
    user.ready = 1
    io.to(user.room).emit('updateUserList', users.getUserList(user.room));
    console.log(users)

    if(users.checkAllReady(user.room)){
      users.initializeQuestion(user.room);
      io.to(user.room).emit('updateUserList', users.getUserList(user.room));
      fetchQuestion(user)
    }
  });

  socket.on('answerMessage', (message) => {
    const user = users.getUser(socket.id);
    if (message.answer) {
      user.answer = message.answer
    }
    user.ready = 1
    io.to(user.room).emit('updateUserList', users.getUserList(user.room));
    console.log(users)

    if(users.checkAllReady(user.room)){
      if (message.answer) {
        const winners = users.checkAnswer(user.room,roomAnswer[user.room])
        if(winners === 1){
          const winner = users.getWinner(user.room);
          console.log(winner)
          io.to(user.room).emit('newMessage', generateMessage('Admin', `winner winner chicken dinner: ${winner}.`, true, true));
          users.resetReady(user.room);
        } else if (winners < 1){
          io.to(user.room).emit('newMessage', generateMessage('Admin', 'Game Over: no one survived', true, true));
          users.resetReady(user.room);
        } else {
          users.initializeQuestion(user.room);
          fetchQuestion(user)
        }
        io.to(user.room).emit('updateUserList', users.getUserList(user.room));
      }
    }
  });
});

async function fetchQuestion(user) {
  console.log(`fecthing question for room ${user.room}..`)
  const api_response = (await axios.get(TRIVIA_API_URL)).data
  console.log(api_response);
  roomAnswer[user.room] = api_response.results[0].correct_answer;
  let count = 3;
  const timer = await setInterval(function() { handleTimer(count) }, 1000);

  function handleTimer() {
    if(count === 0) {
      clearInterval(timer);
      io.to(user.room).emit('newMessage', generateMessage('Admin', api_response.results[0].question, true));

      io.to(user.room).emit('buttonMessage', generateButtonMessage(api_response, users.getRoomUsers(user.room)));
    } else {
      io.to(user.room).emit('newMessage', generateMessage('Admin', count, true));
      count--;
    }
  }
}

server.listen(port, () => {
  console.log(`Server is up on port ${port}`);
})
