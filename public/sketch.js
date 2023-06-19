// P5 entry point and main loop

let socket;
let socket_uri = `ws://localhost:3333`; // port must match the port the app is listening on
let oscPort;  // for the OSC WebSocketPort
let socketIsConnected = false;

let prevEegData = {};
let prevPpgData = {};

function setupSocket() {
  socket = new WebSocket('ws://localhost:3333');

  socket.onopen = () => {
    console.log("WebSocket connection opened.");
    socketIsConnected = true;
    oscPort = new osc.WebSocketPort({
      socket: socket
    });
    oscPort.open();
  };

  socket.onclose = (event) => {
    if (event.wasClean) {
      console.log(`WebSocket connection closed cleanly, code=${event.code} reason=${event.reason}`);
    } else {
      console.log('WebSocket connection died'); // for example, server process killed or network down
      museIsConnected = false;
      setTimeout(setupSocket, 5000); // Try to reconnect every 5 seconds
    }
  };

  socket.onerror = (error) => {
    console.log(`WebSocket error: ${error}`);
  };
}

function setup() {

  createCanvas(400, 400);

  setupMuse();
  setupSocket();

}

function draw() {

  background(200);

  // EEG chart
  beginShape();
  strokeWeight(1);
  noFill();
  stroke(255, 255, 255);

  for (let i = 1; i <= (eegSpectrum.length/2); i++) {
   let x = map(i, 0, eegSpectrum.length/2, 0, width);
   let y = map(eegSpectrum[i], 0, 50, height, 0);
   vertex(x, y); //<-- draw a line graph
  }
  endShape();

  // battery display
  noStroke();
  fill(0,0,0);
  textSize(10);
  text('BATTERY: ' + Math.floor(batteryLevel), width-80, 10);
  
  // EEG values display
  textSize(12);
  text('DELTA: ' + eeg.delta, 10, 30);
  text('THETA: ' + eeg.theta, 10, 45);
  text('ALPHA: ' + eeg.alpha, 10, 60);
  text('BETA:  ' + eeg.beta,  10, 75);
  text('GAMMA: ' + eeg.gamma, 10, 90);

  // PPG heartrate display
  if (ppg.heartbeat) {
    text('HEART bpm: ' + ppg.bpm + ' •', 10, 120);
  } else {
    text('HEART bpm: ' + ppg.bpm, 10, 120);
  }

  // IMU display
  text('ACCEL X: ' + accel.x, 10, 150);
  text('ACCEL Y: ' + accel.y, 10, 165);
  text('ACCEL Z: ' + accel.z, 10, 180);

  text('GYRO X: ' + gyro.x, 10, 210);
  text('GYRO Y: ' + gyro.y, 10, 225);
  text('GYRO Z: ' + gyro.z, 10, 240);

  // after signal processing and UI updates, send OSC messages
  // if (socket.readyState === WebSocket.OPEN && socketIsConnected) {
  if (socketIsConnected) {
    sendOSCMessages(eeg, '/muse/eeg/');
    sendOSCMessages(ppg, '/muse/ppg/');
  }
}


function sendOSCMessages(data, prefix) {
  // Choose the correct cache based on the prefix
  let prevData = prefix === '/muse/eeg/' ? prevEegData : prevPpgData;

  Object.entries(data).forEach(([key, value]) => {
    // don't write out the ppg/buffer
    if (key === 'buffer') {
      return;
    }

    // Check if value has changed
    if (!prevData[key] || prevData[key] !== value) {
      const address = prefix + key;
      const type = typeof value === 'number' ? (Number.isInteger(value) ? 'i' : 'f') : 's';
      const message = {
        address: address,
        args: [{ type: type, value: value }]
      };
      const binaryData = osc.writeMessage(message);
      if (socket.readyState === WebSocket.OPEN && socketIsConnected) {
        socket.send(binaryData);
      }
      // Update prevData with new value
      prevData[key] = value;
    }
  });
}




