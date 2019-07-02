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
        let h = '<h3>Data</h3>'
        h +='<p>Provide data in two columns, [observed (0/1),predicted (numeric)] (<a href="?D1.csv">demo</a>). Predicted is a number typically between 0 and 1 indicating the cumulative probablity of a positive prediction, but can also be any number that evolves monotonically with a positive prediction. It can be, for example, the activation value of the output of a neural network.</p>'
        h +='<textarea id="rocData" style="height:500px;width:100px"></textarea>'
        div.innerHTML=h

        if(location.search.length>3){
            let url=location.search.slice(1)
            fetch(url).then(f=>f.text().then(txt=>{
                debugger
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
