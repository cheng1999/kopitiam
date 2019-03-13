const querystring = require('querystring');
const https = require('https');

module.exports.getdata = (req) => {
  return new Promise((resolve, reject)=>{
    var data = [];
    req.on('data', (chunk)=>{
      data += chunk;
    })
    req.on('end', ()=>{
      resolve(data);
    });
    req.on('error', (err)=>{
      reject(err);
    });
  });
};

module.exports.getrequest = (url) => {
  //options.port = (options.port !== undefined ? options.port : 433);
  //options.path = (options.path !== undefined ? options.path : '/');
  //options.method = (options.method !== undefined ? options.method : 'GET'); 
  options = {
    'headers': { 'User-Agent': 'Kopitiam' }
  }
  return new Promise((resolve, reject)=>{
    https.get(url, options, (res) => {
      var data = [];
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve(data);
      });
    }).on('error', (e) => {
      console.error(e);
    });
  });
};

//reference to https://stackoverflow.com/a/3409200
module.exports.getcookies = (request) => {
  var list = {},
    rc = request.headers.cookie;

  rc && rc.split(';').forEach(function( cookie ) {
    var parts = cookie.split('=');
    list[parts.shift().trim()] = decodeURI(parts.join('='));
  });

  return list;
}
