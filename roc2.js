let ip = document.getElementById('fileInput')
ip.onchange=ev=>{
    var reader = new FileReader();
    reader.onload = function(){
      rocData.value = reader.result.trim();
      roc.parseText()
    };
    reader.readAsText(ip.files[0]);
}

roc.parseText=(txt=rocData.value,divId='plotDiv')=>{ // default points ti UP element
    roc.data={
        obs:[],
        pred:[]
    }
    txt.split(/[\r\n]+/).forEach((row,i)=>{
        row=row.split(',')
        roc.data.obs[i]=parseFloat(row[0])
        roc.data.pred[i]=parseFloat(row[1])
    })cd ..Chart

lineChartData = {}; //declare an object
lineChartData.labels = []; //add 'labels' element to object (X axis)
lineChartData.datasets = []; //add 'datasets' array element to object

for (line = 0; line < 4; line++) {
    y = [];
    lineChartData.datasets.push({}); //create a new line dataset
    dataset = lineChartData.datasets[line]
    dataset.fillColor = "rgba(0,0,0,0)";
    dataset.strokeColor = "rgba(200,200,200,1)";
    dataset.data = []; //contains the 'Y; axis data

    for (x = 0; x < 10; x++) {
        y.push(line + x); //push some data aka generate 4 distinct separate lines
        if (line === 0)
            lineChartData.labels.push(x); //adds x axis labels
    } //for x

    lineChartData.datasets[line].data = y; //send new line data to dataset
} //for line

ctx = document.getElementById("Chart1").getContext("2d");
myLineChart = new Chart(ctx).Line(lineChartData);

