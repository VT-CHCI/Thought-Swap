// App Requirements
var express = require('express');
var app = express();
// var pg = require('pg');  //Commented out until database implementation
var http = require('http').Server(app);
var io = require('socket.io')(http);

// Serves the app in the browser
app.use(express.static(__dirname + '/app'));

http.listen(3000, function(){
  console.log('listening on *:3000');
});

// Associative Array Holding each student's id and current thought
var allThoughts = {};

// Server listens for connect/ disconnect and logs it when it happens
// Stuff only happens when someone is connected.
io.sockets.on('connection', function (socket) {
  console.log('Client Connected');
  
  socket.on('disconnect', function () {
    console.log('client disconnected');
  });

  // Will put student's new thought in the array and associate the student with a unique id
  socket.on('new-thought-from-student', function (newThought) {

    // allThoughts.push(newThought); // Artifact: Was used only for normal array

    allThoughts[socket.id] = newThought;

    // socket.broadcast.emit('new-thought-from-student', newThought); // Artifact

    socket.broadcast.to('teacher').emit('new-thought', {thought: newThought, id: socket.id});
  });

  // Listens for a teacher's input and puts them in the teacher room
  socket.on('teacher', function() {
    socket.join('teacher');
  });
});