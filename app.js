const express = require('express');
const app = express();
const server = require('http').createServer(app);
const osc = require('osc');

// Create an Express static file server that points to your p5.js sketch directory
app.use(express.static('public'));

// Define the WebSocket port
const oscWebSocket = new osc.WebSocketPort({
    server: server,
    metadata: true
});

// oscWebSocket.on("ready", onSocketOpen);
// oscWebSocket.on("message", onSocketMessage);
// oscWebSocket.open();

// // Print out the OSC address and arguments from received messages
// oscWebSocket.on("message", function (oscMsg) {
//     console.log("An OSC message just arrived!", oscMsg);
// });

// Choose a suitable port
const port = process.env.PORT || 3333;

// Start the server
server.listen(port, () => console.log(`Server listening at http://localhost:${port}`));
