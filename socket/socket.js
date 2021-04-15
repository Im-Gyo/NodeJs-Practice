const express = require('express');

function socketio (io)
{
    let resultFunction = function (req, res, next){
        var count = 1;
        io.on('connection', function(socket)
        {
            console.log('user connected: ', socket.id);
            var name = "user" + count++;
            io.to(socket.id).emit('change name', name);

            socket.on('disconnect', function()
            {
                console.log('user disconnected: ', socket.id);
            });

            socket.on('send message', function(name, text)
            {
                var msg = name + ' : ' + text;
                console.log(msg);
                io.emit('receive message', msg);
            });
        })
        next();
    };

    return resultFunction;
}
module.exports = socketio;