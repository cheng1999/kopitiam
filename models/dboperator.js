const loki = require('lokijs'),
      lfsa = require('lokijs/src/loki-fs-structured-adapter');

var db = new loki(appROOT+'/db/kopitiam.db',{
  adapter : new lfsa(),
  autoload: true,
  autoloadCallback: databaseInitialize,
  autosave: true, 
  autosaveInterval: 4000
});

//initial
var categories, items, remarks, extra, log, tablenumber;

var config = require(appROOT+'/config.js');

var dbloaded = false;
function databaseInitialize() {
  categories = db.getCollection('categories');
  items = db.getCollection('items');
  remarks = db.getCollection('remarks');
  extra = db.getCollection('extra');
  log = db.getCollection('log');
  printers = db.getCollection('printers');
  tablenumber = db.getCollection('tablenumber');
  
  if(categories === null){
    categories = db.addCollection('categories');
    config.categories.forEach( (x)=>{
      x.position = categories.find().length;
      categories.insert(x);
    });
  }
  if(items === null){
    items = db.addCollection('items');
    //insert configured items
    config.items.forEach( (x)=> {
      //default position
      x.position = items.find({ 'category': x.category }).length;
      items.insert(x)
    });
  }
  if(remarks === null){
    remarks = db.addCollection('remarks');
    config.remarks.forEach( (x)=> {
      x.position = remarks.find().length;
      remarks.insert(x);
    });
  }
  if(extra === null){
    extra = db.addCollection('extra');
    config.extra.forEach( (x)=> {
      x.position = extra.find().length;
      extra.insert(x);
    });
  }
  if(log === null){
    log = db.addCollection('log');
  }
  if(printers === null){
    printers = db.addCollection('printers');
    config.printers.forEach( (x)=>{
      printers.insert(x);
    });
  }
  if(tablenumber === null){
    tablenumber = db.addCollection('tablenumber');
    config.tablenumber.forEach( (x)=>{
      tablenumber.insert({
        'number': x
      });
    });
  }

  dbloaded = true;
}

//rewrap data for client
//target is rewrap data type
//data was selected from database
var rewrap = (target, data)=>{
  switch(target){
    case 'category':
      return {
        'id': data.$loki,
        'name': data.name,
        'position': data.position
      };
    case 'items':
      return {
        'id': data.$loki,
        'name': data.name,
        'category': data.category,
        'price': data.price,
        'printer': data.printer,
        'font': data.font,
        'background': data.background,
        'position': data.position,
      };
    case 'remarks':
      return {
      'id': data.$loki,
      'text': data.text
      };
    case 'extra':
      return {
        'id': data.$loki,
        'text': data.text,
        'price': data.price
      };
    case 'tablenumber':
      return {
        'id': data.$loki,
        'number': data.number,
      };
    case 'printers':
      return {
        'id': data.$loki,
        'name': data.name,
        'ip': data.ip,
        'port': data.port
      };
    default:
      throw new Error('invalid target');
  }
}

/* get from database */
module.exports.autoloadCallback = (callback)=>{
  setTimeout(()=>{
    if(dbloaded)callback();
    else{this.autoloadCallback(callback);}
  }, 3000);
}

var initJson = null, needtoRefresh = true;
module.exports.getInitJson = ()=>{
  //if already in memory, then not need take reload from database anymore
  if(initJson & !needtoRefresh){
    return initJson;
  }
  needtoRefresh = false;

  var categories_list = [],
      items_list = [],
      remarks_list = [],
      extra_list = [],
      tablenumber_list = [],
      printers_list = [];

  var temp = categories.find();
  temp.forEach((data)=>{
    categories_list.push(rewrap('category', data));
  });
  var temp = items.chain().find().simplesort('position').data();
  temp.forEach((data)=>{
    items_list.push(rewrap('items', data));
  });
  var temp = remarks.chain().find().simplesort('position').data();
  temp.forEach((data)=>{
    remarks_list.push(rewrap('remarks', data));
  });
  var temp = extra.chain().find().simplesort('position').data();
  temp.forEach((data)=>{
    extra_list.push(rewrap('extra', data));
  });
  var temp = tablenumber.chain().find().simplesort('number').data();
  temp.forEach((data)=>{
    tablenumber_list.push(rewrap('tablenumber', data));
  });
  var temp = printers.find();
  temp.forEach((data)=>{
    printers_list.push(rewrap('printers', data));
  });


  initJson = {
    'categories': categories_list,
    'items': items_list,
    'remarks': remarks_list,
    'extra': extra_list,
    //'tablenumber': config.tablenumber
    'tablenumber': tablenumber_list,
    'printers': printers_list
  };
  return initJson;
};

module.exports.getstatistics = (startdate,enddate,periodmin)=>{
  //this become string when json was stringified for transfering over network 
  startdate = new Date(Date.parse(startdate));
  enddate = new Date(Date.parse(enddate));
  periodmin = parseInt(periodmin);
  //all array's index like table's column position
  var data= {
    'dates':[],
    'prices':[],
    'items': [],
  };

  while(startdate-periodmin*60*1000<enddate){
    data.dates.push(new Date(startdate));
    data.prices.push(0);
    //add minutes, it will auto conver to hours if up to 60 min (60 min per hour)
    startdate.setMinutes(startdate.getMinutes() + periodmin);
  }

  var allitems = items.find();
  allitems.forEach((item)=>{
    var itemlogdata = {'name': item.name, 'counts':[]};
    var totalmakeprice = 0;
    //they all have same length and index, like table: every row have same number of column
    for(var index=0; index<data.dates.length-1; index++){
      //console.log(enddate);
      //get item order history
      //var itemlogs = log.find({ 'itemid': item.id, date: {$between: [data.dates[index],data.dates[index+1]] } });
      var date1 = data.dates[index].toJSON(),
          date2 = data.dates[index+1].toJSON();
      //console.log(date1,date2);
      var itemlogs = log.find({ 'itemid': item.$loki, date: { $between: [date1,date2] } });
      //console.log(itemlogs);
      itemlogdata.counts[index]=itemlogs.length;
      itemlogs.forEach((itemlog)=>{
        data.prices[index]+=itemlog.price;
      });
    }
    data.items.push(itemlogdata);
  });

  //console.log(data);
  return data;
}

module.exports.getPrinter = (itemid)=>{
    return items.findOne({'$loki':itemid}).printer;
};

/* write into database */

module.exports.log = (data)=>{
  //type, date
  data.items.forEach((item)=>{
    for(c=0; c<item.count; c++){
      log.insert({'itemid': item.id, 'price': item.price ,'date': new Date});
    }
  });
}

module.exports.add = (data)=>{
  var resdata;
  switch(data.target){
    case 'items':
      //default position
      
      data.item.position = items.find({ 'category': data.item.category }).length;
      resdata = rewrap(data.target, items.insert(data.item));
      //console.log(categories.findOne({'name': data.item.category}));
      if(!categories.findOne({'name': data.item.category})){
        categories.insert({'name': data.item.category});
      }
      break;
    case 'printers':
      resdata = rewrap(data.target, printers.insert(data.data));
      break;
    case 'tablenumber':
      resdata = rewrap(data.target, tablenumber.insert(data.data));
      break;
    case 'extra':
      resdata = rewrap(data.target, extra.insert(data.data));
      break;
    case 'remarks':
      resdata = rewrap(data.target, remarks.insert(data.data));
      break;
    default:
      throw new Error("invalid target");
  }
  needtoRefresh = true;
  return resdata;
};

module.exports.remove = (data)=>{
  switch(data.target){
    case 'items':
      var resdata = items.chain().find({ '$loki': data.id });
      //if there is only one record with this category and was prepared to remove, then remove that category too
      var data_item_category = items.findOne({ '$loki': data.id }).category;
      if(items.find({ 'category': data_item_category }).length === 1){
        categories.chain().find({'name': data_item_category}).remove();
      }
      break;
    case 'printers':
      var resdata = printers.chain().find({ '$loki': data.id });
      break;
    case 'tablenumber':
      var resdata = tablenumber.chain().find({ '$loki': data.id });
      break;
    case 'extra':
      var resdata = extra.chain().find({ '$loki': data.id });
      break;
    case 'remarks':
      var resdata = remarks.chain().find({ '$loki': data.id });
      break;
    default:
      throw new Error("invalid target");
  }
  //console.log(resdata.remove());
  resdata.remove();
  needtoRefresh = true;
  return 1;
};

module.exports.update = (data)=>{
  switch(data.target){
    case 'items':
      var item = items.findOne({ '$loki': data.item.id });
      item.name = data.item.name;
      item.category = data.item.category;
      item.printer = data.item.printer;
      item.price = data.item.price;
      item.color = data.item.color;
      items.update(item);
      break;
    case 'item_position':
      var item = items.findOne({ '$loki': data.id });
      var list = items.find({ 'category': item.category }); //item which is same category
      shift(items, item, list, data.position, data.position_bfr);
      break;
    case 'remark_position':
      var item = remarks.findOne({ '$loki': data.id });
      var list = remarks.find();
      shift(remarks, item, list, data.position, data.position_bfr);
      break;
    case 'extra_position':
      var item = extra.findOne({ '$loki': data.id });
      var list = extra.find();
      shift(extra, item, list, data.position, data.position_bfr);
      break;
    default:
      throw new Error("invalid target");
  }
  needtoRefresh = true;
  return 1;
};

//shifting all position
var shift = (collection,item,list,position,position_bfr)=>{
  for(var c=0; c<list.length; c++){
    //console.log(list[c]+':'+list[c].position);
    if(position >= list[c].position &&
                        list[c].position > position_bfr){
      list[c].position --;
      //console.log(list[c]);
      //console.log('--'+list[c].position);
    }
    if(position <= list[c].position &&
                        list[c].position < position_bfr){
      list[c].position ++;
      //console.log(list[c]);
      //console.log('++'+list[c].position);
    }
  }
  //update every shifted
  for(var c=0; c<list.length; c++){
    collection.update(list[c]);
  }
  //update its own position
  item.position = position;
  collection.update(item);

};

