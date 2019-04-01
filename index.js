global.appROOT = __dirname;
global.appVERSION = '0.7';
const http = require('http'),
    https = require('https'),
    fs = require('fs'),
    os = require('os'),
    routes = require('./routes.js');

http.createServer(routes).listen(8080);

https.createServer({
  key: fs.readFileSync('./cacert/server-key.pem'),
  ca: [fs.readFileSync('./cacert/ca-cert.pem')],
  cert: fs.readFileSync('./cacert/server-cert.pem')
}, routes).listen(8081)


// show server's ip
// referrence: https://stackoverflow.com/a/8440736
var ifaces = os.networkInterfaces();
Object.keys(ifaces).forEach(function (ifname) {
  var alias = 0;
  ifaces[ifname].forEach(function (iface) {
      // skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
    if ('IPv4' !== iface.family || iface.internal !== false)  return;
    if (alias >= 1) {
      // this single interface has multiple ipv4 addresses
      console.log(ifname + ':' + alias, iface.address);
    } else {
      // this interface has only one ipv4 adress
      console.log(ifname, iface.address);
    }
    ++alias;
  });
});



console.log('Server is running...');

