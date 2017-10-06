const fs = require('fs'),
      promisify = require('util').promisify;

module.exports.readfile = async (path)=>{
  var readFile = promisify(fs.readFile);
  return await readFile(path);
};

module.exports.checkfile = (path)=>{
  return fs.existsSync(path);
}

module.exports.print = (data)=>{
  
}
