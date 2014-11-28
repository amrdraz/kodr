var EventEmitter = require('events').EventEmitter;
var observer = new EventEmitter();
observer.setMaxListeners(1000);
module.exports = observer;