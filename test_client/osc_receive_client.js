const osc = require('osc');

// Create an osc.js UDP Port listening on port 3000.
const udpPort = new osc.UDPPort({
    localAddress: "0.0.0.0",
    localPort: 3000
});

// Listen for the "ready" event that will be emitted when the UDP port is ready.
udpPort.on("ready", function () {
    console.log("Listening for OSC over UDP on port 3000");
});

// Listen for incoming OSC messages.
udpPort.on("message", function (oscMsg) {
    console.log("An OSC message just arrived!", oscMsg);
});

// Open the socket.
udpPort.open();
