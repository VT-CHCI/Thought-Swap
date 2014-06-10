var express = require('express');
var app = express();
var pg = require('pg');
var http = require('http').Server(app);
var io = require('socket.io')(http);

// app.all('*', function(req, res, next) {
//   res.header("Access-Control-Allow-Origin", "*");
//   res.header("Access-Control-Allow-Headers", "X-Requested-With");
//   next();
// });


// app.get('/s', function(req, res){
    
// });

app.use(express.static(__dirname + '/dist'));

http.listen(3000, function(){
  console.log('listening on *:3000');
});