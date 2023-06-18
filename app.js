const express = require('express');
const expressWs = require('express-ws');

// Create an Express static file server that points to your p5.js sketch directory
const app = express();
app.use(express.static('public'));
expressWs(app);  // Apply express-ws to our express instance.

app.ws('/ws', (ws, req) => {
    ws.on('message', (msg) => {
        // Parse incoming data and forward as OSC messages
        const data = JSON.parse(msg);
        if (data.eeg) sendOSCMessages(data.eeg, null);
        if (data.ppg) sendOSCMessages(null, data.ppg);
    });
});

// Choose a suitable port
const port = process.env.PORT || 3333;

// Start the server
app.listen(port, () => console.log(`Web server listening at http://localhost:${port}`));
