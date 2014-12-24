var EventEmitter = require('eventemitter2').EventEmitter2;
var observer = new EventEmitter({

      //
      // use wildcards.
      //
      wildcard: true,

      //
      // the delimiter used to segment namespaces, defaults to `.`.
      //
      // delimiter: '::', 

      //
      // if you want to emit the newListener event set to true.
      //
      newListener: false, 

      //
      // max listeners that can be assigned to an event, default 10.
      //
      maxListeners: 1000
    });
module.exports = observer;