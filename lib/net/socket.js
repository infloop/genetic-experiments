'use strict';

var server = require('http').createServer();
var io = require('socket.io')(server);
io.on('connection', function(socket){
    console.log('client connected');
    socket.on('event', function(data){});
    socket.on('disconnect', function(){});
});
server.listen(3000);

module.exports = io;