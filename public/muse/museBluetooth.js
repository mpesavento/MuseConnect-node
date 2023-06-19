//bluetooth class 
let bluetoothConnection;

//ID for muse devices
const MUSE_SERVICE = 0xfe8d

//channel to send commands to muse
let controlChar;
const MUSE_CONTROL_ID = '273e0001-4c4d-454d-96be-f03bac821358';

// sensor contact impedence
// TODO: find these codes!!!

//eeg sensors
const MUSE_LEFT_EAR_ID = '273e0003-4c4d-454d-96be-f03bac821358';
const MUSE_LEFT_FOREHEAD_ID = '273e0004-4c4d-454d-96be-f03bac821358';
const MUSE_RIGHT_FOREHEAD_ID = '273e0005-4c4d-454d-96be-f03bac821358';
const MUSE_RIGHT_EAR_ID = '273e0006-4c4d-454d-96be-f03bac821358';

//battery
const MUSE_BATTERY_ID = '273e000b-4c4d-454d-96be-f03bac821358';

//other sensors
const MUSE_GYROSCOPE_ID = '273e0009-4c4d-454d-96be-f03bac821358';
const MUSE_ACCELEROMETER_ID = '273e000a-4c4d-454d-96be-f03bac821358';
const MUSE_PPG_ID = '273e0010-4c4d-454d-96be-f03bac821358';

function connectToMuse() {

    //connection options, use MUSE id to search for nearby muse devices
    let connectionOptions = { filters: [{ services: [MUSE_SERVICE] }] };

    //ask bluetooth to connect
    bluetoothConnection.connect(connectionOptions, museConnected);
}

//connected listener
async function initMuseStreaming(characteristics) {

    console.log("Connected to Muse");
    let controlActive = false;

    //go through each characteristic and add listeners
    for (let i = 0; i < characteristics.length; i++) {

        //get characteristic
        let characteristic = characteristics[i];

        //search by UUID 
        switch (characteristic.uuid) {

            case MUSE_CONTROL_ID:

                //control is how to send message to the Muse, like 'start' and 'stop'
                controlChar = characteristic;
                controlActive = true; //ok to proceed with streaming
                break;

            //the EEG sensors
            case MUSE_LEFT_EAR_ID:
                bluetoothConnection.startNotifications(characteristic, didReceiveEegLeftEar);
                break;

            case MUSE_LEFT_FOREHEAD_ID:
                bluetoothConnection.startNotifications(characteristic, didReceiveEegLeftForehead);
                break;

            case MUSE_RIGHT_EAR_ID:
                bluetoothConnection.startNotifications(characteristic, didReceiveEegRightEar);
                break;

            case MUSE_RIGHT_FOREHEAD_ID:
                bluetoothConnection.startNotifications(characteristic, didReceiveEegRightForehead);
                break;

            case MUSE_PPG_ID:
                bluetoothConnection.startNotifications(characteristic, didReceivePpg);
                break;

            case MUSE_ACCELEROMETER_ID:
                bluetoothConnection.startNotifications(characteristic, didReceiveAccel);
                break;

            case MUSE_GYROSCOPE_ID:
                bluetoothConnection.startNotifications(characteristic, didReceiveGyro);
                break;

            case MUSE_BATTERY_ID:
                bluetoothConnection.startNotifications(characteristic, didReceiveBattery);
                break;

            default:
                //console.log("Unused characteristic:", characteristic)
                break;
        }
    }
    return controlActive;
}

async function startMuse() {

    //to stream data, send this sequence to headset
    //halt (a pause command)
    //connection type (PPG or no PPG)
    //start command
    //resume command
    //this sequence, in a row, starts the headset's streaming data

    if (controlChar) {
  
      await bluetoothConnection.sendCommand(controlChar, 'h'); //halt
  
      if (usePPG) {
        //use ppg, Muse 2
        await bluetoothConnection.sendCommand(controlChar, 'p50');
  
      } else {
        //no ppg, Muse 1
        await bluetoothConnection.sendCommand(controlChar, 'p21');
      }
  
      await bluetoothConnection.sendCommand(controlChar, 's'); //start
      await bluetoothConnection.sendCommand(controlChar, 'd'); //resume
    }
  }