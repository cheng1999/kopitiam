
//today's 0600am
var start = new Date();
//start.setHours(0,0,0,0);
start.setHours(6,0,0,0);
//today's 1900pm
var end = new Date();
//end.setHours(23,59,59,999);
end.setHours(19,0,0,0);
$('.form_startdate').calendar('set date', start);
$('.form_enddate').calendar('set date', end);

var statistics,menucategories;

//load init

$.getJSON('init', function(data) {
  //data is the JSON string
  menucategories = data.categories.map(function(x){return x.name});
  init();
});



function init(){
  //selectcategories.menu=menu.categories;
  Vue.nextTick(function(){
    $('.ui.dropdown').dropdown();
    vueFormOptions.options = menucategories;
  });
  loaddata();
}


var period;
//load data

function loaddata(){
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
    url: 'getstatistics',
    type: 'POST',
    data: JSON.stringify(senddata),
    dataType: 'html',
    async: false,
    success: function(data){
      statistics = JSON.parse(data);
      loaded();
    },
    error: function (data) {
      alert(data);
    }
  });
}

/*
var chartdata = {
    //type: 'line',
    labels: [],
    datasets: [],
  },
  reset_chartdata = JSON.parse(JSON.stringify(chartdata));
*/

var table = [];

function loaded(){
  table = [];

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
  for(var c=0;c<menucategories.length;c++){
    var item = {'name': menucategories[c], 'prices': columnswith0(), 'counts': columnswith0(), 'totalprice': 0, 'totalcount': 0 };
    for(var d=0;d<table.length;d++){
      if(table[d].category != menucategories[c]) continue;
      
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
  vueData.table = rows;

  vueData.dates = statistics.dates;

  // documentation: https://github.com/kylefox/jquery-tablesort
  $('table').tablesort();
  $('thead th').data('sortBy', function(th, td, tablesort) {
    if (th.text()=="Name")  return td.text();
    return parseFloat(td.text());
  });

}

  /*
  chartdata = JSON.parse(JSON.stringify(reset_chartdata));
  statistics.dates.forEach(function(date){
    date = new Date(Date.parse(date));
    //var strdate = date.getDate()+"/"+date.getMonth()+"/"+date.getYear()+" "+date.get
    chartdata.labels.push(date.toLocaleString());
      
  });
  //summary
  //
  var frequency = { 'type': 'bar', 'label': 'Frequency', 'data':[] };
  var cumulative_frequency = { 'type': 'bar', 'label': 'Cumulative Frequency', 'data':[] };
  var cumulativeprice = 0;
  statistics.prices.forEach(function(price){
    frequency.data.push(price);
    cumulativeprice += price;
    cumulative_frequency.data.push(cumulativeprice);
  });
  summary.totalprice = cumulativeprice;
  chartdata.datasets.push(frequency);
  chartdata.datasets.push(cumulative_frequency);
  statistics.items.forEach(function(item){
    chartdata.datasets.push({
      'type': 'line',
      'label': item.name,
      'data': item.counts,
    });
  });
  makechart();
  //var ctx = document.getElementById('chart').getContext('2d');
  //new Chart(ctx, chartdata);
  //window.myScatter.destroy(); window.onload();
  */

function togglechartfilter(button){
  if($('.chartfilter').is(':visible')){
    $('.chartfilter').hide();
    button.innerHTML="Show";
  }
  else{
    $('.chartfilter').show();
    button.innerHTML="Hide";
  }
}

//vue objects
var vueData = new Vue({
  el: '#data',
  data: {
    options:[],
    dates:[],
    items:[],
  },
  methods: {
    showtime: function(date){
      var period = $('.form_period').dropdown('get value');
      //show in date or in time form
      return (period < 1440 ? new Date(date).toLocaleTimeString() : new Date(date).toLocaleDateString());
    }
  }
});
var vueFormOptions = new Vue({
  el: '#form_target_options',
  data: {
    options:[],
  }
});

var selectcategories = new Vue({
  el: '#selectcategories',
  data: {
    categories: [],  //given value in init()
    dates: [],
    table :[],
  },
  methods: {
  }
});

var summary = new Vue({
  el: '#summary',
  data: {
    totalprice: 0
  },
});


