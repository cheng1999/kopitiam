const escpos = require('escpos'),
      dbop = require(appROOT+'/models/dboperator.js');

//const device  = new escpos.USB(0x0416, 0x5011);
const device  = new escpos.Network('localhost');
// const device  = new escpos.Serial('/dev/usb/lp0');
const printer = new escpos.Printer(device);
//var config = require(appROOT+'/config.js');
var config = {};
//config=config.printers;
/*
device.open(function(err){
  printer
  .font('a')
  .align('ct')
  .style('bu')
  .size(1, 1)
  .text('The quick brown fox jumps over the lazy dog')
  .text('敏捷的棕色狐狸跳过懒狗')
  .barcode('1234567', 'EAN8')
  .qrimage('https://github.com/song940/node-escpos', function(err){
    this.cut();
    this.close();
  });

});
*/
var makehearder = (printer)=>{
  printer
  .font('a')
  .align('ct')
  .size(2,2)
  .text('LIAN KIEW CAFE')
  .size(1,1)
  .align('rt')
  .text(new Date().toLocaleString());

};

var printout = (printername)=>{
  return new Promise((resolve, reject)=>{
    //PDs is initialized printers list 
    PDs[printername].device.open( (error)=>{
      try{
        if(error) reject(error);
        PDs[printername].printer.cut().reconnect();
        //delete PDs[printername].device;
        //delete PDs[printername].printer;
        //PDs[printername].device = new escpos.Network(printerdata.ip, printerdata.port) ,
        //PDs[printername].printer = new escpos.Printer(PDs[printerdata.name].device);
        makehearder(PDs[printername].printer);
        resolve('ok');
      }catch(err){ reject(err); }
    });
  });
};

// check repeated items or not, if, delete, then return count of items
/*
var count_remove_same_item = (data, item)=>{
  var count=0;
  for (var c=0; c<data.items.length; c++){
    if(JSON.stringify(data.items[c]) == JSON.stringify(item)){
      //data.splice(c);
      data.items.splice(c,1);
      //delete data.items[c];
      count++;
      c--;
    }
  }
  /*
  data.items.forEach( (itemtocheck,index,object)=>{
    if(JSON.stringify(itemtocheck) == JSON.stringify(item)){
      object.splice(index,1);
      //delete itemtocheck; 
      count++;
    }
  });
  */
  //return count;
//};


// init the printer

//Printers and Devices
var PDs = [];
dbop.autoloadCallback(()=>{
  config.printers = dbop.getInitJson().printers;

  config.printers.forEach( (printerdata)=>{
    //const device  = new escpos.Network('localhost');
    //const printer = new escpos.Printer(device);
    PDs[printerdata.name] = { 
      'device': new escpos.Network(printerdata.ip, printerdata.port) ,
      'printer': null
    };
    PDs[printerdata.name].printer = new escpos.Printer(PDs[printerdata.name].device);
    makehearder(PDs[printerdata.name].printer);
  });
});
// print function
module.exports.print = async (data)=>{
  return new Promise((resolve,reject)=>{
  // printers to use to printing
  // two variables, one for queue, one for totalprice
  var printers_totalprice = [];
  var printers_name = [];
  data.items.forEach( (item)=>{
    var itemclone = JSON.parse(JSON.stringify(item));
    //var printername = dbop.items.find({'$loki':item.id}).printer;
    //var printername = dbop.db.getCollection('item').find({'$loki':item.id}).printer;
    var printername = dbop.getPrinter(item.id);
    if (!printers_totalprice[printername]){
      PDs[printername].printer
        .align('lt')
        .print('table number: ')
        .size(2,2)
        .text(data.tablenumber)
        //.size(2,1);
        //我妈妈店的工人有老花，所以size2,2吧
        .size(2,2);
      printers_totalprice[printername] = { 
        'totalprice': 0 
      };
      printers_name.push(printername);
    }
    var extra_items = [];
    itemclone.extra.forEach( (extraitem)=>{
      extra_items.push(extraitem.text);
    });
    var extratext = "("+extra_items.join()+" / "+itemclone.remarks.join()+")";
    //itemclone.name+
    extratext = (extratext === '( / )' ? null: extratext);
    //var count = count_remove_same_item(data, itemclone);
    var itemprice = itemclone.price*item.count;
    printers_totalprice[printername].totalprice += itemprice;
    PDs[printername].printer.align('lt').text(item.count+" X "+itemclone.name);
    if(extratext)PDs[printername].printer.text(extratext);
    PDs[printername].printer.align('rt').text('RM '+ (itemprice).toFixed(2));
  });

  printers_name.forEach( async (printername)=>{
    PDs[printername].printer
      .size(2,2)
      .println()
      .text('Total: RM ' + printers_totalprice[printername].totalprice.toFixed(2));
    //PDs[printername].device.open( (error)=>{PDs[printername].printer.cut().close()} );
    
    try{
      await printout(printername);
    }catch(err){
      reject(err);
    }
    resolve('ok');
  });
  });
}

