'use strict';

const _ = require('lodash');

module.exports = {

  getLoggerFor(eventName) {
    return _.partial(console.log, eventName);
  },

  getErrorLoggerFor(eventName) {
    return _.partial(console.error, eventName);
  }

};


