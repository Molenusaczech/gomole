const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', function connection(ws) {
    console.log("Client Connected");
    ws.on('message', function (message) {
        message = message+"";
        console.log('received: %s', message);
        wss.broadcast(message);

    }
    );
    //ws.send('something');
});

wss.broadcast = function broadcast(msg) {
    wss.clients.forEach(function each(client) {
        client.send(msg);
    });
};