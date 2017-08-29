var startdate=$('#startdate');
var enddate=$('#enddate');
var periodlist=$('#periodlist');

//today's 1200amvar start = new Date();
var start = new Date();
start.setHours(0,0,0,0);
//today's 1155pm
var end = new Date();
end.setHours(23,59,59,999);
startdate.calendar('set date', start);
enddate.calendar('set date', end);

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
}

//load data
function loaddata(){
  //period's unit is minutes
  var period = $('#periodlist').dropdown('get value');
  var senddata = {
        "startdate": startdate.calendar('get date'),
        "enddate": enddate.calendar('get date'),
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

var statisticsoptions = {
    type: 'bar',
    data: {
      labels: [],
      datasets: [],
      borderWidth: 1 
    },
    options: {
      scales: {
        yAxes: [{
          ticks: {
            reverse: false
          }
        }]
      }
    }
  },
  reset_statisticsoption = JSON.parse(JSON.stringify(statisticsoptions));
function getRandomColor() {
    var letters = '0123456789ABCDEF'.split('');
    var color = '#';
    for (var i = 0; i < 6; i++ ) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}
function loaded(){
  statisticsoptions = JSON.parse(JSON.stringify(reset_statisticsoption));
  statistics.dates.forEach(function(date){
    date = new Date(Date.parse(date));
    statisticsoptions.data.labels.push(date.toDateString() + ' ' + date.toLocaleTimeString());
      
  });
  statistics.items.forEach(function(item){
    statisticsoptions.data.datasets.push({
      'label': item.name,
      'data': item.counts,
      'fillColor':  getRandomColor(),
      'backgroundColor': getRandomColor(),
      'borderColor': getRandomColor()
    });
  });
  var ctx = document.getElementById('chartJSContainer').getContext('2d');
  new Chart(ctx, statisticsoptions);
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



