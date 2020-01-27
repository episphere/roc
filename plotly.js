var data = fetch('https://raw.githubusercontent.com/episphere/roc/master/D1.csv') .then((response) => {
    return response.json();
  })

var myLineChart = new Chart(ctx, {
    type: 'line',
    data: data,
    options: {
        scales: {
            yAxes: [{
                stacked: true
            }]
        }
    }
});