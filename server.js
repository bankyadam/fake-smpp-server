'use strict';

const crypto = require('crypto');
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
          const now = new Date();
          const date = formatDate(new Date());
          const messageId = date + crypto.randomBytes(4).toString('hex');

          session.send(pdu.response({ message_id: messageId }));

          setTimeout(() => {
            session.deliver_sm({
              service_type: SYSTEM_TYPE,
              source_addr_ton: 1,
              source_addr_npi: 1,
              source_addr: pdu.destination_addr,
              short_message: `id:${messageId} sub:000 dlvrd:000 submit date:${date} done date:${date} stat:delivrd err:000`,
              esm_class: 4
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

function formatDate(date) {
  const yy = leftpad(date.getFullYear());
  const MM = leftpad(date.getMonth() + 1);
  const dd = leftpad(date.getDate())
  const h = leftpad(date.getHours())
  const i = leftpad(date.getMinutes())
  const s = leftpad(date.getSeconds())

  return `${yy}${MM}${dd}${h}${i}${s}`;
}

function leftpad(i) {
  return ('0' + i).slice(-2);
}
