var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var mysql      = require('mysql');

// MySQL database initialization
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'thoughtswap',
  password : 'thoughtswap',
  database : 'thoughtswap'
});

connection.connect();

//-------------------------------------------------------------------------
/**
 *  The server file for the ThoughtSwap app, handles client interaction
 *  and provides functionality on the back-end that controllers alone 
 *  are insufficient for. Also handles all data logging required for 
 *  user research.
 *
 *  @authors Michael Stewart, Adam Barnes
 *  @version v 0.0.0  (2014)
 */
//-------------------------------------------------------------------------

/**
 * ~~ Initialization ~~
 * Steps required to start up the app and provide future functions with
 * variables they will use.
 */
  app.use(express.static(__dirname + '/app'));

  var port = 3003;
  http.listen(port, function (){
    console.log('listening on *:', port);
  });

  var allThoughts = {};             // allThoughts = socketid: 
                                    // [{ id: socket.id, thought: thought1, databaseId: insertId}, 
                                    //  { id: socket.id, thought: thought2, databaseId: insertId}, ...]

  var chronologicalThoughts = [];   // list of thoughts for the teacher view as they are recieved
  var newQuestion = '';
  var currentPromptId = -1;

  /**
   * Will return the number of unique ids in allThoughts which correlates
   * to the amount of submitters.
   */
  function numSubmitters () {
    return Object.keys(allThoughts).length;
  }

  /**
   * Will add the thoughts recieved to an array that is sent to the
   * teacher's view.
   */
  function addThought (socket, thought, id) {
    var newThought = {id:socket.id, thought:thought, databaseId:id};
    console.log(newThought);
    chronologicalThoughts.push(newThought);
    if (allThoughts.hasOwnProperty(socket.id)) {
      allThoughts[socket.id].push(newThought); 
    }
    else {
      //this means we just got a new submitter
      allThoughts[socket.id] = [newThought]; 
      socket.broadcast.to('teacher').emit('num-submitters', numSubmitters());
    }
  }

  function getClientId (socketId, callback) {
    var selectClient_id = 'select id from clients where socket_id=?;'
    connection.query(selectClient_id, [socketId], function (err, results) {
      console.log('getClientId', err, results);
      if (results.length > 0) {
        callback(results[0].id);
      }
    });
  }

//-------------------------------------------------------------------------

/**
 * ~~ Activity ~~
 * The main functions of the server, listening for events on the client
 * side and responding appropriately.
 */
 io.sockets.on('connection', function (socket) {
  console.log('>> Client Connected  >> ');

  /**
   * Database Query: Will log relevant data in the socket_id, and
   * connect columns for the CLIENTS table
   */
  var clientQuery = 'insert into clients(socket_id, connect) values(?, ?);'
  connection.query(clientQuery, [socket.id, new Date()], function (err, results) {
    //console.log('connect', err, results);
  });
  
  /**
   * Will catch when a client leaves the app interface entirely and send
   * out the updated number of connected students for the teacher view.
   */
  socket.on('disconnect', function () {

    /**
     * Database Query: Will log relevant data in the disconnect
     * column for the CLIENTS table
     */
    // var selectClient_id = 'select id from clients where socket_id=?;'
    // connection.query(selectClient_id, [socket.id], function (err, results) {
      // console.log('client id found', err, results);
      // if (results.length > 0) {
    getClientId(socket.id, function (clientId) {
      var clientQuery = 'update clients set disconnect=? where id=?;'
      connection.query(clientQuery, [new Date(), clientId], function (err, results) {
        console.log('client disconnect updated', err, results);
      });
    });

    if (io.nsps['/'].adapter.rooms.hasOwnProperty('student')) {
      console.log('<< Client Disconnected << ');
      
      socket.broadcast.emit('num-students', 
          Object.keys(io.nsps['/'].adapter.rooms['student']).length);
    }

  });

  /**
   * Will catch when a student submits a thought and send that info
   * to teachers
   */
  socket.on('new-thought-from-student', function (newThought) {

    /**
     * Database Query: Will log relevant data in the content, client_id,    ***Still need to add group_id support***
     * prompt_id, columns to the THOUGHTS table
     */
    // var selectClient_id = 'select id from clients where socket_id=?;'
    // connection.query(selectClient_id, [socket.id], function (err, results) {
    //   console.log('client id found', err, results);
    //   if (results.length > 0) {

      getClientId(socket.id, function (clientId) {
        var queryParams =  [newThought, new Date(), clientId];

        var thoughtQuery = 'insert into thoughts(content, recieved, author_id) values(?, ?, ?);'
        if (currentPromptId != -1) {
          thoughtQuery = 'insert into thoughts(content, recieved, author_id, prompt_id) values(?, ?, ?, ?);'
          queryParams.push(currentPromptId);
        }

        connection.query(thoughtQuery, queryParams, function (err, results) {
          console.log('new thought logged', err, results);
          addThought(socket, newThought, results.insertId);

        });
      });

      // Old Callback ~~

      //   var queryParams =  [newThought, new Date(), results[0].id];
      //   var thoughtQuery = 'insert into thoughts(content, recieved, author_id) values(?, ?, ?);'
      //   if (currentPromptId != -1) {
      //     thoughtQuery = 'insert into thoughts(content, recieved, author_id, prompt_id) values(?, ?, ?, ?);'
      //     queryParams.push(currentPromptId);
      //   }
      //   console.log(queryParams);
      //   connection.query(thoughtQuery, queryParams, function (err, results) {
      //     console.log('new thought logged', err, results);
      //     addThought(socket, newThought, results.insertId);
      //   });
      //   }
      // });

    //console.log('New Thought');
    

    socket.broadcast.to('teacher').emit('new-thought-from-student', newThought);
  });


  /**
   * Will listen for a prompt from teachers and send it along to students.
   */
  socket.on('new-prompt', function (newPrompt) {
    
    /**
     * Database Query: Will log relevant data in the content and recieved
     * columns of the PROMPTS table
     */ 
    var promptQuery = 'insert into prompts(content, recieved) values(?, ?);'
    connection.query(promptQuery, [newPrompt, new Date()], function (err, results) {
      console.log('prompt logged', err, results);
    
    currentPromptId = results.insertId;
  });

    console.log('Prompt recieved');
    socket.broadcast.to('student').emit('new-prompt', newPrompt);
    newQuestion = newPrompt;
  });

  /**
   * Will catch when a teacher initiates a new session and set server
   * variables back to their initial state.
   */
  socket.on('new-session', function () {
    console.log('new session initiated');
    socket.broadcast.emit('new-session');
    allThoughts = {};
    chronologicalThoughts = [];
    newQuestion = '';
  })

  /**
   * Will catch when a teacher connects, then add them to the teacher
   * room after ensuring they are not in the student room, then update
   * counts accordingly. It will also sync available data for 
   * teachers who may have joined after a session has begun.
   */
  socket.on('teacher', function () {
    console.log('Teacher Joined')
    socket.leave('student');
    socket.join('teacher');

    socket.emit('thought-sync', {thoughts:chronologicalThoughts,
      connected:Object.keys(io.nsps['/'].adapter.rooms['student']).length,
         submitters:numSubmitters()});

    socket.broadcast.emit('num-students', 
        Object.keys(io.nsps['/'].adapter.rooms['student']).length);
  });

  /**
   * Will catch when a student connects, then add them to the student
   * room after ensuring they are not in the teacher room, then update
   * counts accordingly.
   */
  socket.on('student', function () {
    socket.leave('teacher');
    socket.join('student');

    io.sockets.emit('prompt-sync', newQuestion);
    
    socket.broadcast.emit('num-students',
       Object.keys(io.nsps['/'].adapter.rooms['student']).length);
  });

  //-------------------------------------------------------------------------
  /**
   * ~~ Primary Feature ~~
   * Will catch when a teacher chooses to distribute the thoughts
   * they have recieved. Performs the work nessessary to implement
   * distribution to each student.
   */
  socket.on('distribute', function () {
    console.log('got distribute msg');

    // Unique IDS of all students that thoughts need to be distributed to
    var recipients = Object.keys(io.nsps['/'].adapter.rooms['student']);

    // Placeholder variable for the distribute operation
    var flatThoughts = [];
    var studentSubmitters = Object.keys(allThoughts);

    for (var i=0; i < studentSubmitters.length; i++) {
      flatThoughts = flatThoughts.concat(allThoughts[studentSubmitters[i]])
    }

    var originalFlatThoughts = flatThoughts.slice();

    /**
     * Shuffle algorithm for randomizing an array.
     */
    function shuffle (o) { //v1.0 courtesy of Google
      for(var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
      return o;
    };

    /**
     * Will ensure that the ammount of thoughts up for distribution is the
     * same as the number of possible recipients.
     */
    if (recipients.length > originalFlatThoughts.length) {
      console.log('Thoughts will be fixed');
      var diff = recipients.length - originalFlatThoughts.length;
      for (var i = 0; i < diff; i++) {
        flatThoughts.push(originalFlatThoughts[Math.floor((Math.random() * originalFlatThoughts.length))]);
      }
    }

    console.log('Preparing to shuffle');

    var shuffledFlatThoughts = flatThoughts.slice();
    shuffle(shuffledFlatThoughts);

    /**
     * Will loop through two arrays, returning true if a match
     * between them is found, false if no matches exists.
     */ 
    function hasMatch (a, b) {
      for (var i = 0; i < a.length; i++) {
        if (a[i].id==b[i]) {
          return true;
        }; 
      };
       return false;
    };

    /**
     * Will take the shuffled arrays and reshuffle if nessessary
     * to ensure no student recieves the same thought they submitted.
     */
    while(hasMatch(shuffledFlatThoughts, recipients)) {
      shuffle(shuffledFlatThoughts);
    }

    console.log('reshuffling complete');


    /**
     * Will methodically send each student their newly assigned
     * thought, traveling through the old distribution until completion.
     */

    console.log(shuffledFlatThoughts);
    for (var i = 0; i < recipients.length; i++) {
      console.log(shuffledFlatThoughts[i]);
    
      /**
       * Database Query: Will log relevant data in the thought_id, and
       * reader_id, columns to the DISTRIBUTIONS table 
       */
      
      function getCallback(j) { //read about closures and evaluation and scope in javascript (maybe in michael's programming languages book)
        return function(clientId) {
          console.log(j);
          var distributeQuery = 'insert into distributions(thought_id, reader_id, distributedAt) values(?, ?, ?);'
          connection.query(distributeQuery,  [shuffledFlatThoughts[j].databaseId, clientId, new Date()], function (err, results) {
            console.log('distributions table filled in', err, results);
          });
        }
      }         

      getClientId(recipients[i], getCallback(i));
          

      socket.to(recipients[i]).emit('new-distribution',
         shuffledFlatThoughts[i].thought);
    } 

    console.log('completed sending messages');
    console.log('flatThoughts', flatThoughts);
    console.log('recipients', recipients);
    console.log('shuffledFlatThoughts', shuffledFlatThoughts);
  });


});