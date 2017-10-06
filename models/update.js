
var util  = require('util'),
    spawn = require('child_process').spawn;
                                          // options
module.exports.update = ()=>{
  return new Promise((resolve, reject)=>{
    var update = spawn('sh', ['update.sh']); // the second arg is the command 

    update.stdout.on('data', function (data) {    // register one or more handlers
      console.log('stdout: ' + data);
    });
    
    update.stderr.on('data', function (data) {
      console.log('stderr: ' + data);
      reject(data);
    });

    update.on('exit', function (code) {
      resolve();
      process.exit();
    });
  });
};
