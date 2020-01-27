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
    h +='</td><td id="rocTd" style="vertical-align:top">(ROC will be ploted here)</td></tr></table>'
    h +='<input id="fileInput" type="file" style="color:blue"> <span style="color:orange">(under development)</span>'
    //h +='<div class="boxPicker" style="height:600px"></div>'
    div.innerHTML=h

    if(location.search.length>3){
        let url=location.search.slice(1)
        fetch(url).then(f=>f.text().then(txt=>{
            rocData.value=txt
            roc.runText()
        }))
    }


    let ip = document.getElementById('fileInput')
    ip.onchange=ev=>{
        var reader = new FileReader();
        reader.onload = function(){
          rocData.value = reader.result.trim();
          roc.runText()
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

roc.runText=(txt=rocData.value)=>{ // default points ti UP element
    roc.data={
        obs:[],
        pred:[]
    }
    txt.split(/[\r\n]+/).forEach((row,i)=>{
        row=row.split(',')
        roc.data.obs[i]=parseFloat(row[0])
        roc.data.pred[i]=parseFloat(row[1])
    })
    roc.data.th=roc.data.pred.sort() // all the thresholds to try
    const count=x=>x.reduce((a,b)=>a+b)
    roc.truePos=[]
    roc.falsePos=[]
    roc.trueNeg=[]
    roc.falseNeg=[]
    //let thPreds=roc.th.map((t,i)=>roc.data.pred[i]>t)
    //debugger
}

if(typeof(define)!="undefined"){
    define(roc)
}else if(typeof(window)!="undefined"){
    window.roc=roc
}
