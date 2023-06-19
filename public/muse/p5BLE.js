// Copyright (c) 2018 p5ble
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

//import callCallback from './utils/callcallback';
//import parseData from './utils/parseData';


class p5BLE {
    constructor() {
      this.device = null;
      this.server = null;
      this.service = null;
      this.characteristics = [];
      this.handleNotifications = null;
    }
  
    connect(serviceUuidOrOptions, callback) {
      let options = {};
      let serviceUuid;
  
      if (typeof serviceUuidOrOptions === 'string') {
        serviceUuid = serviceUuidOrOptions.toLowerCase();
        options = {
          filters: [{
            services: [serviceUuid],
          }]
        };
      } else if (typeof serviceUuidOrOptions === 'object' && serviceUuidOrOptions.filters) {
        // Options = {
        //   filters: [{ namePrefix: "name" }, { services: ["2A5A20B9-0000-4B9C-9C69-4975713E0FF2"] }]
        // }
        const servicesArray = serviceUuidOrOptions.filters.find(f => f.services);
        if (servicesArray && servicesArray.services && servicesArray.services[0]) {
          
          serviceUuid = servicesArray.services[0]; //.toLowerCase();
          options.filters = serviceUuidOrOptions.filters.map((f) => {
            if (f.services) { 
              const newF = {};
              newF.services = f.services;
              return newF;
            }
            return f;
          });
        } else {
          console.error('Please pass an option object in this format: options = { filters: [{ services: [serviceUuid] }]} ');
        }
      } else {
        console.error('Please pass in a serviceUuid string or option object, e.g. options = { filters: [{ services: [serviceUuid] }]} ');
      }
  
      console.log('Requesting Bluetooth Device...');
    
      return callCallback(navigator.bluetooth.requestDevice(options)
        .then((device) => {
          this.device = device;
          console.log(`BLE: Device found: ${device.name}`);
          return device.gatt.connect();
        })
        .then((server) => {
          this.server = server;
          console.log('BLE: Getting service...');
          return server.getPrimaryService(serviceUuid);
        })
        .then((service) => {
          this.service = service;
          console.log('BLE: Getting characteristics...');
          return service.getCharacteristics();
        })
        .then((characteristics) => {
          this.characteristics = characteristics;
          console.log('BLE: Characteristics found');
          return characteristics;
        })
        .catch((error) => {
          console.error(`BLE: Error: ${error}`);
        }), callback);
    }
  
    async read(characteristic, dataTypeOrcallback, cb) {
      let callback;
      let dataType;
      if (typeof dataTypeOrcallback === 'function') {
        callback = dataTypeOrcallback;
      } else if (typeof dataTypeOrcallback === 'string') {
        dataType = dataTypeOrcallback;
      }
      if (typeof cb === 'function') {
        callback = cb;
      }
  
      if (!characteristic || !characteristic.uuid) console.error('The characteristic does not exist.');
      const validChar = this.characteristics.find(char => char.uuid === characteristic.uuid);
      if (!validChar) return console.error('The characteristic does not exist.');
  
      return callCallback(characteristic.readValue()
        .then(value => parseData(value, dataType)), callback);
    }

    sendCommand(char, cmd) {

      const encoded = new TextEncoder().encode(`X${cmd}\n`);
      encoded[0] = encoded.length - 1;

      return char.writeValue(encoded); 
    }

    encodeCommand(cmd) {
      const encoded = new TextEncoder().encode(`X${cmd}\n`);
      encoded[0] = encoded.length - 1;
      return encoded;
    }


    write(characteristic, inputValue) {

      if (!characteristic || !characteristic.uuid) console.error('The characteristic does not exist.');
      const validChar = this.characteristics.find(char => char.uuid === characteristic.uuid);
      if (!validChar) return console.error('The characteristic does not exist.');
  
      let bufferToSend;
      if (typeof inputValue === 'string') {
        const encoder = new TextEncoder('utf-8');
        bufferToSend = encoder.encode(inputValue);
      } else bufferToSend = Uint8Array.of(inputValue);
      console.log(`Writing ${inputValue} to Characteristic...`);
      console.log('Returning', bufferToSend);
      return characteristic.writeValue(bufferToSend);
    }
  
    async startNotifications(characteristic, handleNotifications, dataType) {
      if (!characteristic || !characteristic.uuid) console.error('The characteristic does not exist.');
      const validChar = this.characteristics.find(char => char.uuid === characteristic.uuid);
      if (!validChar) return console.error('The characteristic does not exist.');
  
      await characteristic.startNotifications();
  
      //console.log('> Notifications started');
  
      //this runs with each update refresh from device
      this.handleNotifications = (event) => {
        // const { value } = event.target;
        // const parsedData = parseData(value, dataType);
        // handleNotifications(parsedData);
        handleNotifications(event.target.value);
      };
  
      return characteristic.addEventListener('characteristicvaluechanged', this.handleNotifications);
    }
  
    async stopNotifications(characteristic) {
      if (!characteristic || !characteristic.uuid) console.error('The characteristic does not exist.');
      const validChar = this.characteristics.find(char => char.uuid === characteristic.uuid);
      if (!validChar) return console.error('The characteristic does not exist.');
  
      try {
        await characteristic.stopNotifications();
  
        if (this.handleNotifications) {
          console.log('> Notifications stopped');
          return characteristic.removeEventListener('characteristicvaluechanged', this.handleNotifications);
        }
        return console.log('> Notifications stopped');
      } catch (error) {
        return console.error(`Error: ${error}`);
      }
    }
  
    disconnect() {
      if (!this.device) return;
      console.log('Disconnecting from Bluetooth Device...');
      if (this.device.gatt.connected) {
        this.device.gatt.disconnect();
      } else {
        console.log('> Bluetooth Device is already disconnected');
      }
    }
  
    onDisconnected(handleDisconnected) {
      if (!this.device) return console.error('There is no device connected.');
      return this.device.addEventListener('gattserverdisconnected', handleDisconnected);
    }
  
    museIsConnected() {
      if (!this.device) return false;
      if (this.device.gatt.connected) {
        return true;
      }
      return false;
    }
  }
  
  //module.exports = p5ble;
  
  //callcallback.js
  function callCallback(promise, callback) {
    if (callback) {
      promise
        .then((result) => {
          callback(undefined, result);
          return result;
        })
        .catch((error) => {
          callback(error);
          return error;
        });
    }
    return promise;
  }
  
  //parseData.js
  function parseData(data, t, encoding) {
    const type = t ? t.toLowerCase() : 'unit8';
    let result;
    let decoder;
    switch (type) {
      case 'unit8':
        result = data.getUint8(0);
        break;
  
      case 'uint16':
        result = data.getUint16(0);
        break;
  
      case 'uint32':
        result = data.getUint32(0);
        break;
  
      case 'int8':
        result = data.getInt8(0);
        break;
  
      case 'int16':
        result = data.getInt16(0);
        break;
  
      case 'int32':
        result = data.getInt32(0);
        break;
  
      case 'float32':
        result = data.getFloat32(0, true); // littleEndian
        break;
  
      case 'float32-bigEndian':
        result = data.getFloat32(0); // BigEndian
        break;
  
      case 'float64':
        result = data.getFloat64(0, true); // littleEndian
        break;
  
      case 'float64-bigEndian':
        result = data.getFloat64(0); // BigEndian
        break;
  
      case 'string':
        // TODO: have the ability to choose different string encoding: like utf16
        decoder = new TextDecoder(encoding || 'utf8');
        result = decoder.decode(data);
        break;
  
      case 'custom':
        // let the user do the parsing
        result = data;
        break;
  
      default:
        result = data.getUint8(0);
        break;
    }
    return result;
  }
  
  /*
  export async function observableCharacteristic(characteristic: BluetoothRemoteGATTCharacteristic) {
    await characteristic.startNotifications();
    const disconnected = fromEvent(characteristic.service!.device, 'gattserverdisconnected');
    return fromEvent(characteristic, 'characteristicvaluechanged').pipe(
        takeUntil(disconnected),
        map((event: Event) => (event.target as BluetoothRemoteGATTCharacteristic).value as DataView),
    );
}*/
