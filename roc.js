console.log('roc.js loaded');
console.log('online tool available at https://episphere.github.io/roc');

const roc={}

roc.ui=function(div){ // called onload by the reference web application
    div = div||document.createElement('div')
    if(typeof(div)=='string'){div=document.getElementById(div)}
    roc.div=div
    console.log('assembling UI at ',div)
    // populate div
    // note demo points to D1 test data set produced as per https://cran.r-project.org/web/packages/plotROC/vignettes/examples.html
    let h = '<h3>Data</h3>'
    h +='<p>Provide data in two columns, [observed (0/1),predicted (numeric)] (<a href="?D1.csv">demo1</a>, <a href="?D2.csv">demo2</a>, borrowed from R\'s <a href="http://www.biosoft.hacettepe.edu.tr/easyROC/" target="_blank">easyROC</a> . Predicted is a number, typically between 0 and 1 indicating the cumulative probablity of a positive prediction, but can just as well be any number that evolves monotonically with the positive prediction. It can be, for example, the activation value of the output of a neural network.</p>'
    h +='<table><tr><td>'
    h +='<textarea id="rocData" style="height:500px;width:150px;font-size:small"></textarea>'
    h +='</td><td id="rocTd" style="vertical-align:top"><div id="plotDiv">(ROC will be ploted here)</div></td></tr></table>'
    h +='<input id="fileInput" type="file" style="color:blue"> <input type="range"> <span style="color:silver">(under development)</span>'
    //h +='<div class="boxPicker" style="height:600px"></div>'
    div.innerHTML=h

    if(location.search.length>3){
        let url=location.search.slice(1)
        fetch(url).then(f=>f.text().then(txt=>{
            rocData.value=txt
            roc.parseText()
        }))
    }


    let ip = document.getElementById('fileInput')
    ip.onchange=ev=>{
        var reader = new FileReader();
        reader.onload = function(){
          rocData.value = reader.result.trim();
          roc.parseText()
        };
        reader.readAsText(ip.files[0]);
    }


    // Box
    /*
    (new Box.FilePicker()).show(false, '123', {
        container: '#boxPicker'
    });
    */

    return div
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
    })
    let threshhold = roc.data.th=[...roc.data.pred].sort((a,b)=>(a>b? 1 : -1)) // all the thresholds to try

    roc.data.truePosCount=[]
    roc.data.trueNegCount=[]
    roc.data.falsePosCount=[]
    roc.data.falseNegCount=[]
    roc.data.th.forEach((t,i)=>{
//             const count=x=>x.reduce((a,b)=>a+b)
        let pos=[]
        let neg=[]
        let idk= roc.data.pred.map(p=>p>=t ? pos.push(p) : neg.push(p))
        let truePos=pos.map((ps,i)=>(ps&roc.data.obs[i]))
        let falsePos=pos.map((ps,i)=>(ps&(!roc.data.obs[i])))
        let falseNeg=neg.map((ns,i)=>(ns&(!roc.data.obs[i])))
        let trueNeg=neg.map((ns,i)=>(ns&(roc.data.obs[i])))
        roc.data.truePosCount[i]=truePos.length
        roc.data.falsePosCount[i]=falsePos.length
        roc.data.falseNegCount[i]=falseNeg.length
        roc.data.trueNegCount[i]=trueNeg.length
    })
    n = roc.data.obs.reduce((a,b)=>a+b) // # positive observations
    roc.data.falsePosRate=[1].concat(roc.data.falsePosCount.map(d=>d/n))
    roc.data.truePosRate=[1].concat(roc.data.truePosCount.map(d=>d/n))
    // calculate AUC
    let dxdy=[]
    for(var j=1; j<roc.data.truePosRate.length ; j++){
        dxdy[j-1]=roc.data.truePosRate[j]*(roc.data.falsePosRate[j-1]-roc.data.falsePosRate[j])
    }
    roc.data.auc=dxdy.reduce((a,b)=>a+b)
    roc.data.auc=Math.round(roc.data.auc*10000)/10000 // rounding to 4 digits
    if(typeof(plotDiv)!="undefined"){
        roc.plotDiv(plotDiv)
    }   

    document.getElementById("tp").innerHTML= roc.data.truePosCount.length;
    document.getElementById("fp").innerHTML= roc.data.falsePosCount.length;
    document.getElementById("tn").innerHTML=roc.data.trueNegCount.length;
    document.getElementById("fn").innerHTML=roc.data.falseNegCount.length;
}

roc.plotDiv=(div)=>{
    if(typeof(div)=='string'){
        div=document.getElementById(div)
    }
    roc.div=div
    div.innerHTML='' // clear
    div.style.width=div.style.height=500
    if(typeof(Plotly)=='undefined'){ // if Plotly not loaded already, do it now
        s=document.createElement('script')
        s.src="https://cdn.plot.ly/plotly-latest.min.js"
        s.onload=_=>{roc.plotDiv(div)}
        document.head.appendChild(s)
    }else{
        // ploting line chart with Plotly
        // https://plot.ly/javascript/line-charts/
        let xyROC = {
            x: roc.data.falsePosRate,
            y: roc.data.truePosRate,
            z: roc.data.th,
            fill: 'tonexty',
            fillcolor:'#85C1E9'
        };
        let layout = {
          title: `Receiver Operating Characteristic, AUC: ${roc.data.auc}`,
          xaxis: {
            title: 'false positive rate',
            range:[0,1],
            linecolor: 'black',
            mirror: true,
            fixedrange: true,
            showspikes: true
          },
          yaxis: {
            title: 'true positive rate',
            range:[0,1],
            linecolor: 'black',
            mirror: true,
            fixedrange: true,
            showspikes: true
          },
          plot_bgcolor: '#F2F4F4'
        };
        Plotly.newPlot(div, [xyROC],layout);
    }
}

if(typeof(define)!="undefined"){
    define(roc)
}

function updateSlider(){
     document.getElementById("slider").setAttribute("min", Math.min(...roc.data.th))
     document.getElementById("slider").setAttribute("max", Math.max(...roc.data.th))
     document.getElementById("slider").setAttribute("value", median(roc.data.th))
     trace1.y = document.getElementById("slider").value
    
}

function median(numbers) {
    var median = 0, numsLen = numbers.length;
    numbers.sort();
    if (
        numsLen % 2 === 0 
    ) {
        median = (numbers[numsLen / 2 - 1] + numbers[numsLen / 2]) / 2;
    } else { 
      median = numbers[(numsLen - 1) / 2];
    }
    return median;
}


const trace1 = {

}



const data = [trace1]
Plotly.newPlot('rocTd', data)