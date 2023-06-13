let ppgBuffer = new MuseDataBuffer(64);
let heartbeatTimestamps = []
let BEAT_DETECTION_THRESHOLD = 0.9982 //0.998
let BPM_SAMPLES_MAX = 10

function processPPG(data) {

    //process data buffer into samples and save
    let ppgSamples = decodeUnsigned24BitData(new Uint8Array(data.buffer).subarray(2));

    //add decoded samples to the buffer
    ppg.buffer = ppgBuffer.update(ppgSamples);

    //calc the high value of the buffer
    let ppgMax = Math.max(...ppg.buffer);

    //grab most recent value in ppg array
    ppg.amplitude = ppg.buffer[ppg.buffer.length - 1];

    //what percentage is it of the max?
    let ppgPercent = ppg.amplitude / ppgMax;
    //console.log("ppg pct", ppgPercent);

    //if recent value is near the max value, it's a heartbeat
    if (ppgPercent > BEAT_DETECTION_THRESHOLD) { //threshold for a beat detection

        //if previously false...
        if (ppg.heartbeat == false) {

            //record the timestamp of this heartbeat
            heartbeatTimestamps.push(new Date().getTime());

            //keep timestamps array from growing too long
            if (heartbeatTimestamps.length > BPM_SAMPLES_MAX) { 
                let diff = heartbeatTimestamps.length - BPM_SAMPLES_MAX;
                heartbeatTimestamps.splice(0, diff); 
            }

            let durationsBetweenBeats = []

            //if there are enough samples...
            if (heartbeatTimestamps.length > 1) {

                //loop through each timestamp
                for (var i = heartbeatTimestamps.length-1; i > 1; i--) {

                    //get this and the next timestamp
                    let currTimestamp = heartbeatTimestamps[i];
                    let prevTimestamp = heartbeatTimestamps[i - 1];
                
                    //calculate time between beats and save it
                    let durationBetweenBeats = currTimestamp - prevTimestamp;
                    durationsBetweenBeats.push(durationBetweenBeats);
                }

                //calc durations between the beats
                let durationsTotal = 0;
                for (var i = 0; i < durationsBetweenBeats.length; i++) {

                    //add up the durations
                    durationsTotal += durationsBetweenBeats[i];
                }
                //calc average in milliseconds
                let durationAverage = durationsTotal / durationsBetweenBeats.length;
                
                //bpm = 60000 / ms duration of quarter note
                ppg.bpm = Math.round(60000 / durationAverage);
        
            }
        }

        //when heart beat is occurring
        ppg.heartbeat = true;

    } else {
        //else off
        ppg.heartbeat = false;
    }
}
