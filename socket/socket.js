const express = require('express');

function socketio (io)
{
    var resultFunction = function (req, res, next){
        var count = 1;
        io.on('connection', function(socket)
        {            
            console.log('user connected: ', socket.id);
            var name = "익명" + count++;
            socket.name = name;
            // 서버가 해당 socket id에만 이벤트를 전달
            io.to(socket.id).emit('create name', name);
            //모든 사용자에게 접속알림
            io.emit('new_connect', name);

            //접속 종료
            socket.on('disconnect', function()
            {
                console.log('user disconnected: ' + socket.id + ' ' + socket.name);
                //모든 사용자에게 접속종료 알림
                io.emit('new_disconnect', socket.name);
            });

            //메시지 전송
            socket.on('send message', function(name, text)
            {
                var msg = name + ' : ' + text;                
                if(name != socket.name)
                {
                    //바뀌기전 닉네임, 바뀐 후 닉네임 전송
                    io.emit('change name', socket.name, name);
                }
                socket.name = name;
                console.log(msg);
                io.emit('receive message', msg);
            });
        })
        next();
    };
    return resultFunction;
}
module.exports = socketio;