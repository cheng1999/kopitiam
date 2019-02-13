const dbop = require('./models/dboperator.js'),
      request = require('./models/request.js'),
      filestream = require('./models/filestream.js'),
      printer = require('./models/printer'),
      bash = require('./models/bash.js'),
      uploadfile = require('./models/uploadfile.js');

const ctxtype={
  html:{"Content-Type": "text/html"},
  json:{'Content-Type': 'application/json'}
};
var queuenumber = {
  day: new Date().getDate(),
  number: 0
};

dbop.init();

module.exports = async (req,res)=>{
  try {
    await routing(req,res);
  }catch(err){
    res.writeHead(500,ctxtype.html);
    console.log(err.stack);
    res.end(err.stack);
  }
};

var routing = async (req,res)=>{

  switch(req.url){
    case '/':
      var html = await filestream.readfile(appROOT + '/views/index.html');
      res.writeHead(200, ctxtype.html);  
      res.write(html);
      res.end();
      break;
  
    case '/init':
      var initvar = await dbop.getInitJson(); 
      res.writeHead(200, ctxtype.json);  
      res.write(JSON.stringify(initvar));
      res.end();
      break;

    case '/order':
      var data = await request.getdata(req);
      data = JSON.parse(data);
      try{
        await printer.print(data.images);
        //print first then log
        dbop.log(data);
      }catch(err){
        res.writeHead(500,ctxtype.html);
        console.error(err);
        res.end(err.toString());
      }
      res.writeHead(200, ctxtype.html);  
      res.end();
      break;

    case '/getnumber':
      var queuenumber = await dbop.getqueuenumber();
      var code = ''+ queuenumber;
      while(code.length<5){code = "0"+code}
      res.writeHead(200, ctxtype.html);  
      res.end("#"+code);
      break;

    case '/getlastDB_backup_date':
      break;

    case '/config':

      var data = await request.getdata(req);
      data = JSON.parse(data);
      var resdata;
      if(data.add){
        resdata = await dbop.add(data.add);
      }
      if(data.remove){
        resdata = await dbop.remove(data.remove);
      }
      if(data.update){
        resdata = await dbop.update(data.update);
      }
      res.writeHead(200, ctxtype.json);  
      res.end(JSON.stringify(resdata));
      break;

    case '/getconfig':
      break;
       
    case '/getstatistics':
      var data = await request.getdata(req);
      data = JSON.parse(data);
      var resdata = await dbop.getstatistics(data.startdate,data.enddate,data.period);
      res.writeHead(200, ctxtype.json);  
      res.end(JSON.stringify(resdata));
      break;

    case '/update':
      await bash.update();
      res.writeHead(200, ctxtype.html);  
      res.end('updated');
      bash.delaylaunch();
      process.exit();
      break;

    case '/restart':
      res.writeHead(200, ctxtype.html);  
      console.log('restarting...');
      bash.delaylaunch();
      res.end('restarted');
      process.exit();
      break;

    case '/backupdb.zip':
      await bash.backupdb();
      dbop.update_last_backup_date();
      
      var path = appROOT+'/views/backupdb.zip';
      var file = await filestream.readfile(path);
      //res.writeHead(200);
      res.write(file);
      res.end();
      break;

    case '/restoredb':
      await uploadfile.forrestore(req, appROOT+'/views/', 'backupdb.zip');
      await bash.restoredb();
      res.writeHead(200, ctxtype.html);  
      res.end('done');
      //bash.delaylaunch();
      dbop.reconnect_database();
      //process.exit();
      break;

    default:
      var path = (appROOT+'/views'+req.url).replace('../','');
      if(filestream.checkfile(path)){
        var html = await filestream.readfile(path);
        res.end(html);
      }
      else{
        res.writeHead(404, ctxtype.html);
        res.end('404');
      }
  }
}

