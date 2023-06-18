// P5 entry point and main loop

let socket;
let socket_uri = `ws://localhost:3333/ws`; // port must match the port the app is listening on
let oscPort;  // for the OSC WebSocketPort

let prevEegData = {};
let prevPpgData = {};

function setup() {

  createCanvas(400, 400);

  setupMuse();

  // Initialize the WebSocket connection to the osc-web bridge
  socket = new WebSocket(socket_uri);
  console.log("web socket listening on " + socket_uri)

  socket.onopen = function() {
    oscPort = new osc.WebSocketPort({
      socket: socket
    });
    oscPort.open();
  };
  socket.onclose = (event) => {
    if (event.wasClean) {
      console.log(`WebSocket connection closed cleanly, code=${event.code} reason=${event.reason}`);
    } else {
      console.log('WebSocket connection died, attempting restart'); // for example, server process killed or network down
      oscPort = new osc.WebSocketPort({
        socket: socket
      });
      oscPort.open();
      console.log("Reopened WebSocketPort on " + socket_uri)
    }
  };
  socket.onerror = (error) => {
    console.log(`WebSocket error: ${error}`);
  };

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
  if (socket.readyState === WebSocket.OPEN) {
    sendOSCMessages(eeg, '/muse/eeg/');
    sendOSCMessages(ppg, '/muse/ppg/');
  }
}


function sendOSCMessages(data, prefix) {
  // Choose the correct cache based on the prefix
  let prevData = prefix === '/muse/eeg/' ? prevEegData : prevPpgData;

  Object.entries(data).forEach(([key, value]) => {
    // Check if value has changed
    if (!prevData[key] || prevData[key] !== value) {
      const address = prefix + key;
      const message = {
        address: address,
        args: value
      };
      const binaryData = osc.writeMessage(message);
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(binaryData);
      }
      // Update prevData with new value
      prevData[key] = value;
    }
  });
}
