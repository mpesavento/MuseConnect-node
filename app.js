const express = require('express');
const WebSocket = require('ws');
const osc = require('osc');
const path = require('path');

// set the OSC write port
const OSC_PORT = 3030;
const OSC_CLIENT_IP = "127.0.0.1";

// Create an Express application
const app = express();

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Start the Express server
const server = app.listen(3333, () => {
  console.log('Express server started on port 3333');
});

// Create a WebSocket server
const wss = new WebSocket.Server({ server });

// Create an OSC UDP Port
const udpPort = new osc.UDPPort({
  // no local address/port because we aren't receiving OSC
  remoteAddress: OSC_CLIENT_IP,
  remotePort: OSC_PORT
});

// Open the OSC UDP Port
udpPort.open();

// When a WebSocket connection is established
wss.on('connection', (ws) => {
  console.log('WebSocket connection established');

  // When a message is received from the WebSocket
  ws.on('message', (message) => {
    const oscPacket = osc.readPacket(message, {
      metadata: true
    });
    udpPort.send(oscPacket);
  });

  // When the WebSocket connection is closed
  ws.on('close', () => {
    console.log('WebSocket connection closed');
  });

  // When an error occurs with the WebSocket
  ws.on('error', (error) => {
    console.error('WebSocket error: ' + error);
  });
});
