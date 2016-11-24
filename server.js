'use strict';

const _ = require('lodash');
const smpp = require('smpp');
const logger = require('./logger');

const port = process.env.PORT || 3456;
const host = process.env.HOST || 'localhost';
const SYSTEM_TYPE = process.env.SYSTEM_TYPE || 'dummy';

smpp.createServer()
  .listen(port, host, function() {
    console.log(`Server started at ${host}:${port}...`);
  })
  .on('session', function(session) {
    createSessionHandler(session);
  });


function createSessionHandler(session) {
  return session
    .on('pdu', function(pdu) {
      _.partial(console.log, 'pdu')(pdu);

      switch (pdu.command) {
        case 'bind_transceiver':
          session.send(pdu.response());
          return;

        case 'submit_sm':
          session.send(pdu.response({ message_id: 'this is the ID' }));

          setTimeout(function() {
            session.deliver_sm({
              service_type: SYSTEM_TYPE,
              source_addr_ton: 1,
              source_addr_npi: 1,
              source_addr: pdu.destination_addr,
              short_message: 'DELIVRD'
            });
          }, 3000);
          return;
      }
    })
    .on('connect', logger.getLoggerFor('connect'))
    .on('secureConnect', logger.getLoggerFor('secureConnect'))
    .on('close', logger.getLoggerFor('close'))
    .on('unknown', logger.getErrorLoggerFor('unknown'))
    .on('error', logger.getErrorLoggerFor('error'));
}
