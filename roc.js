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
        let h = ':-)'
        h +=''
        div.innerHTML=h

        return div
    }

    if(typeof(define)!="undefined"){
        define(roc)
    }else if(typeof(window)!="undefined"){
        window.roc=roc
    }

})()
