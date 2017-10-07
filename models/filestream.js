const fs = require('fs'),
      promisify = require('util').promisify;

module.exports.writefile = async(path, data)=>{
  var writeFile = promisify(fs.writeFile);
  await readFile(path, data);
  return;
}

module.exports.readfile = async (path)=>{
  var readFile = promisify(fs.readFile);
  return await readFile(path);
};

//code below reference to:
//https://stackoverflow.com/a/35008327/5617437
//https://nodejs.org/api/fs.html#fs_fs_access_path_mode_callback
//wau ------>>>>>>>   s => new Promise(r=>fs.access(s, fs.F_OK, e => r(!e)))
module.exports.checkfile = (path)=>{
  return new Promise((resolve, reject) => {
    fs.access(path, fs.F_OK, (error) => {
      resolve(!error);
    });
  });
}

module.exports.print = (data)=>{
  
}
