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
      //console.log(data);
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
        //if(data.add.target == 'printers')printer.reloadPrinters();
      }
      if(data.remove){
        resdata = await dbop.remove(data.remove);
        //if(data.remove.target == 'printers')printer.reloadPrinters();
      }
      //console.log(data);
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
      //require('child_process').spawn('sh', ['bash/update.sh'], {stdio: 'inherit'});
      await dbop.saveDatabase();
      await bash.update();
      //spawn('sh', ['bash/delaylaunch.sh'], {stdio: 'inherit'});
      res.writeHead(200, ctxtype.html);  
      res.end('updated');
      bash.delaylaunch();
      process.exit();
      break;

    case '/restart':
      //console.log('Saving database...');
      //await dbop.saveDatabase();
      res.writeHead(200, ctxtype.html);  
      console.log('restarting...');
      bash.delaylaunch();
      res.end('restarted');
      process.exit();
      break;

    case '/backupdb.zip':
      await bash.backupdb();
      dbop.updatelastDB_backup_date();
      
      var path = appROOT+'/views/backupdb.zip';
      var file = await filestream.readfile(path);
      //res.writeHead(200);
      res.write(file);
      res.end();
      break;

    case '/restore':
      //var file = await request.getdata(req);
      await uploadfile.forrestore(req, appROOT+'/views/', 'backupdb.zip');
      //await bash.restoredb();
      res.writeHead(200, ctxtype.html);  
      res.end('done');
      bash.delaylaunch();
      process.exit();
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
/*
        if(req.url == '/'){
          res.writeHeader(200, ctxtype.html);  
          var html = await filestream.readfile(appROOT + '/views/index.html');
          res.write(html);
          res.end();
        }
        //response code 200 first
        res.writeHead(200, ctxtype.json);

        if(req.url == '/attendance' && req.method == 'POST'){
            var data = await request.getdata(req);//get the post from req data
            //var json =  JSON.parse(post);
            res.end(data);
        }
        else if(req.url.substring(0,13)==('/getnamelist/')){
            var clubid = req.url.replace('/getnamelist/','');
            clubid = parseInt(clubid);//by original it is string from url, but we convert it to integer
            var namelist = await dboperator.getnamelist(clubid);
            res.end(JSON.stringify(namelist));
        }
        else if(req.url==('/getclublist')){
            var clublist = await dboperator.getclublist();
            res.end(JSON.stringify(clublist));
        }
        else if(req.url==('/testserver')){//let clients validate server is work for them
            var version={'version':'attendance.v1'};
            res.end(JSON.stringify(version));
        }
        else{
            var res_error={'error':"404"};
            res.end(JSON.stringify(res_error));
        }
  */
}

