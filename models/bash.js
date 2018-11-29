//bug
var promisify = require('util').promisify,
    //child_process = require('child_process');
    spawn = require('child_process').spawn;

module.exports.delaylaunch = ()=>{
  spawn('sh', ['bash/bash.sh', 'delaylaunch'], {stdio: 'inherit'});
  return ;
}

module.exports.update = ()=>{
  return new Promise((resolve, reject)=>{
    var sh = spawn('sh', ['bash/bash.sh', 'update']); //shell

    sh.stdout.on('data', function (data) {
      console.log(data.toString());
    });
    
    //update.stderr.on('data', function (data) {
      //console.log('stderr: ' + data);
      //reject(data);
    //})

    sh.on('exit', function (code) {
      resolve();
    });
  });
};

module.exports.backupdb = ()=>{
  return new Promise((resolve, reject)=>{
    var sh = spawn('sh', ['bash/bash.sh', 'backupdb']); 
    sh.on('exit', function (code) {
      resolve();
    });
  });
};

module.exports.restoredb = ()=>{
  return new Promise((resolve, reject)=>{
    var sh = spawn('sh', ['bash/bash.sh', 'restoredb']); // the second arg is the command 
    sh.on('exit', function (code) {
      resolve();
    });
  });
};

