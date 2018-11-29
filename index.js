global.appROOT = __dirname;

const http = require('http');
    routes = require('./routes.js');

http.createServer(routes).listen(8080);
console.log('Server is running...');

