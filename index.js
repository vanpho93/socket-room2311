var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
server.listen(process.env.PORT || 3000, () => console.log('Server started'));

function Room(roomName){
  this.roomName = roomName;
  this.mang = [];
}
var mangRoom = [
  new Room('Hoc tap'),
  new Room('An choi'),
  new Room('Kinh te'),
  new Room('Chung khoan')
];
var mangUsername = [];

app.set('view engine', 'ejs');
app.set('views', './views');
app.use(express.static('public'));
app.get('/', (req, res) => res.render('home',{mangRoom: mangRoom.map(e => e.roomName)}));

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
    socket.leave(socket.currentRoom, () => {
      socket.join(roomName, () => {
        socket.currentRoom = roomName;
      });
    });
    var room = mangRoom.find(e => e.roomName == roomName);
    socket.emit('ROOM_MESSAGE', room.mang);
  });

  socket.on('CLIENT_SEND_MESSAGE', msg => {
    var message = `${socket.username}: ${msg}`
    io.to(socket.currentRoom).emit('SERVER_SEND_MESSAGE', message);
    var room = mangRoom.find(e => e.roomName == socket.currentRoom);
    room.mang.push(message);
  });
});
