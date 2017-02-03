console.log ("my socket server is running");

var express = require('express');
var app = express();
server = app.listen(3000);

var socket = require('socket.io');
var io = socket(server);

io.sockets.on('connection', newConnection);

app.use(express.static('public')); 

function newConnection(socket) {
    console.log("new connection from " + socket.id);
    socket.on('mouse', mouseMessageReceived);

    function mouseMessageReceived(msg) {
        console.log(msg);
        socket.broadcast.emit('mouse', msg);
        // io.sockets.emit(msg);  // this one also goes to original sender
    }

}


function broadcast(msg) {
    
}
