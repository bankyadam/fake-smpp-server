const smpp = require('smpp');

const port = process.env.PORT || 3456;
const host = process.env.HOST || 'localhost';

smpp.createServer()
  .listen(port, host, function() {
    console.log(`Server started at ${host}:${port}...`);
  })
  .on('session', function(session) {
    session
      .on('pdu', console.log)
      .on('connect', console.log)
      .on('secureConnect', console.log)
      .on('close', console.log)
      .on('unknown', console.error)
      .on('error', console.error);
  });
