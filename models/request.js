const querystring = require('querystring');

module.exports.getdata = (req) => {
  return new Promise(function(resolve, reject){
    var data = [];
    req.on('data', function(chunk){ //data metamorphosing...
      data += chunk;
    })
    req.on('end', function(){ //data metamorphosing completed
      resolve(data);
    });
    req.on('error', function(err){
      reject(err);
    });
  });
};

