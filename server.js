const smpp = require('smpp');

const port = process.env.PORT || 3456;
const host = process.env.HOST || 'localhost';

smpp.createServer()
  .listen(port, host, function() {
    console.log(`Server started at ${host}:${port}...`);
  })
  .on('session', function(session) {
    session
      .on('pdu', function(pdu) {
        console.log(pdu);

        switch(pdu.command) {
          case 'bind_transceiver':
            session.send(pdu.response());
            return;

          case 'submit_sm':
            session.send(pdu.response({ message_id: 'this is the ID' }));

            setTimeout(function() {
              session.deliver_sm({
                service_type: 'dummy',
                source_addr_ton: 1,
                source_addr_npi: 1,
                source_addr: '1234567',
                short_message: 'DELIVRD'
              });
            }, 3000);
            return;
        }
      })
      .on('connect', console.log)
      .on('secureConnect', console.log)
      .on('close', console.log)
      .on('unknown', console.error)
      .on('error', console.error);
  });
