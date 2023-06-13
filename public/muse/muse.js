//Muse variables which P5 can access
let batteryLevel = 0;
let gyro = {
  x: 0,
  y: 0,
  z: 0
}
let accel = {
  x: 0,
  y: 0,
  z: 0
}

let ppg = {
  bpm: 0,
  heartbeat:false,
  amplitude: 0,
  buffer: []
}

let eeg = {
  delta: 0,
  theta: 0,
  alpha: 0,
  beta: 0,
  gamma: 0,
  sensors: []
}