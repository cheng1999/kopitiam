var statistics_app={};

statistics_app.init = function(){

  var start = new Date();
  //start.setHours(0,0,0,0);
  start.setHours(6,0,0,0);
  //today's 1900pm
  var end = new Date();
  end.setHours(23,59,59,999);
  //end.setHours(19,0,0,0);
  $('.form_startdate').calendar('set date', start);
  $('.form_enddate').calendar('set date', end);

  //load init

  //selectcategories.menu=menu.categories;
  $.getJSON('/init', function(data) {
    //data is the JSON string
    statistics_app.menucategories = data.categories.map(function(x){return x.name});
    Vue.nextTick(function(){
      $('.ui.dropdown').dropdown();
      statistics_app.vueFormOptions.options = statistics_app.menucategories;
    });
    statistics_app.loaddata();
  });
}


//load data

statistics_app.loaddata = function(){
  var startdate = $('.form_startdate').calendar('get date'),
      enddate = $('.form_enddate').calendar('get date');
  //period's unit is minutes
  //period = (enddate - startdate)/12/60000;
  var period = $('.form_period').dropdown('get value');
  var senddata = {
    "startdate": startdate,
    "enddate": enddate,
    "period": period
  };

  $.ajax({
    url: '/getstatistics',
    type: 'POST',
    data: JSON.stringify(senddata),
    datatype: 'html',
    async: false,
    success: function(data){
      statistics_app.show(data);
    },
    error: function (data) {
      alert(data.responseText);
    }
  });
}


statistics_app.show = function(statistics){
    var table = [];

    var statistics_backup = JSON.parse(JSON.stringify(statistics));
    statistics.dates.splice(-1);
    var columnlength = statistics.dates.length;

    // make table
    var items = statistics.items;
    for(var c=0;c<items.length;c++){
      table.push(items[c]);
      table[c].totalprice = 0;
      table[c].totalcount = 0;
      for(var d=0;d<columnlength;d++)  table[c].totalprice += items[c].prices[d];//table[c].totalprice += items[c].prices[d];
      for(var d=0;d<columnlength;d++)  table[c].totalcount += items[c].counts[d];
    }
    
    function columnswith0(){return new Array(columnlength).fill(0)};

    //summary
    var summary = {'name': 'Summary', 'prices': columnswith0(), 'counts': columnswith0(), 'totalprice': 0, 'totalcount': 0 };
    
    for(var c=0;c<columnlength;c++){
      for(var d=0;d<items.length;d++){
        summary.prices[c] += items[d].prices[c];
        summary.counts[c] += items[d].counts[c];
      }
    }
    for(var c=0;c<items.length;c++){
        summary.totalprice += items[c].totalprice;
        summary.totalcount += items[c].totalcount;
    }
    table.splice(0,0,summary);

    //categories
    for(var c=0;c<statistics_app.menucategories.length;c++){
      var item = {'name': statistics_app.menucategories[c], 'prices': columnswith0(), 'counts': columnswith0(), 'totalprice': 0, 'totalcount': 0 };
      for(var d=0;d<table.length;d++){
        if(table[d].category != statistics_app.menucategories[c]) continue;
        
        for(var column=0;column<columnlength;column++){
          item.prices[column] += table[d].prices[column];
          item.counts[column] += table[d].counts[column];
        }
      }
      for(var column=0;column<columnlength;column++){
        item.totalprice += item.prices[column];
        item.totalcount += item.counts[column];
      }
      table.splice(c+1,0,item);
    }

    // show table
    var temp_table = [],
        target = $('.form_target').dropdown('get value'),
        showin = $('.form_showin').dropdown('get value');

    var rows = [];
    for(var c=0;c<table.length;c++){
      var item={};
      if( (target == 'Summary' && !table[c].category) ||
          (target == table[c].category)){
        item.name = table[c].name;
        item.column = (showin == 'Price' ? table[c].prices.map(function(x){return x.toFixed(2)}) : table[c].counts);
        item.total = (showin == 'Price' ? table[c].totalprice.toFixed(2) : table[c].totalcount);
        rows.push(item);
      }
    }
    statistics_app.vueData.table = rows;

    statistics_app.vueData.dates = statistics.dates;

    // documentation: https://github.com/kylefox/jquery-tablesort
    $('table').tablesort();
    $('thead th').data('sortBy', function(th, td, tablesort) {
      if (th.text()=="Name")  return td.text();
      return parseFloat(td.text());
    });

  }

//vue objects
statistics_app.vueData = new Vue({
    el: '#data',
    data: {
      options:[],
      dates:[],
      items:[],
      table:[]
    },
    methods: {
      showtime: function(date){
        var period = $('.form_period').dropdown('get value');
        //show in date or in time form
        return (period < 1440 ? new Date(date).toLocaleTimeString() : new Date(date).toLocaleDateString());
      }
    }
  });

statistics_app.vueFormOptions = new Vue({
    el: '#form_target_options',
    data: {
      options:[],
    }
  });
