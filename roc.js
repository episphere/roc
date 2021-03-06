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
    h +='<span style="font-size:small">'
    h +='<input id="fileInput" type="file" style="color:blue">'
    h +='<button id="plotData" type="button" style="color:blue" onclick="roc.parseText()">Plot</button> '
    h +='<button id="downloadData" type="button" style="color:blue">Download</button><input id="fileName" value="ROC.json" style="color:green" size=10> <sup><a href="https://episphere.github.io/plot" target="_blank">csv</a></sup>'
    h +='</span>'
    
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

    let downld = document.getElementById('downloadData')
    downld.onclick=function(){
        roc.saveFile(JSON.stringify(roc.plotData),fileName.value)
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
    roc.data.th=[...roc.data.pred].sort((a,b)=>(a>b? 1 : -1)) // all the thresholds to try
    const count=x=>x.reduce((a,b)=>a+b)
    roc.data.truePosCount=[]
    roc.data.falsePosCount=[]
    roc.data.th.forEach((t,i)=>{
        let pos=roc.data.pred.map(p=>p>=t)
        let truePos=pos.map((ps,i)=>(ps&roc.data.obs[i]))
        let falsePos=pos.map((ps,i)=>(ps&(!roc.data.obs[i])))
        roc.data.truePosCount[i]=count(truePos)
        roc.data.falsePosCount[i]=count(falsePos)
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
            name:'ROC',
            fill: 'tonexty',
            fillcolor:'rgba(133,193,233,0.5)'
        };
        let thROC = {
            x: roc.data.falsePosRate,
            y: roc.data.th,
            name:'segmentation',
            yaxis:'y2',
            mode: 'markers',
            marker:{
                color:'rgba(128,0,0,0.4)',
                size:5
            }
        };
        let layout = {
          title: `Receiver Operating Characteristic, AUC: ${roc.data.auc}`,
          xaxis: {
            title: 'false positive rate',
            range:[0,1],
            linecolor: 'black',
            mirror: true,
            fixedrange: true,
            showspikes: true,

          },
          yaxis: {
            title: 'true positive rate',
            titlefont: {color: 'navy'},
            range:[0,1],
            linecolor: 'black',
            mirror: true,
            fixedrange: true,
            showspikes: true
          },
          yaxis2: {
              title:'segmentation value (&#9679;)',
              titlefont: {
                  color: 'maroon',
                  size:12
              },
              tickfont: {
                  color: 'maroon',
                  size:12
              },
              overlaying: 'y',
              side: 'right',
              showgrid:false,
              zeroline: false,
              mirror: true,
              fixedrange: true,
          },
          showlegend:false,
          plot_bgcolor: '#F2F4F4'
        };
        roc.plotData={traces:[xyROC,thROC],layout:layout}
        Plotly.newPlot(div, roc.plotData.traces,layout);
    }
}

roc.saveFile=function(x,fileName) { // x is the content of the file
    var bb = new Blob([x]);
    var url = URL.createObjectURL(bb);
    var a = document.createElement('a');
    a.href=url;
    a.download=fileName
    a.click() // then download it automatically 
    return a
}

if(typeof(define)!="undefined"){
    define(roc)
}
