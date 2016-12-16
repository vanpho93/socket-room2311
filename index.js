var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
server.listen(3000, () => console.log('Server started'));

var mangRoom = ['Hoc tap', 'Kinh te', 'An choi', 'Chung khoan', 'Giai tri'];
var mangUsername = [];

app.set('view engine', 'ejs');
app.set('views', './views');
app.use(express.static('public'));
app.get('/', (req, res) => res.render('home',{mangRoom}));

io.on('connection', socket => {
  console.log('Co nguoi ket noi');
  socket.on('CLIENT_REGISTER', username => {
    if(mangUsername.indexOf(username) == -1){
      mangUsername.push(username);
      socket.emit('SERVER_CONFIRM_USERNAME', true);
      socket.username = username;
    }else{
      socket.emit('SERVER_CONFIRM_USERNAME', false);
    }
  });

  socket.on('CLIENT_JOIN_ROOM', roomName => {
    socket.leave(socket.currentRoom);
    socket.join(roomName, () => {
      console.log(socket.rooms);//Canh giac
      socket.currentRoom = roomName;
    });

    console.log(`${socket.username} join ${roomName}`);
  });

  socket.on('CLIENT_SEND_MESSAGE', msg => {
    io.to(socket.currentRoom).emit('SERVER_SEND_MESSAGE', `${socket.username}: ${msg}`);
  });
});
