//parsing methods
//https://github.com/urish/muse-js/blob/4e864578c55dd7e26d85b429863f47ccabac54a0/src/lib/muse-parse.ts

//streaming listeners   
function didReceiveEegLeftEar(data) {
    processEEG(0, data);
}

function didReceiveEegLeftForehead(data) {
    processEEG(1, data);
}

function didReceiveEegRightEar(data) {
    processEEG(2, data);
}

function didReceiveEegRightForehead(data) {
    processEEG(3, data);
}

function didReceivePpg(data) {
    processPPG(data); 
}

function didReceiveAccel(data) {

    //parse the samples with multiplier
    let _samples = parseImuReading(data, 0.0000610352).samples;

    //average out the samples
    accel.x = (_samples[0].x + _samples[1].x + _samples[2].x) / 3;
    accel.y = (_samples[0].y + _samples[1].y + _samples[2].y) / 3;
    accel.z = (_samples[0].z + _samples[1].z + _samples[2].z) / 3;
    //console.log("Accel:", accel);
}

function didReceiveGyro(data) {

    //parse the samples with multiplier
    let _samples = parseImuReading(data, 0.0074768).samples;

    //average out the samples
    gyro.x = (_samples[0].x + _samples[1].x + _samples[2].x) / 3;
    gyro.y = (_samples[0].y + _samples[1].y + _samples[2].y) / 3;
    gyro.z = (_samples[0].z + _samples[1].z + _samples[2].z) / 3;
    //console.log("Gyro:", gyro);
}

function didReceiveBattery(data) {
    batteryLevel = data.getUint16(2) / 512;
    console.log("Battery level:", batteryLevel, "%");
}
