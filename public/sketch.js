// P5 entry point and main loop

let socket;
let oscPort;
let OSC_PORT = 3333;
let oscsocket_uri = "ws://localhost:3333";
let isOscPortOpen = false;

// for change detection
let lastSentPpg = null;
let lastSentEeg = {
    delta: null,
    theta: null,
    alpha: null,
    beta: null,
    gamma: null
};


function setup() {

  createCanvas(400, 400);

  setupMuse();

  // Initialize the WebSocket connection to the osc-web bridge
  socket = new WebSocket(oscsocket_uri);
  console.log("OSC sending from " + oscsocket_uri)

  socket.onopen = function() {
      oscPort = new osc.WebSocketPort({
          socket: socket
      });
      isOscPortOpen = true;
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

  // send OSC outputs
  text('OSC sending on: ' + oscsocket_uri, 10, height-20);
  sendOSCMessages()

}


function sendOSCMessages() {
  // Once a sensor value has been updated, check if it has changed since the last sent value
  if (isOscPortOpen) {
    if (ppg.heartbeat) {
      // TODO: add a flipflop on this to turn it off if we've received it once already
      oscPort.send({
        address: "/muse/ppg/heartbeat",
        args: [{
          type: "i",
          value: 1
        }]
      });
    }
    
    if (ppg.bpm !== lastSentPpg) {
      oscPort.send({
          address: "/muse/ppg/bpm",
          args: [{
            type: "f",
            value: ppg.bpm
          }]
      });
      lastSentPpg = ppg.bpm;  // update last sent value
    }

    if (eeg.delta !== lastSentEeg.delta) {
      oscPort.send({
          address: "/muse/eeg/delta",
          args: [{
            type: "f",
            value: eeg.delta
          }]
      });
      lastSentEeg.delta = eeg.delta;  // update last sent value
    }
    if (eeg.theta !== lastSentEeg.theta) {
      oscPort.send({
          address: "/muse/eeg/theta",
          args: [{
            type: "f",
            value: eeg.theta
          }]
      });
      lastSentEeg.theta = eeg.theta;  // update last sent value
    }
    if (eeg.alpha !== lastSentEeg.alpha) {
      oscPort.send({
          address: "/muse/eeg/alpha",
          args: [{
            type: "f",
            value: eeg.alpha
          }]
      });
      lastSentEeg.alpha = eeg.alpha;  // update last sent value
    }
    if (eeg.beta !== lastSentEeg.beta) {
      oscPort.send({
          address: "/muse/eeg/beta",
          args: [{
            type: "f",
            value: eeg.beta
          }]
      });
      lastSentEeg.beta = eeg.beta;  // update last sent value
    }
    if (eeg.gamma !== lastSentEeg.gamma) {
      oscPort.send({
          address: "/muse/eeg/gamma",
          args: [{
            type: "f",
            value: eeg.gamma
          }]
      });
      lastSentEeg.gamma = eeg.gamma;  // update last sent value
    }
    
  }
}