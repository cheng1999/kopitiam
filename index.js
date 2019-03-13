global.appROOT = __dirname;
global.appVERSION = '0.7';

const http = require('http'),
    https = require('https'),
    fs = require('fs'),
    routes = require('./routes.js');

http.createServer(routes).listen(8080);
https.createServer({
  key: fs.readFileSync('./cacert/server-key.pem'),
  ca: [fs.readFileSync('./cacert/ca-cert.pem')],
  cert: fs.readFileSync('./cacert/server-cert.pem')
}, routes).listen(8081)
console.log('Server is running...');

