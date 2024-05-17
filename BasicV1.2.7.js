// produce error message
/*onerror = function(e){
    console.error(e);
    document.getElementById("out").style.display = "block";
    setTimeout(function(){document.getElementById("out").style.display = "none";}, 4000);
}*/


// handle resizing of page
onresize = function(){
    var b = document.getElementById("middle").getBoundingClientRect();
    can.width = b.width;
    can.height = b.height;

    c.lineWidth = scale / 5;
    c.miterLimit = 3;
    c.font = Math.max(scale * 0.7, 8) + "px arial";

    center();
    finishSetup();
};


// set up everything when the page loads
document.onreadystatechange = function(){
    if(document.readyState !== "interactive"){
        return;
    }
    square.fills = [colors.BLACK, colors.GRAY, colors.YELLOW, colors.LIGHTYELLOW, colors.GREEN];
    document.getElementById("out").style.display = "none";

    cells = makeCells(15, 15);
    selection = makeCells(15, 15);
    can = document.getElementById("ship-designer-canvas");
    c = can.getContext("2d");
    dispatchEvent(new CustomEvent("resize"));
    window.addEventListener("keypress", function(e){
        e = e || window.event;
        if([26, 122, 90].includes(e.keyCode) && (e.ctrlKey || e.metaKey)){
            if(e.shiftKey){
                reundo(1);
            }
            else{
                reundo(-1);
            }
            return false;
        }
    });

    window.addEventListener("keyup", function(e){
        e = e || window.event;
        if(e.keyCode === 27){
            close();
        }
    });

    plusconts = document.getElementsByClassName("plus");
    for(let i = 0; i < plusconts.length; i++){
        drawAdjuster(0, 0, 1, plusconts[i].getContext("2d"), true, true);
    }

    var minusconts = document.getElementsByClassName("minus");
    for(i = 0; i < minusconts.length; i++){
        drawAdjuster(0, 0, 0, minusconts[i].getContext("2d"), true, true);
    }

    finishSetup(true);
    finishSetup2();
    handleScalar();
    handleFile();
    doButtons();
    setupcelltype();
    setupbottom();
    setupmodes();
    setupselectionoptions()
};