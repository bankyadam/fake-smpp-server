'use strict';

const smpp = require('smpp');
const logger = require('./logger');

const port = process.env.PORT || 3456;
const host = process.env.HOST || 'localhost';

const session = smpp.connect(`smpp://${host}:${port}`);

session
  .on('bind_transceiver_resp', function(pdu) {
    if (pdu.command_status == 0) {
      session.submit_sm({
        destination_addr: '441234567890',
        short_message: 'Hello!'
      });
    }
  })
  .on('pdu', logger.getLoggerFor('pdu'))
  .on('connect', logger.getLoggerFor('connect'))
  .on('secureConnect', logger.getLoggerFor('secureConnect'))
  .on('close', logger.getLoggerFor('close'))
  .on('unknown', logger.getErrorLoggerFor('unknown'))
  .on('error', logger.getErrorLoggerFor('error'));


session.bind_transceiver({
  system_id: 'YOUR_SYSTEM_ID',
  password: 'YOUR_PASSWORD'
});
