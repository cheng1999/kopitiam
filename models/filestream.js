const fs = require('fs');
module.exports.readfile = (path)=>{
  return new Promise((resolve, reject)=>{
    fs.readFile(path, (err, data)=>{
      if(err) reject(err); 
      resolve(data);
    });
  });
}

module.exports.checkfile = (path)=>{
  return fs.existsSync(path);
}

module.exports.print = (data)=>{
  
}
