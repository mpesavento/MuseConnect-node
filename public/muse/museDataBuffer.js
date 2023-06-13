class MuseDataBuffer {

    constructor(length) {
        //save length
        this.maxLength = length;
        //fill buffer with zeroes to length
        this._buffer = new Array(length).fill(0);
    }
  
    //take a sample set and add to the buffer
    update(withSamples){
        
        //add samples to the existing buffer
        this._buffer = [...this._buffer, ...withSamples];
        
        //keep the buffer the right size
        if (this._buffer.length > this.maxLength) { 
            let diff = this._buffer.length - this.maxLength;
            this._buffer.splice(0, diff); 
        }

        //return updated buffer
        return this._buffer;
    }

    getLength(){
        return this._buffer.length;
    }
}
