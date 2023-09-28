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
    h +='<p>Provide data in two columns, [observed (0/1),predicted (numeric)], or try with test data <a href="?D1.csv">demo1</a> and <a href="?D2.csv">demo2</a> borrowed from R\'s <a href="http://biosoft.erciyes.edu.tr/app/easyROC/" target="_blank">easyROC</a>. Predicted is a number, typically between 0 and 1 indicating the cumulative probablity of a positive prediction, but can just as well be any number that evolves monotonically with the positive prediction. It can be, for example, the activation value of the output of a neural network.</p>'
    h +='<table><tr><td>'
    h +='<textarea id="rocData" style="height:500px;width:150px;font-size:small"></textarea>'
    h +='</td><td id="rocTd" style="vertical-align:top"><div id="plotDiv">(ROC will be ploted here)</div></td><td id="confusion">...</td></tr></table>'
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
// add confusion table
    let cf =div.querySelector('#confusion')

    cf.innerHTML=`
    <h5 style="color:black">Confusion table</h5>
    <p>
    Segmentation: <input id="segValue" size=10>
    <br><input id="segRange" type="range" style="width:100%" min=0 max=100>
    </p>
    <table>
    <tr><td></td><td align="left:middle">Predicted</td></tr>
    <tr><td id="observedLabel" style="transform: rotate(-90deg);vertical-align:bottom;max-width:4em">Observed<br>&nbsp;</td><td>
        <table style="border:solid">
        <tr><td id="totalCount" align="center" style="border:solid">total</td><td align="center">true</td><td align="center">false</td></tr>
        <tr><td align="right">true</td><td style="background-color:silver" align="center" id="truePos">true positives</td><td style="background-color:silver" align="center" id="falseNeg">false negatives</td></tr>
        <tr><td align="right">false</td><td style="background-color:silver" align="center" id="falsePos">false positives</td><td style="background-color:silver" align="center" id="trueNeg">true negatives</td></tr>
        </table>
    </td></tr>
    </table>`
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
    p = roc.data.obs.reduce((a,b)=>b===1 ? a+1 : a, 0) // # positive observations
    n = roc.data.obs.reduce((a,b)=>b===0 ? a+1 : a, 0) // # negative observations
    roc.data.truePosRate=roc.data.truePosCount.map(d=>d/p)
    roc.data.falsePosRate=roc.data.falsePosCount.map(d=>d/n)
    // calculate AUC
    let dxdy=[]
    for(var j=0; j<roc.data.truePosRate.length-1 ; j++){
        dxdy[j]=roc.data.truePosRate[j]*(roc.data.falsePosRate[j]-roc.data.falsePosRate[j+1])
    }
    roc.data.auc=dxdy.reduce((a,b)=>a+b)
    roc.data.auc=Math.round(roc.data.auc*10000)/10000 // rounding to 4 digits
    if(typeof(plotDiv)!="undefined"){
        roc.plotDiv(plotDiv)
    }
    // set median as the default segmentation value
    //document.body.querySelector('#segValue').value=roc.data.th[Math.round(roc.data.th.length/2)]
    document.body.querySelector('#segValue').value=roc.data.th[roc.data.n-roc.data.obs.reduce((a,b)=>a+b)]
    //connect to slider
    let segValue = document.body.querySelector('#segValue')
    let segRange = document.body.querySelector('#segRange')
    segRange.max=roc.data.th[roc.data.th.length-1]
    segRange.min=roc.data.th[0]
    segRange.step=(parseFloat(segRange.max)-parseFloat(segRange.min))/200
    segRange.value=segValue.value
    segRange.oninput=function(){
        segValue.value=segRange.value
        fillConfusion()
    }
    segValue.onchange=function(){
        segRange.value=segValue.value
    }
}

function fillConfusion(){
    let cf =roc.div.parentElement.parentElement.querySelector('#confusion')
    roc.data.n = roc.data.th.length
    cf.querySelector('#totalCount').innerHTML=`${roc.data.n}<br><span style="font-size:x-small"></span>`
    let v = parseFloat(cf.querySelector('input').value)
    let pred = roc.data.pred.map(x=>(x>v)*1)
    let obs = roc.data.obs
    //let pos = obs.reduce((a,b)=>a+b)
    //let neg = obs.map(x=>!x).reduce((a,b)=>a+b)
    let tp = obs.map((x,i)=>((x)&(pred[i]))).reduce((a,b)=>(a+b))
    let fp = obs.map((x,i)=>((!x)&(pred[i]))).reduce((a,b)=>(a+b))
    let tn = obs.map((x,i)=>((!x)&(!pred[i]))).reduce((a,b)=>(a+b))
    let fn = obs.map((x,i)=>((x)&(!pred[i]))).reduce((a,b)=>(a+b))
    cf.querySelector('#truePos').innerHTML=`${tp}<br><span style="font-size:x-small">(${Math.round(100*tp/(tp+fn))}%)</span>`
    cf.querySelector('#falseNeg').innerHTML=`${fn}<br><span style="font-size:x-small">(${Math.round(100*fn/(tp+fn))}%)</span>`
    cf.querySelector('#falsePos').innerHTML=`${fp}<br><span style="font-size:x-small">(${Math.round(100*fp/(fp+tn))}%)</span>`
    cf.querySelector('#trueNeg').innerHTML=`${tn}<br><span style="font-size:x-small">(${Math.round(100*tn/(fp+tn))}%)</span>`
    /*
    console.log({
        tp:tp,
        fn:fn,
        fp:fp,
        tn:tn
    })
    */
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
            name:'true positive',
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

    // Fill confusion matrix
    let cf =roc.div.parentElement.parentElement.querySelector('#confusion')
    roc.data.n = roc.data.th.length
    
    fillConfusion()
    cf.querySelector('input').onkeyup=fillConfusion
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
