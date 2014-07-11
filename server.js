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


// Server listens for connect/ disconnect and logs it when it happens
// Stuff only happens when someone is connected.
io.sockets.on('connection', function (socket) {
  console.log('>> Client Connected  >>');
  
  socket.on('disconnect', function () {
    console.log('<< Client Disconnected <<');
  });

  // Will put student's new thought in the array and associate the student with a unique id
  socket.on('new-thought-from-student', function (newThought) {
    console.log('New Thought')
    allThoughts[socket.id] = newThought;

    // socket.broadcast.emit('new-thought-from-student', newThought); // Artifact

    socket.broadcast.to('teacher').emit('new-thought-from-student', {thought: newThought, id: socket.id});
  });

  // Listens for a teacher's input and puts them in the teacher room
  socket.on('teacher', function() {
    console.log('Teacher Joined')
    socket.join('teacher');
  });

  //
  socket.on('distribute', function() {
    console.log('got distribute msg');

    // Shuffle function to randomize array
    function shuffle(o){ //v1.0 courtesy of Google
      for(var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
      return o;
    };

    // Initialize the two arrays.
    var distribution = Object.keys(allThoughts);
    var newDistribution = shuffle(distribution);

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
      newDistribution = shuffle(distribution);
    }

    // Tells all clients there is a new value to the distribution and sends said value
    for (var i = 0; i < distribution.length; i++) {
      io.sockets.socket(distribution[i]).emit('new-distribution', allThoughts[newDistribution[i]]);
    }

  });
});