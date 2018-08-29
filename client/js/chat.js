const socket = io();
const threeView = new threeDview();

const markMap = {
  0:"",
  1:"/img/ready-mark.png",
  2:"/img/dead-mark.png"
}
const NO_ACTION = 0;
const READY = 1;
const DEAD = 2;

function scrollToBottom () {
  // Selectors
  const messages = $('#messages');
  const newMessage = messages.children('li:last-child')
  // Heights
  const clientHeight = messages.prop('clientHeight');
  const scrollTop = messages.prop('scrollTop');
  const scrollHeight = messages.prop('scrollHeight');
  const newMessageHeight = newMessage.innerHeight();
  const lastMessageHeight = newMessage.prev().innerHeight();

  if (clientHeight + scrollTop + newMessageHeight + lastMessageHeight >= scrollHeight) {
    messages.scrollTop(scrollHeight);
  }
}

socket.on('connect', function () {
  const params = $.deparam(window.location.search);

  socket.emit('join', params, function (err) {
    if (err) {
      alert(err);
      window.location.href = '/';
    } else {
      console.log('No error');
    }
  });
});

socket.on('disconnect', function () {
  console.log('Disconnected from server');
});

socket.on('updateUserList', function (users) {

  console.log(users)
  threeView.updateStatus(users)
  const ol = $('<ul></ul>');

  users.forEach(function (user) {
    ol.append($('<li></li>').text(user.name).append($(`<img class="ready-mark" src="${markMap[user.ready]}">`)));
  });

  $('#users').html(ol);
});

socket.on('newMessage', function (message) {
  const formattedTime = moment(message.createdAt).format('h:mm a');
  let template = $('#message-template').html();
  if(message.admin) template = $('#adminMessage-template').html();
  const html = Mustache.render(template, {
    text: message.text,
    from: message.from,
    createdAt: formattedTime
  });
  if(message.gg){
    $('#ready-button').removeAttr('disabled')
  }

  $('#messages').append(html);
  scrollToBottom();
});

socket.on('newLocationMessage', function (message) {
  const formattedTime = moment(message.createdAt).format('h:mm a');
  const template = $('#location-message-template').html();
  const html = Mustache.render(template, {
    from: message.from,
    url: message.url,
    createdAt: formattedTime
  });

  $('#messages').append(html);
  scrollToBottom();
});

socket.on('buttonMessage', function (message) {

  console.log(message)

  const span = $('<span></span>');
  message.roomUsers.forEach(function (user) {
    if(user.id === socket.id) {
      message.answers.forEach(function (answer) {
        if (user.ready === 2 ){
          span.append($(`<a>${answer}</a>`));
          span.append($(`<a>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</a>`));
        } else {
          span.append($(`<button class="answer">${answer}</button>`));
          span.append($(`<a>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</a>`));
        }
      })
    }
});


  const buttonMessage = $('<li class="message"></li>')
  buttonMessage.append($('<div class="message__title admin"></div>').append($(`<h4>Admin</h4>`)).append($(`<span>${moment(message.createdAt).format('h:mm a')}</span>`)));
  buttonMessage.append($('<div class="message__body"></div>').append(span));


    // <div class="message__body">
    //   <p>{{text}}</p>
    // </div>


  $('#messages').append(buttonMessage);
  $('.answer').click(function(e) {
    e.preventDefault();
    socket.emit('answerMessage',  {answer:$(this).text()});
    e.target.parentElement.parentElement.parentElement.remove();

  });
  scrollToBottom();
});



$('#message-form').on('submit', function (e) {
  e.preventDefault();

  const messageTextbox = $('[name=message]');

  socket.emit('createMessage', {
    text: messageTextbox.val()
  }, function () {
    messageTextbox.val('')
  });
});

const readyButton = $('#ready-button');
readyButton.on('click', function () {

  // if (!navigator.geolocation) {
  //   return alert('Geolocation not supported by your browser.');
  // }
  //
  readyButton.attr('disabled', 'disabled');

  socket.emit('statusReady', { });
  //
  // navigator.geolocation.getCurrentPosition(function (position) {
  //   readyButton.removeAttr('disabled').text('Send location');
  //   socket.emit('createLocationMessage', {
  //     latitude: position.coords.latitude,
  //     longitude: position.coords.longitude
  //   });
  // }, function () {
  //   readyButton.removeAttr('disabled').text('Send location');
  //   alert('Unable to fetch location.');
  // });
});
