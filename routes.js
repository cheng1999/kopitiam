const dbop = require('./models/dboperator.js'),
      requesthandler = require('./models/requesthandler.js'),
      filestream = require('./models/filestream.js'),
      printer = require('./models/printer'),
      bash = require('./models/bash.js'),
      uploadfile = require('./models/uploadfile.js');

const ctxtype={
  html:{'Content-Type': 'text/html'},
  json:{'Content-Type': 'application/json'},
  plaintext:{'Content-Type': 'text/plain'}
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
    console.error(err.stack);
    res.end(err.stack);
  }
};

// validate functions
var validate_hash = async(res, hash)=>{
  if (hash === await dbop.getHash()){return true;}
  res.writeHead(403,ctxtype.html);
  res.end('Wrong password');
  return false;
}
var validate_hashcookie = async(res, req)=>{
  var cookies = requesthandler.getcookies(req);
  if(cookies.hash !== undefined){
    if(cookies.hash == await dbop.getHash()){return true;}
  }

  var html = await filestream.readfile(appROOT + '/views/login.html');
  res.writeHead(200, ctxtype.html);
  res.end(html);
}

//router
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
      var data = await requesthandler.getdata(req);
      data = JSON.parse(data);

      //if this is amend order, but wrong password
      if(data.amendid && !await validate_hash(res, data.amendhash)){break;}

      //print first then log
      try{
        await printer.print(data.images);
        dbop.log(data);
      }catch(err){
        res.writeHead(500,ctxtype.html);
        console.error(err);
        res.end(err.toString());
      }
      res.writeHead(200, ctxtype.html);  
      res.end();
      break;

    case '/getorder':
      var data = await requesthandler.getdata(req);
      data = JSON.parse(data);
      if(!await validate_hash(res, data.hash)){break;}
      var order = await dbop.getOrder(data.id);
      res.writeHead(200, ctxtype.json);  
      res.end(JSON.stringify(order));
      break;

    case '/getnumber':
      var queuenumber = await dbop.getqueuenumber();
      var code = ''+ queuenumber;
      while(code.length<5){code = "0"+code}
      res.writeHead(200, ctxtype.html);  
      res.end(code);
      break;

    case '/getversion':
      res.end(appVERSION);
      break;

    case '/login':
      var data = await requesthandler.getdata(req);
      if(await validate_hash(res, data)){
        res.writeHead(200, ctxtype.JSON);  
        res.end();
      }
      break;


    // paths below need permission granted with password

    case '/config':
      if(!await validate_hashcookie(res, req)){break;};
      var data = await requesthandler.getdata(req);
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

    case '/getstatistics':
      if(!await validate_hashcookie(res, req)){break;};
      var data = await requesthandler.getdata(req);
      data = JSON.parse(data);
      var resdata = await dbop.getstatistics(data.startdate,data.enddate,data.period);
      res.writeHead(200, ctxtype.json);  
      res.end(JSON.stringify(resdata));
      break;

    case '/update':
      if(!await validate_hashcookie(res, req)){break;};
      //check for latest version
      var data = JSON.parse(await requesthandler.getrequest('https://api.github.com/repos/cheng1999/kopitiam/releases/latest'));
      var latestversion = data.tag_name;
      if (appVERSION == latestversion){res.end('No updates found. You already have the latest version.');return ;}

      await bash.update();
      res.writeHead(200, ctxtype.html);  
      res.end('Updated');
      bash.delaylaunch();
      process.exit();
      break;

    case '/restart':
      if(!await validate_hashcookie(res, req)){break;};
      res.writeHead(200, ctxtype.html);  
      console.log('restarting...');
      bash.delaylaunch();
      res.end('restarted');
      process.exit();
      break;

    case '/backupdb.zip':
      if(!await validate_hashcookie(res, req)){break;};
      await bash.backupdb();
      dbop.update_last_backup_date();
      
      var path = appROOT+'/views/backupdb.zip';
      var file = await filestream.readfile(path);
      //res.writeHead(200);
      res.write(file);
      res.end();
      break;

    case '/restoredb':
      if(!await validate_hashcookie(res, req)){break;};
      await uploadfile.forrestore(req, appROOT+'/views/', 'backupdb.zip');
      await bash.restoredb();
      res.writeHead(200, ctxtype.html);  
      res.end('done');
      //bash.delaylaunch();
      dbop.reconnect_database();
      //process.exit();
      break;

    case '/login.html':
      if(await validate_hashcookie(res, req)){
        var html = await filestream.readfile(appROOT + '/views/menu.html');
        res.writeHead(200, ctxtype.html);
        res.end(html);
      }
      break;

    case '/menu.html':
    case '/config.html':
    case '/statistics.html':
      if(!await validate_hashcookie(res, req)){break;};

    default:
      var path = (appROOT+'/views'+req.url).replace('../','');
      if(filestream.checkfile(path)){
        var file_extensions = path.split('.').pop();
        var contenttype;
        switch (file_extensions){
          case 'html': contenttype = 'text/html';break;
          case 'css': contenttype = 'text/css';break;
          case 'js': contenttype = 'application/javascript';break;
          case 'png': contenttype = 'image/png';break;
          case 'json': contenttype = 'application/json';break;
          default: contenttype = false;
        }
        if(contenttype!=false){
          res.writeHead(200, {'Content-Type': contenttype});
        }

        var data = await filestream.readfile(path);
        //res.writeHead(200, ctxtype.html);
        res.end(data);
      }
      else{
        res.writeHead(404, ctxtype.html);
        res.end('404');
      }
  }
}

