'use strict';

const crypto = require('crypto');
const _ = require('lodash');
const smpp = require('smpp');
const logger = require('./logger');

const PORT = process.env.PORT || 3456;
const HOST = process.env.HOST || 'localhost';
const SYSTEM_TYPE = process.env.SYSTEM_TYPE || 'dummy';
const DELIVERY_REPORT_DELAY = parseInt(process.env.DELIVERY_REPORT_DELAY) || 3000;

smpp.createServer()
  .listen(PORT, HOST, function() {
    console.log(`Server started at ${HOST}:${PORT}...`);
  })
  .on('session', createSessionHandler);


function createSessionHandler(session) {
  return session
    .on('pdu', function(pdu) {
      _.partial(console.log, 'pdu')(pdu);

      switch (pdu.command) {
        case 'bind_transceiver':
          session.send(pdu.response());
          break;

        case 'submit_sm':
          const messageId = getMessageId();
          session.send(pdu.response({ message_id: messageId }));
          setTimeout(sendDeliveryReport, DELIVERY_REPORT_DELAY, session, messageId, pdu);
          break;

        default:
      }
    })
    .on('connect', logger.getLoggerFor('connect'))
    .on('secureConnect', logger.getLoggerFor('secureConnect'))
    .on('close', logger.getLoggerFor('close'))
    .on('unknown', logger.getErrorLoggerFor('unknown'))
    .on('error', logger.getErrorLoggerFor('error'));
}


function sendDeliveryReport(session, messageId, pdu) {
  const date = getDateNow();

  session.deliver_sm({
    service_type: SYSTEM_TYPE,
    source_addr_ton: 1,
    source_addr_npi: 1,
    source_addr: pdu.destination_addr,
    short_message: `id:${messageId} sub:000 dlvrd:000 submit date:${date} done date:${date} stat:delivrd err:000`,
    esm_class: 4
  });
}


function getDateNow() {
  return (new Date()).toISOString().replace(/\d{2}(\d{2})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):\d+\.\d+Z/, '$1$2$3$4$5');
}


function getMessageId() {
  return crypto.randomBytes(14).toString('hex');
}
