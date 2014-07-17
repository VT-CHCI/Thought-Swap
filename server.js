// App Requirements
var express = require('express');
var app = express();
// var pg = require('pg');  //Commented out until database implementation
var http = require('http').Server(app);
var io = require('socket.io')(http);

// Serves the app in the browser
app.use(express.static(__dirname + '/app'));

var port = 3000;
http.listen(port, function(){
  console.log('listening on *:', port);
});

// Associative Array Holding each student's id and current thought
var allThoughts = {};
var chronologicalThoughts = [];

function numSubmitters () {
  return Object.keys(allThoughts).length;
}

function addThought (socket, thought) {
  chronologicalThoughts.push(thought);
  if (allThoughts.hasOwnProperty(socket.id)) {
    allThoughts[socket.id].push(thought);
  }
  else {
    //this means we just got a new submitter
    allThoughts[socket.id] = [thought];
    socket.broadcast.to('teacher').emit('num-submitters', numSubmitters());
  }
}

var thoughts = 0;
var submitters = 0;
// var connectedStudents = 0;

// Server listens for connect/ disconnect and logs it when it happens
// Stuff only happens when someone is connected.
io.sockets.on('connection', function (socket) {
  // connectedStudents++;
  // if (io.nsps['/'].adapter.rooms.hasOwnProperty('student')) {
  //   console.log('>> Client Connected  >> ', Object.keys(io.nsps['/'].adapter.rooms['student']).length);
    
  //   socket.broadcast.emit('num-students', Object.keys(io.nsps['/'].adapter.rooms['student']).length);
  // }
  
  socket.on('disconnect', function () {
    // connectedStudents--;
    if (io.nsps['/'].adapter.rooms.hasOwnProperty('student')) {
      console.log('<< Client Disconnected << ', Object.keys(io.nsps['/'].adapter.rooms['student']).length);
      
      socket.broadcast.emit('num-students', Object.keys(io.nsps['/'].adapter.rooms['student']).length);
    }
  });

  // Will put student's new thought in the array and associate the student with a unique id
  socket.on('new-thought-from-student', function (newThought) {
    console.log('New Thought')
    // allThoughts[socket.id] = newThought;
    addThought(socket, newThought);

    thoughts++;
    //submitters count will go here and it will be an if statement utilizing the socket id [Assistance]

    socket.broadcast.to('teacher').emit('new-thought-from-student', newThought);
  });

  // Listens for a teacher's input and puts them in the teacher room
  socket.on('teacher', function() {
    console.log('Teacher Joined')
    socket.leave('student');
    socket.join('teacher');
    // connectedStudents--;
    socket.emit('thought-sync', {thoughts:chronologicalThoughts, connected:Object.keys(io.nsps['/'].adapter.rooms['student']).length, submitters:numSubmitters()});
    socket.broadcast.emit('num-students', Object.keys(io.nsps['/'].adapter.rooms['student']).length);
  });

  socket.on('student', function() {
    socket.leave('teacher');
    socket.join('student');
    console.log(Object.keys(io.nsps['/'].adapter.rooms['student']).length);
    socket.broadcast.emit('num-students', Object.keys(io.nsps['/'].adapter.rooms['student']).length);
  });

  // io.of('/chat').sockets.length
  socket.on('distribute', function() {
    console.log('got distribute msg');

    // Shuffle function to randomize array
    function shuffle(o){ //v1.0 courtesy of Google
      for(var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
      return o;
    };

    // Initialize the two arrays.
    var distribution = Object.keys(allThoughts);
    var newDistribution = shuffle(distribution.slice());
    console.log(distribution);
    console.log(newDistribution);

    // Loops through two arrays, returns true if a match between them is found, false if no matches exist
    function hasMatch(a, b) {
      for (var i = 0; i < a.length; i++) {
        if (a[i]==b[i]) {
          return true;
        }; 
      };
       return false;
    };
    // Reshuffle until no match is found
    while(hasMatch(distribution, newDistribution)) {
      shuffle(newDistribution);
    }

    console.log('reshuffling complete');

    // Tells all clients there is a new value to the distribution and sends said value
    for (var i = 0; i < distribution.length; i++) {
      // socket.to(distribution[i]).emit('new-distribution', allThoughts[newDistribution[i]][]);  //adam fix this
    } 
    console.log('completed sending messages');

  });


});