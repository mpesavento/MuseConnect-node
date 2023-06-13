/* 
 *  DSP.js - a comprehensive digital signal processing  library for javascript
 * 
 *  Created by Corban Brook <corbanbrook@gmail.com> on 2010-01-01.
 *  Copyright 2010 Corban Brook. All rights reserved.
 *
 */

/**
 * FFT is a class for calculating the Discrete Fourier Transform of a signal
 * with the Fast Fourier Transform algorithm.
 *
 * @param {Number} bufferSize The size of the sample buffer to be computed. Must be power of 2
 * @param {Number} sampleRate The sampleRate of the buffer (eg. 44100)
 *
 * @constructor
 */
class FFT {

    constructor(bufferSize, sampleRate) {
        
        //save incoming vars
        this.bufferSize = bufferSize;
        this.sampleRate = sampleRate;

        //init and calc vars
        this.rval; 
        this.ival;
        this.mag;
        this.sqrt = Math.sqrt;
        this.bandwidth = 2 / bufferSize * sampleRate / 2;
        this.bSi = 2 / this.bufferSize;
        

        //init arrays that hold the real and imaginary data
        this.spectrum = new Float64Array(bufferSize / 2);
        this.real = new Float64Array(bufferSize);
        this.imag = new Float64Array(bufferSize);

        //peaks 
        this.peakBand = 0;
        this.peak = 0;

        //save length
        this.maxLength = length;
        //fill buffer with zeroes to length
        this._buffer = new Array(length).fill(0);
        
        this.reverseTable = new Uint32Array(bufferSize);

        var limit = 1;
        var bit = bufferSize >> 1;

        var i;

        while (limit < bufferSize) {
            for (i = 0; i < limit; i++) {
                this.reverseTable[i + limit] = this.reverseTable[i] + bit;
            }

            limit = limit << 1;
            bit = bit >> 1;
        }

        this.sinTable = new Float64Array(bufferSize);
        this.cosTable = new Float64Array(bufferSize);

        for (i = 0; i < bufferSize; i++) {
            this.sinTable[i] = Math.sin(-Math.PI / i);
            this.cosTable[i] = Math.cos(-Math.PI / i);
        }
    }

    /**
     * Performs a forward transform on the sample buffer.
     * Converts a time domain signal to frequency domain spectra.
     *
     * @param {Array} buffer The sample buffer. Buffer Length must be power of 2
     *
     * @returns The frequency spectrum array
     */

    //called by code that needs to convert time based data into a frequency spectrum
    forward(buffer) {
        
        // Locally scope variables for speed up
        var bufferSize = this.bufferSize,
            cosTable = this.cosTable,
            sinTable = this.sinTable,
            reverseTable = this.reverseTable,
            real = this.real,
            imag = this.imag,
            spectrum = this.spectrum;

        var k = Math.floor(Math.log(bufferSize) / Math.LN2);
        
        if (Math.pow(2, k) !== bufferSize) { throw "Invalid buffer size, must be a power of 2."; }
        if (bufferSize !== buffer.length) { throw "Supplied buffer is not the same size as defined FFT. FFT Size: " + bufferSize + " Buffer Size: " + buffer.length; }

        var halfSize = 1,
            phaseShiftStepReal,
            phaseShiftStepImag,
            currentPhaseShiftReal,
            currentPhaseShiftImag,
            off,
            tr,
            ti,
            tmpReal,
            i;
     
        for (i = 0; i < bufferSize; i++) {
            real[i] = buffer[reverseTable[i]];
            imag[i] = 0;
        }

        while (halfSize < bufferSize) {
            
            phaseShiftStepReal = cosTable[halfSize];
            phaseShiftStepImag = sinTable[halfSize];

            currentPhaseShiftReal = 1;
            currentPhaseShiftImag = 0;

            for (var fftStep = 0; fftStep < halfSize; fftStep++) {
                i = fftStep;

                while (i < bufferSize) {
                    off = i + halfSize;
                    tr = (currentPhaseShiftReal * real[off]) - (currentPhaseShiftImag * imag[off]);
                    ti = (currentPhaseShiftReal * imag[off]) + (currentPhaseShiftImag * real[off]);

                    real[off] = real[i] - tr;
                    imag[off] = imag[i] - ti;
                    real[i] += tr;
                    imag[i] += ti;

                    i += halfSize << 1;
                }

                tmpReal = currentPhaseShiftReal;
                currentPhaseShiftReal = (tmpReal * phaseShiftStepReal) - (currentPhaseShiftImag * phaseShiftStepImag);
                currentPhaseShiftImag = (tmpReal * phaseShiftStepImag) + (currentPhaseShiftImag * phaseShiftStepReal);
            }

            halfSize = halfSize << 1;
        }

        //update spectrum
        for (var i = 0, N = bufferSize / 2; i < N; i++) {
            this.rval = real[i];
            this.ival = imag[i];
            this.mag = this.bSi * sqrt(this.rval * this.rval + this.ival * this.ival);

            if (this.mag > this.peak) {
                this.peakBand = i;
                this.peak = this.mag;
            }

            spectrum[i] = this.mag;
        }
        
        //console.log("fft spec", spectrum);
        return spectrum;
    }
}
