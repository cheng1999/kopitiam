const loki = require(appROOT+'/lib/lokijs/lokijs.js'),
      lfsa = require(appROOT+'/lib/lokijs/loki-fs-structured-adapter.js');

var db = new loki(appROOT+'/db/kopitiam.db',{
  adapter : new lfsa(),
  autoload: true,
  autoloadCallback: databaseInitialize,
  autosave: true, 
  autosaveInterval: 4000
});

//initial
var items, remarks, extra, log;

var config = require(appROOT+'/config.js');

function databaseInitialize() {
  categories = db.getCollection('categories');
  items = db.getCollection('items');
  remarks = db.getCollection('remarks');
  extra = db.getCollection('extra');
  log = db.getCollection('log');
  

  if(categories === null){
    categories = db.addCollection('categories');
    config.categories.forEach( (x)=>{
      categories.insert(x);
    });
  }
  if(items === null){
    items = db.addCollection('items');
    //insert configured items
    config.items.forEach( (x)=> {
      items.insert(x)
    });
  }
  if(remarks === null){
    remarks = db.addCollection('remarks');
    config.remarks.forEach( (x)=> {
      remarks.insert(x);
    });
  }
  if(extra === null){
    extra = db.addCollection('extra');
    config.extra.forEach( (x)=> {
      extra.insert(x);
    });
  }
  if(log === null){
    log = db.addCollection('log');
  }
}

module.exports.getInitJson = ()=>{
  var menu = [],
      remarks_list = [],
      extra_list = [];
  var temp;

  //categories
  temp = categories.find();
  temp.forEach( (category)=> {
    menu.push({
      'id': category.$loki,
      'name': category.name,
      'items': []
    });
  });

  //categories' items
  menu.forEach( (category)=> {
    var item_list = items.find({'category': category.name});
    item_list.forEach( (item)=>{
      category.items.push({
        'id': item.$loki,
        'categoryid': category.id, //which category belongs to
        'name': item.name,
        'price': item.price
      });
    });
   });

  temp = remarks.find();
  temp.forEach( (x)=> {
    remarks_list.push({
      'id': x.$loki,
      'text': x.text
    });
  });

  temp = extra.find();
  temp.forEach( (x)=> {
    extra_list.push({
      'id': x.$loki,
      'text': x.text,
      'price': x.price
    });
  });

  return {
    'menu': menu,
    'remarks': remarks_list,
    'extra': extra_list,
    'tablenumber': config.tablenumber
  };
}

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
      console.log(enddate);
      //get item order history
      //var itemlogs = log.find({ 'itemid': item.id, date: {$between: [data.dates[index],data.dates[index+1]] } });
      var date1 = data.dates[index].toJSON(),
          date2 = data.dates[index+1].toJSON();
      console.log(date1,date2);
      var itemlogs = log.find({ 'itemid': item.$loki, date: { $between: [date1,date2] } });
      console.log(itemlogs);
      itemlogdata.counts[index]=itemlogs.length;
      itemlogs.forEach((itemlog)=>{
        data.prices[index]+=itemlog.price;
      });
    }
    data.items.push(itemlogdata);
  });

  console.log(data);
  return data;
}

module.exports.log = (data)=>{
  //type, date
  data.items.forEach((item)=>{
    log.insert({'itemid': item.id, 'price': item.price ,'date': new Date});
  });
  
}
