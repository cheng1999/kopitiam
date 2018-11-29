//referrence to https://github.com/chartjs/chartjs-plugin-zoom/blob/master/samples/zoom.html
//and rewrap it
var randomColor = function(opacity){
  return 'rgba(' + Math.round(Math.random() * 255) + ',' + Math.round(Math.random() * 255) + ',' + Math.round(Math.random() * 255) + ',' + (opacity || '.3') + ')';
}

var makechart = function() {
  var ctx = document.getElementById("chart").getContext("2d");
  chartdata.datasets.forEach(function(dataset) {
			dataset.borderColor = randomColor(0.4);
			dataset.backgroundColor = randomColor(0.1);
			//dataset.pointBorderColor = randomColor(0.7);
			//dataset.pointBackgroundColor = randomColor(0.5);
			//dataset.pointBorderWidth = 1;
  });
  console.log(chartdata);
  window.chart = new Chart(ctx, {
    type: 'bar',
    data: chartdata,
    options: {
      title: {
        display: true,
        text: 'Kopitiam'
      },
      scales: {
        yAxes: [{
          scaleLabel: {
            display: true,
            labelString: 'Prices'
          },
          ticks: {
            beginAtZero:true
          }
        }]
      },
      pan: {
        enabled: true,
        mode: 'y'
      },
      zoom: {
        enabled: true,
        mode: 'y',
        limits: {
          max: 10,
          min: 0.5
        }
      },
      responsive: true,
      tooltips: {
        mode: 'index',
        intersect: true
      }
    }
  });
};
