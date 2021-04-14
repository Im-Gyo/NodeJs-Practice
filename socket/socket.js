const WebSocket = require('ws');

function socket (server)
{
    const wss = new WebSocket.Server({ server });

    wss.on('connection', function(ws, req)
    {
        
    })
}