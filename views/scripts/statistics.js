var startdate_ui=$('#startdate');
var enddate_ui=$('#enddate');
var periodlist=$('#periodlist');

//today's 1200amvar start = new Date();
var start = new Date();
start.setHours(0,0,0,0);
//today's 1155pm
var end = new Date();
end.setHours(23,59,59,999);
startdate_ui.calendar('set date', start);
enddate_ui.calendar('set date', end);

var statistics;
var menu;

//load init
$.getJSON('init', function(data) {
  //data is the JSON string
  menu = data.menu;
  init();
});

function init(){
  selectcategories.menu=menu;
  Vue.nextTick(function(){
    $('.ui.dropdown').dropdown();
  });
  loaddata();
}

var period;
//load data
function loaddata(){
  //var period = $('#periodlist').dropdown('get value');
  var startdate = startdate_ui.calendar('get date'),
      enddate = enddate_ui.calendar('get date');
  //period's unit is minutes
  period = (enddate - startdate)/12/60000;
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

var chartdata = {
    //type: 'line',
    labels: [],
    datasets: [],
  },
  reset_chartdata = JSON.parse(JSON.stringify(chartdata));
function loaded(){
  chartdata = JSON.parse(JSON.stringify(reset_chartdata));
  statistics.dates.forEach(function(date){
    date = new Date(Date.parse(date));
    //var strdate = date.getDate()+"/"+date.getMonth()+"/"+date.getYear()+" "+date.get
    chartdata.labels.push(date.toLocaleString());
      
  });
  //summary
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
}

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
var selectcategories = new Vue({
  el: '#selectcategories',
  data: {
    menu: [],  //given value in init()
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


