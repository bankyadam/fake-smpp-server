const smpp = require('smpp');

const port = process.env.PORT || 3456;
const host = process.env.HOST || 'localhost';

const session = smpp.connect(`smpp://${host}:${port}`);

session
  .on('bind_transceiver_resp', function(pdu) {
    if (pdu.command_status == 0) {
      session.submit_sm({
        destination_addr: 'DESTINATION NUMBER',
        short_message: 'Hello!'
      });
    }
  })
  .on('pdu', console.log)
  .on('connect', console.log)
  .on('secureConnect', console.log)
  .on('close', console.log)
  .on('unknown', console.error)
  .on('error', console.error);


session.bind_transceiver({
  system_id: 'YOUR_SYSTEM_ID',
  password: 'YOUR_PASSWORD'
});
