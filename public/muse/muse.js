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

  delta_relative: 0,
  theta_relative: 0,
  alpha_relative: 0,
  beta_relative: 0,
  gamma_relative: 0,

  sensors: []
}

// TODO: recreate the other metrics from web archive:
// https://web.archive.org/web/20181105231756/http://developer.choosemuse.com/tools/available-data#Absolute_Band_Powers

