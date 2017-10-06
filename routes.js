const dbop = require('./models/dboperator.js'),
      request = require('./models/request.js'),
      filestream = require('./models/filestream.js'),
      printer = require('./models/printer'),
      update = require('./models/update.js').update;

const ctxtype={
  html:{"Content-Type": "text.html"},
  json:{'Content-Type': 'application/json'}
};


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
      var initvar = dbop.getInitJson(); 
      res.writeHead(200, ctxtype.json);  
      res.write(JSON.stringify(initvar));
      res.end();
      break;

    case '/order':
      var data = await request.getpost(req);
      data = JSON.parse(data);
      //console.log(data);
      dbop.log(data);
      try{
        await printer.print(data);
      }catch(err){
        res.writeHead(500,ctxtype.html);
        console.error(err);
        res.end(err.toString());
      }
      res.writeHead(200, ctxtype.html);  
      res.end();
      break;

    case '/config':
      var data = await request.getpost(req);
      data = JSON.parse(data);
      var resdata;
      if(data.add){
        resdata = dbop.add(data.add);
      };
      if(data.remove){
        resdata = dbop.remove(data.remove);
      }
      res.writeHead(200, ctxtype.json);  
      res.end(JSON.stringify(resdata));
      break;

    case '/getconfig':
      break;
       
    case '/getstatistics':
      var data = await request.getpost(req);
      data = JSON.parse(data);
      var resdata = dbop.getstatistics(data.startdate,data.enddate,data.period);
      res.writeHead(200, ctxtype.json);  
      res.end(JSON.stringify(resdata));
      break;

    case '/update':
      await update();
      res.writeHead(200, ctxtype.json);  
      res.end('updated');
      process.exit();
      break;

    default:
      var path = (appROOT+'/views'+req.url).replace('../','');
      if(filestream.checkfile(path)){
        var html = await filestream.readfile(path);
        res.write(html);
      }
      else{
        res.writeHead(404, ctxtype.html);
        res.write('404');
      }
      res.end();

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
            var data = await request.getpost(req);//get the post from req data
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

