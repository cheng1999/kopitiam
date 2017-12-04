const printer = require('node-thermal-printer'),
      dbop = require(appROOT+'/models/dboperator.js');
      //promisify = require('util').promisify;


var checkPrinter = ()=>{
  return new Promise((resolve,reject)=>{
    printer.isPrinterConnected((isConnected)=>{ 
      if(!isConnected)reject("printer not connected.");
      resolve(isConnected);
    });
  });
}

var printImageBuffer = (buffer)=>{
  return new Promise((resolve,reject)=>{
    printer.printImageBuffer(buffer, (done)=>{
      if(!done)reject();
      resolve(done)
    });
  });
}

var printout = () => {
  return new Promise((resolve,reject)=>{
      printer.execute((err)=>{
        if(err)reject(err);
        resolve();
      });
  });
}


module.exports.print = async (images)=>{
    for(var c=0; c<images.length; c++){
          
      var printer_data = dbop.getPrinter(images[c].printer);

      // connect to printer and init
      printer.init({
        type: 'epson',
        interface: 'tcp://'+printer_data.ip+':'+printer_data.port
      });
      //console.log('tcp://'+printer_data.ip+':'+printer_data.port);

      require('fs').writeFile('p'+c+'.png', Buffer.from(images[c].image, 'base64'), function(err){});
      if(! await checkPrinter()){
        throw new Error("cannot connect to printer");
      }

      //await printImageBuffer( Buffer.from(images[c].image, 'base64') );
      //printer.cut();
      //await printout();

    }
}

