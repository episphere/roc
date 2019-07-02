console.log('roc.js loaded');
console.log('online tool available at https://episphere.github.io/roc');


(function(){ // anonymous function to keep scope untouched unless called (not required) from browser 
    const roc={}

    roc.ui=function(div){
        // what div is this about?
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
        h +='<input type="file" style="color:blue"> <span style="color:orange">(under development)</span>'
        div.innerHTML=h

        if(location.search.length>3){
            let url=location.search.slice(1)
            fetch(url).then(f=>f.text().then(txt=>{
                rocData.value=txt
                //debugger
            }))
        }

        return div
    }

    if(typeof(define)!="undefined"){
        define(roc)
    }else if(typeof(window)!="undefined"){
        window.roc=roc
    }

})()
