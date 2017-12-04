const querystring = require('querystring');

module.exports.getdata = (req) => {
  return new Promise((resolve, reject)=>{
    var data = [];
    req.on('data', (chunk)=>{ //data metamorphosing...
      data += chunk;
    })
    req.on('end', ()=>{ //data metamorphosing completed
      resolve(data);
    });
    req.on('error', (err)=>{
      reject(err);
    });
  });
};

