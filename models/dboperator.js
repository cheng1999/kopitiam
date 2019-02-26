const dbBuilt = require('fs').existsSync(appROOT+'/main.db'),//variable for check exists of database
  dblite = require('dblite');
  //dblite.bin = appROOT+'/sqlite/sqlite3.exe';
var db = dblite(appROOT+'/main.db', '-header');

//db.on('close', function (code) {});// by default, it logs 'bye bye', but I want it to shut up

db.on('close', function (code) {
  // by default, it logs "bye bye"
  // invoked once the database has been closed
  // and every statement in the queue executed
  // the code is the exit code returned via SQLite3
  // usually 0 if everything was OK
  console.log('reconnecting database_');
});


/* some functions */
//issue: https://github.com/WebReflection/dblite/issues/23 
//seems some error will cause database unresponsive, so we just reconnect it violently after error :(
module.exports.reconnect_database = ()=>{
  db.close();
  db = dblite(appROOT+'/main.db', '-header');
  this.init();
}
var query = (arg1,arg2,arg3)=>{//db.query() have maximun 4 arguments, last one for callback
    return new Promise((resolve,reject)=>{

        var callback = (err,rows)=>{ //the args 4, or the last argements
            if(err) {
              this.reconnect_database();
              reject(err);
            }
            else resolve(rows);
        }
        try{
            if(arg3) db.query(arg1,arg2,arg3,callback);
            else if(arg2) db.query(arg1,arg2,callback);
            else if(arg1) db.query(arg1,callback);
        }catch(err){
          this.reconnect_database();
          reject(err);
        }
    });
}

var query_count = (query_result)=>{
    var listcount = query_result[0].count;
    return listcount!==undefined ? parseInt(listcount) : 0;
}

//initial
module.exports.init = ()=>{
  //turn the foreign keys on
  db.query('PRAGMA foreign_keys = ON;',function(){});//add function at the back to prevent it print out result on console
  db.query('ATTACH DATABASE "' + appROOT + '/log.db" AS logdb');

  //build database if not yet
  if(!dbBuilt){
    //categories
    db.query('\
      CREATE TABLE categories (\
        id INTEGER PRIMARY KEY AUTOINCREMENT,\
        name VARCHAR(255) UNIQUE NOT NULL,\
        position INTEGER\
      )'
    );

    //items
    db.query('\
      CREATE TABLE items (\
        id INTEGER PRIMARY KEY AUTOINCREMENT,\
        name VARCHAR(255) NOT NULL,\
        category VARCHAR(255) NOT NULL,\
        price DOUBLE NOT NULL,\
        printer VARCHAR(255) NOT NULL,\
        font VARCHAR(7) NOT NULL,\
        background VARCHAR(7) NOT NULL,\
        position INTEGER\
      )'
    );
 

    //remarks
    db.query('\
      CREATE TABLE remarks (\
        id INTEGER PRIMARY KEY AUTOINCREMENT,\
        text VARCHAR(255) NOT NULL,\
        position INTEGER\
      )'
    );

    //extra
    db.query('\
      CREATE TABLE extra (\
        id INTEGER PRIMARY KEY AUTOINCREMENT,\
        text VARCHAR(255) NOT NULL,\
        price DOUBLE NOT NULL,\
        position INTEGER\
      )'
    );

    //tablenumber
    db.query('\
      CREATE TABLE tablenumber (\
        id INTEGER PRIMARY KEY AUTOINCREMENT,\
        number VARCHAR(255) NOT NULL,\
        position INTEGER\
      )'
    );

    //printers
    db.query('\
      CREATE TABLE printers (\
        id INTEGER PRIMARY KEY AUTOINCREMENT,\
        name VARCHAR(255) UNIQUE NOT NULL,\
        ip VARCHAR(15) NOT NULL,\
        port INTEGER NOT NULL\
      )'
    );

    //log
    db.query('\
      CREATE TABLE logdb.log (\
        itemid INTEGER NOT NULL,\
        price DOUBLE NOT NULL,\
        date TEXT NOT NULL\
      )'
    );

    //save data
    db.query('\
      CREATE TABLE savedata (\
        selector TEXT NOT NULL,\
        value TEXT NOT NULL\
      )'
    );

    db.query('INSERT INTO savedata VALUES(?,?)',
      [
        'queuenumber',
        JSON.stringify({'number': 0, 'date': new Date().getDate()})
      ]);

    db.query('INSERT INTO savedata VALUES(?,?)',
      [
        'lastbackup',
        JSON.stringify({'time': new Date().getTime()})
      ]);

    db.query('CREATE INDEX logdb.date_index ON log (date ASC)');
 //create unique index m.qwe on users (name);
  }
}


/* get from database */

var initJson = null, needtoRefresh = true;
module.exports.getInitJson = async ()=>{
  //if already in memory, then not need reload from database anymore
  if(initJson && !needtoRefresh){
    return initJson;
  }
  needtoRefresh = false;

  var rows,
      categories_list = [],
      items_list = [],
      remarks_list = [],
      extra_list = [],
      tablenumber_list = [],
      printers_list = [];


  categories_list = await query('SELECT * FROM categories ORDER BY position ASC');
  items_list = await query('SELECT * FROM items ORDER BY position ASC', { 'price': Number });
  remarks_list = await query('SELECT * FROM remarks ORDER BY position ASC');
  extra_list = await query('SELECT * FROM extra ORDER BY position ASC', { 'price': Number });
  tablenumber_list = await query('SELECT * FROM tablenumber ORDER BY position ASC'); 
  printers_list = await query('SELECT * FROM printers');

  initJson = {
    'categories': categories_list,
    'items': items_list,
    'remarks': remarks_list,
    'extra': extra_list,
    //'tablenumber': config.tablenumber
    'tablenumber': tablenumber_list,
    'printers': printers_list,
    'version': appVERSION 
  };
  return initJson;
};


module.exports.getstatistics = async (startdate,enddate,periodmin)=>{
  //this become string when json was stringified for transfering over network 
  startdate = new Date(Date.parse(startdate));
  enddate = new Date(Date.parse(enddate));
  periodmin = parseInt(periodmin);
  //all array's index like table's column position
  var data= {
    'dates':[],
    'items': [],
  };

  while(startdate-periodmin*60*1000<enddate){
    data.dates.push(new Date(startdate));
    //add minutes, it will auto conver to hours if up to 60 min (60 min per hour)
    startdate.setMinutes(startdate.getMinutes() + periodmin);
  }

  var allitems = await query('SELECT id,name,category FROM items');
  var tempcount=0;
  for (var c=0; c<allitems.length; c++){
    
    var item=allitems[c];
    var itemlogdata = {'category': item.category, 'name': item.name, 'prices': [], 'counts':[]};
    //they all have same length and index, like table: every row have same number of column
    for(var index=0; index<data.dates.length-1; index++){
      //get item order history
      var date1 = data.dates[index].getTime(),
          date2 = data.dates[index+1].getTime();
      var itemlogs = await query('SELECT * FROM logdb.log WHERE itemid = ? AND date > ? AND date < ?',
        [item.id, date1, date2], {'price': Number});
       
      itemlogdata.counts[index]=itemlogs.length;
      itemlogdata.prices[index]=0;
      itemlogs.forEach((itemlog)=>{
        itemlogdata.prices[index]+=itemlog.price;
      });
    }
    data.items.push(itemlogdata);
  }

  return data;
}


module.exports.getPrinter = async (printername)=>{
  var res = await query('SELECT * FROM printers WHERE name = ?', [printername]);
  res = res[0];
  return res;
};


module.exports.getqueuenumber = async ()=>{
  var queuenumber = await query('SELECT value FROM savedata WHERE selector = "queuenumber"');
  queuenumber = queuenumber[0].value;
  queuenumber = JSON.parse(queuenumber);

  if(queuenumber.date!=new Date().getDate()){
    queuenumber.number = 0;
  }
  else{ queuenumber.number++; }
  await query('UPDATE savedata SET value = ? WHERE selector = "queuenumber"', [JSON.stringify({'number': queuenumber.number, 'date': new Date().getDate()})]);
 
  return queuenumber.number;
};

module.exports.update_last_backup_date = async ()=>{
    db.query('UPDATE savedata SET value = ? WHERE selector = "lastbackup"', [JSON.stringify({'time': new Date().getTime()})]);
}



/* write into database */

module.exports.log = async (data)=>{
  //type, date
  await query('BEGIN TRANSACTION');
  for(c=0; c<data.items.length; c++){
    var item = data.items[c];
    for(d=0; d<item.count; d++){
      await query('INSERT INTO log VALUES(?,?,?)',
        [
          item.id,  //itemid
          parseFloat(item.price), //price
          new Date().getTime() //date
        ]);
    }
  }

  await query('END TRANSACTION');
}

module.exports.add = async (data)=>{
  
  var resdata;
  switch(data.target){
    case 'items':
      //default position
      data.item.position = query_count(await query('SELECT count(*) FROM items WHERE category = ?', [data.item.category], ['count']))
      await query('INSERT INTO items VALUES (?,?,?,?,?,?,?,?)',
        [
          null, //id which is autoincrement
          data.item.name,
          data.item.category,
          data.item.price,
          data.item.printer,
          data.item.font,
          data.item.background,
          data.item.position
        ]);

      resdata = await query('SELECT * FROM items WHERE category = ? AND position = ?', [data.item.category, data.item.position]);

      var category_exist = await query('SELECT * FROM categories WHERE name = ?', [data.item.category]);
      if(category_exist[0] == undefined){

        var position = query_count(await query('SELECT count(*) FROM categories', ['count']));
        await query('INSERT INTO categories VALUES (?,?,?)',
          [
            null,
            data.item.category,
            position
          ]);
      }
      break;
    case 'printers':
      await query('INSERT INTO printers VALUES(?,?,?,?)',
        [
          null,
          data.data.name,
          data.data.ip,
          data.data.port
        ]);
      resdata = await query('select * from printers WHERE name = ?', [data.data.name]);
      break;
    case 'tablenumber':
      var position = query_count(await query('SELECT count(*) FROM tablenumber', ['count']));
      await query('INSERT INTO tablenumber VALUES(?,?,?)',
        [
          null,
          data.data.number,
          position
        ]);
      resdata = await query('select * from tablenumber WHERE number = ?', [data.data.number]);
      break;
    case 'extra':
      data.data.position = query_count(await query('SELECT count(*) FROM extra', ['count'])); 
      await query('INSERT INTO extra VALUES (?,?,?,?)',
        [
          null,
          data.data.text,
          data.data.price,
          data.data.position 
        ]);

      resdata = await query('SELECT * FROM extra WHERE position = ?', [data.data.position]);
      break;
    case 'remarks':
      data.data.position = query_count(await query('SELECT count(*) FROM remarks', ['count'])); 
      await query('INSERT INTO remarks VALUES (?,?,?)',
        [
          null,
          data.data.text,
          data.data.position
        ]);

      resdata = await query('SELECT * FROM remarks WHERE position = ?', [data.data.position]);
      break;
    default:
      throw new Error("invalid target");
  }
  needtoRefresh = true;
  resdata = resdata[0];
  return resdata;
};


module.exports.remove = async (data)=>{
  switch(data.target){
    case 'items':
      //if there is only one record with this category and was prepared to remove, then remove that category too
      var item = await query('SELECT category,position FROM items WHERE id = ?', [data.id],
        { category: String, position: Number });
      item = item[0];
      await query('DELETE FROM items WHERE id = ?', [data.id]);
      
      var listcount = query_count(await query('SELECT count(*) FROM items WHERE category = ?', [item.category], ['count'])); 
      if(listcount == 0){ //number of items which is in same category
        await query('DELETE FROM categories WHERE name = ?', [item.category]);
      }else{

        //shift the items position to replace the removed item
        //change to last position then remove
        await query('UPDATE items SET position = position - 1 WHERE category = ? and position > ?', [item.category, item.position]);
      }
      break;
    case 'printers':
      await query('DELETE FROM printers WHERE id = ?',[data.id]);
      break;
    case 'tablenumber':
      await query('DELETE FROM tablenumber WHERE id = ?',[data.id]);
      break;
    case 'extra':
      var position = await query('SELECT position FROM extra WHERE id = ?', [data.id]);
      position = position[0].position;
      await query('DELETE FROM extra WHERE id = ?', [data.id]);
      await query('UPDATE extra SET position = position -1 WHERE position > ?', [data.id, position]);
      break;
    case 'remarks':
      var position = await query('SELECT position FROM remarks WHERE id = ?', [data.id]);
      position = position[0].position;
      await query('DELETE FROM remarks WHERE id = ?', [data.id]);
      await query('UPDATE remarks SET position = position -1 WHERE position > ?', [data.id, position]);
      break;
    default:
      throw new Error("invalid target");
  }
  needtoRefresh = true;
  return 1;
};




module.exports.update = async (data)=>{

  /** POSITION SHIFTING **/
  var shift_position = async(table, add_command, add_params)=>{
    // to determine whether the position of replacing item is + or - 
    if(data.position_bfr < data.position){
      await query('UPDATE ? SET position = position-1 WHERE position <= ? AND position > ? '  + add_command, 
        [table, data.position, data.position_bfr].concat(add_params));
    }
    else if(data.position_bfr > data.position){
      await query('UPDATE ? SET position = position+1 WHERE position >= ? AND position < ? ' + add_command, 
        [table, data.position, data.position_bfr].concat(add_params));
    }

    await query('UPDATE ? SET position = ? WHERE id = ?', [table, data.position, data.id]);
    // just found out that sort position is not good in ux,
    // must use the way swap later, but now do other stuffs first .-.
    //**DAMN mantaince
  }

  switch(data.target){
    case 'items':
      //cannot update category
      await query('UPDATE items SET name=?, printer= ?, price=?, background=?, font=? WHERE id= ? ',
        [
        data.item.name,
        //data.item.category,
        data.item.printer,
        data.item.price,
        data.item.background,
        data.item.font,

        data.item.id
      ]);
      break;
  
    case 'category_position':
      await shift_position('categories','',[]);
      break;
    case 'tablenumber_position':
      await shift_position('tablenumber','',[]);
      break;
    case 'item_position':
      var category = await query('SELECT category FROM items WHERE id = ?', [data.id]);
      category = category[0].category;
      await shift_position('items', 'AND category = ?', [category]);
      break;
    case 'remark_position':
      await shift_position('remarks','',[]);
      break;
    case 'extra_position':
      await shift_position('extra','',[]);
      break;
    default:
      throw new Error("invalid target");
  }
  needtoRefresh = true;
  return 1;
};
