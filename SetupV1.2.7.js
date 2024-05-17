var colors = {
    WHITE: "rgb(255, 255, 255)",
    GRAY: "rgb(204, 204, 204)",
    BLACK: "rgb(24, 39, 55)",
    BLUE: "rgb(67, 100, 227)",
    LIGHTBLUE: "rgb(79, 136, 197)",
    DARKBLUE: "rgb(0, 20, 60)",
    DARKBLUEGREEN: "rgb(15, 120, 105)",
    YELLOW: "rgb(255, 193, 7)",
    LIGHTYELLOW: "rgb(249, 255, 150)",
    DARKYELLOW: "rgb(170, 130, 5)",
    GREEN: "rgb(30, 220, 150)",
    TRANS_GREEN: "rgba(30, 220, 150, 0.5)",
    DARKGREEN: "rgb(20, 150, 100)",
    TRANSPARENT: "rgba(0, 0, 0, 0)"
};

var can, c, cells;
var celltype = 1;
var intype = 1;

var close;

var offx = 0, offy = 0, scale = 20;

var undos = [];
var redos = [];


// set up position and fading for controls on the edges
function finishSetup(addHandlers){
    var upcan = document.getElementById("pcontup");
    upcan.style.left = can.width / 2 - upcan.getBoundingClientRect().width / 2 + "px";
    var downcan = document.getElementById("pcontdown");
    downcan.style.right = upcan.style.left;

    var rightcan = document.getElementById("pcontright");
    rightcan.style.top = can.height / 2 - rightcan.getBoundingClientRect().height / 2 + "px";
    var leftcan = document.getElementById("pcontleft");
    leftcan.style.bottom = rightcan.style.top;

    if(!addHandlers){
        return;
    }
    window.addEventListener("mousemove", function(e){
        var ex = e.clientX;
        var ey = e.clientY;
        var dist = Math.min(window.innerHeight, window.innerWidth) / 7;

        var elts = [upcan, rightcan, downcan, leftcan/*, document.getElementById("scalars")*/];
        for(let i = 0; i < elts.length; i++){
            var b = elts[i].getBoundingClientRect();
            if(ey >= b.top && ey <= b.bottom && ex >= b.left && ex <= b.right){
                elts[i].style.opacity = 1;
            }
            else if(elts[i].dataset.solid == "true"){
                elts[i].style.opacity = 1;
            }
            else{
                var bmx = b.left + b.width / 2;
                var bmy = b.top + b.height / 2;
                elts[i].style.opacity = Math.max(Math.min(dist / Math.pyth(ex, ey, bmx, bmy), 0.8) - 0.2, 0.1);
            }
        }

        document.getElementById("centerbutton").addEventListener("click", center, false);

    }, false);
}


// set up appearance and function for controls on the edges
function finishSetup2(){
    var ctx, time = 0;

    document.getElementById("upadd").onclick = function(e){
        reundo(0);
        addrow(0);
    };
    document.getElementById("updel").onclick = function(e){
        reundo(0);
        removerow(0);
    };
    var upcan = document.getElementById("upcan");
    upcan.onmousedown = function(e){
        clearTimeout(time);
        offy += scale;
        checkOffsets();
        drawCells();
        time = setTimeout(arguments.callee, 40);
        return false;
    };

    ctx = upcan.getContext("2d");
    clear(ctx);
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.strokeStyle = colors.LIGHTBLUE;
    ctx.lineWidth = 2;
    ctx.moveTo(20, 5);
    ctx.lineTo(7, 15);
    ctx.lineTo(33, 15);
    ctx.closePath();
    ctx.stroke();

    document.getElementById("rightadd").onclick = function(e){
        reundo(0);
        addcol();
    };
    document.getElementById("rightdel").onclick = function(e){
        reundo(0);
        removecol();
    };
    var rightcan = document.getElementById("rightcan");
    rightcan.onmousedown = function(e){
        clearTimeout(time);
        offx -= scale;
        checkOffsets();
        drawCells();
        time = setTimeout(arguments.callee, 40);
        return false;
    };

    ctx = rightcan.getContext("2d");
    clear(ctx);
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.strokeStyle = colors.LIGHTBLUE;
    ctx.lineWidth = 2;
    ctx.moveTo(15, 20);
    ctx.lineTo(5, 7);
    ctx.lineTo(5, 33);
    ctx.closePath();
    ctx.stroke();

    document.getElementById("downadd").onclick = function(e){
        reundo(0);
        addrow();
    };
    document.getElementById("downdel").onclick = function(e){
        reundo(0);
        removerow();
    };
    var downcan = document.getElementById("downcan");
    downcan.onmousedown = function(e){
        clearTimeout(time);
        offy -= scale;
        checkOffsets();
        drawCells();
        time = setTimeout(arguments.callee, 40);
        return false;
    };

    ctx = downcan.getContext("2d");
    clear(ctx);
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.strokeStyle = colors.LIGHTBLUE;
    ctx.lineWidth = 2;
    ctx.moveTo(20, 15);
    ctx.lineTo(7, 5);
    ctx.lineTo(33, 5);
    ctx.closePath();
    ctx.stroke();

    document.getElementById("leftadd").onclick = function(e){
        reundo(0);
        addcol(0);
    };
    document.getElementById("leftdel").onclick = function(e){
        reundo(0);
        removecol(0);
    };
    var leftcan = document.getElementById("leftcan");
    leftcan.onmousedown = function(e){
        clearTimeout(time);
        offx += scale;
        checkOffsets();
        drawCells();
        time = setTimeout(arguments.callee, 40);
        return false;
    };

    ctx = leftcan.getContext("2d");
    clear(ctx);
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.strokeStyle = colors.LIGHTBLUE;
    ctx.lineWidth = 2;
    ctx.moveTo(5, 20);
    ctx.lineTo(15, 7);
    ctx.lineTo(15, 33);
    ctx.closePath();
    ctx.stroke();

    window.addEventListener("mouseup", function(e){
        clearTimeout(time);
        return false
    }, true);
}


// set up scaling adjustment bar
function handleScalar(){
    document.getElementById("zoomout").addEventListener("click", function(e){
        scalecan(-1);
        pos = Math.max(pos - 3, 7.5);
        draw();
    }, false);

    document.getElementById("zoomin").addEventListener("click", function(e){
        scalecan(1);
        pos = Math.min(pos + 3, 67.5);
        draw();
    }, false);

    var line = document.getElementById("line");
    var l = line.getContext("2d");

    var pi2 = Math.PI * 2;
    var pos = 37.5;
    var over = false;
    var down = false;

    var draw = function(){
        clear(l);
        l.beginPath();
        l.moveTo(7.5, 10);
        l.lineTo(67.5, 10);
        l.fillStyle = l.strokeStyle = colors.GRAY;
        l.stroke();

        l.beginPath();
        l.arc(37.5, 10, 2.5, 0, pi2);
        l.fill();

        l.beginPath();
        l.arc(pos, 10, 7.5, 0, pi2);
        if(down){
            l.fillStyle = colors.DARKYELLOW;
        }
        else if(over){
            l.fillStyle = colors.YELLOW;
        }
        else{
            l.fillStyle = colors.GREEN;
        }
        l.fill();
        l.strokeStyle = colors.DARKBLUE;
        l.stroke();
    };

    draw();

    var moveHandler = function(e){
        var x = e.clientX - line.getBoundingClientRect().left - 7.5;
        pos = Math.max(0, Math.min(x, 60)) + 7.5;
        draw();
        scalecan(x / 3 + 10, true);
        e.stopImmediatePropagation();
        return false;
    };

    var upHandler = function(e){
        down = false;
        var x = e.clientX - line.getBoundingClientRect().left;
        var y = e.clientY - line.getBoundingClientRect().top - 10;
        over = Math.pyth(x, y, pos, 0) <= 7.5;
        window.removeEventListener("mouseup", upHandler, false);
        window.removeEventListener("mousemove", moveHandler, false);
        draw();
        e.stopImmediatePropagation();
        return false;
    };

    line.addEventListener("mousedown", function(e){
        down = true;
        over = true;
        window.addEventListener("mouseup", upHandler, false);
        window.addEventListener("mousemove", moveHandler, false);
        line.style.cursor = "pointer";
        moveHandler(e);
        e.stopImmediatePropagation();
        return false;
    }, false);

    var overcheck = function(e){
        var x = e.clientX - line.getBoundingClientRect().left;
        var y = e.clientY - line.getBoundingClientRect().top - 10;
        over = Math.pyth(x, y, pos, 0) <= 7.5;
        if(over){
            line.style.cursor = "pointer";
        }
        else{
            line.style.cursor = "default";
        }
        draw();
    };

    line.addEventListener("mouseover", overcheck, false);
    line.addEventListener("mousemove", overcheck, false);

    line.addEventListener("mouseout", function(e){
        if(!down){
            over = false;
            draw();
        }
        e.stopImmediatePropagation();
        return false;
    }, false);

    line.addEventListener("dblclick", function(e){
        e.stopImmediatePropagation();
        return false;
    }, true);
}


// set up undo and redo buttons
function doButtons(){
    var undoelt = document.getElementById("undo");
    var redoelt = document.getElementById("redo");
    var undo = undoelt.getContext("2d");
    var redo = redoelt.getContext("2d");

    undo.strokeStyle = redo.strokeStyle = colors.WHITE;
    undo.lineCap = redo.lineCap = "butt";
    undo.lineWidth = redo.lineWidth = 3;

    undo.beginPath();
    undo.arc(12, 12, 6, Math.PI, Math.PI * 0.5);
    undo.moveTo(3, 10);
    undo.lineTo(6, 13);
    undo.lineTo(9, 10);
    undo.stroke();

    redo.beginPath();
    redo.arc(12, 12, 6, Math.PI * 0.5, Math.PI * 2);
    redo.moveTo(21, 10);
    redo.lineTo(18, 13);
    redo.lineTo(15, 10);
    redo.stroke();


    undoelt.addEventListener("click", function(){reundo(-1);}, false);
    redoelt.addEventListener("click", function(){reundo(1);}, false);
}


// set up option for selection of cell fill type
function setupcelltype(){
    var ct = document.getElementById("celltype");
    var cellicon = document.getElementById("cellicon").getContext("2d");
    var cellselect = document.getElementById("cellselect");
    var selections = document.getElementsByClassName("cellselection");
    var cda = document.getElementById("celldesca");
    var cdb = document.getElementById("celldescb");

    var md = document.getElementById("menudarkener");
    ct.addEventListener("click", function(){
        cellselect.style.display = "block";
        md.style.display = "block";
        cellselect.style.opacity = 1;
        md.style.opacity = 0.5;
    }, false);


    var selA = 1;
    var selB = 0;

    var draw = function(){
        for(let i = 0; i < 8; i++){
            var s = selections[i];
            var sc = s.getContext("2d");
            clear(sc);
            var t = types[i];
            if(s.dataset.data == "2"){
                t += selA;
            }
            square(sc, 5, 5, t, 20, true);
            if(s.dataset.selected == "1"){
                sc.lineWidth = 2;
                sc.strokeStyle = colors.LIGHTYELLOW;
                sc.strokeRect(4, 4, 22, 22);
            }
        }
        square(cellicon, 39, 39, celltype, 30);
        //celldesc.innerHTML = descs[celltype];
    };

    var func1 = function(){
        for(let i = 0; i < 4; i++){
            selections[i].dataset.selected = "0";
        }
        if(celltype == 0){
            selections[7].dataset.selected = "0";
            selections[selB + 4].dataset.selected = "1";
            cdb.innerHTML = selections[selB + 4].title;
        }
        this.dataset.selected = "1";
        cda.innerHTML = this.title;
        selA = parseInt(this.dataset.type);
        celltype = selA + selB;
        draw();
        fillarea();
    };

    var func2 = function(){
        for(let i = 4; i < 8; i++){
            selections[i].dataset.selected = "0";
        }
        if(celltype == 0){
            selections[0].dataset.selected = "1";
            cda.innerHTML = selections[0].title;
        }
        this.dataset.selected = "1";
        cdb.innerHTML = this.title;
        selB = parseInt(this.dataset.type);
        celltype = selA + selB;
        draw();
        fillarea();
    };

    var func3 = function(){
        for(let i = 0; i < 7; i++){
            selections[i].dataset.selected = "0";
        }
        cda.innerHTML = "Empty";
        cdb.innerHTML = "";
        selA = 1;
        this.dataset.selected = "1";
        celltype = 0;
        draw();
        fillarea();
    };

    var types = [1, 4, 7, 10, 0, 1, 2, 0];
    var datas = [1, 1, 1, 1, 2, 2, 2, 3];
    var descs = ["Regular", "Upgraded", "MKII", "MKII Upgraded", "Basic", "Combo", "Engine", "Empty"];
    var funcs = [func1, func2, func3];

    for(let i = 0; i < 8; i++){
        var s = selections[i];
        s.dataset.type = types[i];
        s.dataset.data = datas[i];
        s.dataset.selected = "0";
        s.title = descs[i];
        s.width = 30;
        s.height = 30;


        s.addEventListener("mouseover", function(){
            draw();
            var sc = this.getContext("2d");
            sc.fillStyle = colors.TRANS_GREEN;
            sc.fillRect(6, 6, 18, 18);
        }, false);
        s.addEventListener("mouseout", function(){
            draw();
        }, false);

        s.addEventListener("click", funcs[datas[i] - 1], false);
    }

    selections[0].dataset.selected = "1";
    selections[4].dataset.selected = "1";

    draw();

    window.addEventListener("mousewheel", function(e){
        var t = (celltype + 13 + Math.sign(e.deltaY)) % 13;

        if(t == 0){
            document.getElementById("cellgroupempty").firstElementChild.click();
        }
        else{
            document.getElementById("cellgroupcolor").children[Math.floor((t - 1) / 3)].click();
            document.getElementById("cellgrouptype").children[(t - 1) % 3].click();
        }
        return false;
    }, true);
}


// set up filebox open and close functions
function handleFile(){
    var box = document.getElementById("filemenu");
    var md = document.getElementById("menudarkener");
    var jsonin = document.getElementById("filebuttonopenmenujsoninput");

    var open = function(){
        box.style.display = "block";
        md.style.display = "block";
        box.style.opacity = 1;
        md.style.opacity = 0.5;
        box.style.width = "300px";
        box.style.height = "300px";

        var blobfile = new Blob([btoa(JSON.stringify(trim(cells)))], {type: ".shipdesign"});
        document.getElementById("downloadshipdesign").href = URL.createObjectURL(blobfile);
        prepareImageDownload();

        return false;
    };

    close = function(){
        setTimeout(function(){
            box.style.display = "none";
            md.style.display = "none";
            jsonin.style.display = "none";
            document.getElementById("cellselect").style.display = "none";
        }, 100);
        box.style.opacity = 0;
        md.style.opacity = 0;
        jsonin.style.opacity = 0;
        document.getElementById("cellselect").style.opacity = 0;
        box.style.width = "0px";
        box.style.height = "0px";
        return false;
    };

    md.addEventListener("click", close, true);
    document.getElementById("file").addEventListener("click", open, true);
    //open();

    handleFile2();
}


// set up file menu control functions.
function handleFile2(){
    var buttons = document.getElementById("filesidebar").children;
    var menus = document.getElementsByClassName("filesubmenu");
    var md = document.getElementById("menudarkener");

    var selected = "filebuttonnewmenu";
    for(let i = 0; i < buttons.length; i++){
        buttons[i].addEventListener("click", function(){
            for(let j = 0; j < menus.length; j++){
                menus[j].style.display = "none";
            }
            selected = this.id + "menu";
            document.getElementById(selected).style.display = "block";
        }, false);

        buttons[i].addEventListener("mouseover", function(){
            for(let j = 0; j < menus.length; j++){
                menus[j].style.display = "none";
            }
            document.getElementById(this.id + "menu").style.display = "block";
        }, false);

        buttons[i].addEventListener("mouseout", function(){
            for(let j = 0; j < menus.length; j++){
                menus[j].style.display = "none";
            }
            document.getElementById(selected).style.display = "block";
        }, false);
    }

    var fbnm = menus[0];
    var fbnmlabels = fbnm.getElementsByTagName("label");
    var fbnminputs = fbnm.getElementsByTagName("input");
    for(let i = 0; i < fbnmlabels.length; i++){
        fbnmlabels[i].addEventListener("click", function(){
            document.getElementById("filebuttonnewmenu" + this.getAttribute("for")).select();
        }, false);

        fbnminputs[i].addEventListener("click", fbnminputs[i].select, true);
    }

    var fbnmw = document.getElementById("filebuttonnewmenuw");
    var fbnmh = document.getElementById("filebuttonnewmenuh");
    var fbnmt = document.getElementById("filebuttonnewmenutype");

    fbnmw.addEventListener("keypress", function(e){
        if(e.keyCode == 13){
            fbnmw.value = parseInt(fbnmw.value) || 15;
            fbnmh.select();
        }
    }, false);
    fbnmh.addEventListener("keypress", function(e){
        if(e.keyCode == 13){
            fbnmh.value = parseInt(fbnmh.value) || 15;
            fbnmt.select();
        }
    }, false);
    fbnmt.addEventListener("keypress", function(e){
        if(e.keyCode == 13){
            fbnmt.value = parseInt(fbnmt.value) || 0;
            reundo(0);
            cells = makeCells(fbnmw.value, fbnmh.value, parseInt(fbnmt.value));
            selection = makeCells(cells.length, cells[0].length);
            close();
            drawCells();
            center();
        }
    }, false);

    document.getElementById("filebuttonnewmenubutton").addEventListener("click", function(){
        reundo(0);
        cells = makeCells(fbnmw.value, fbnmh.value, parseInt(fbnmt.value));
        selection = makeCells(cells.length, cells[0].length);
        close();
        drawCells();
        center();
    }, false);


    var finput = document.getElementById("filebuttonopenmenuupload");
    finput.addEventListener("change", function(e){
        var place = finput.value.length - finput.value.split("").reverse().join("").indexOf(".");
        var type = finput.value.substring(place, finput.value.length).toLowerCase();
        if(!["shipdesign", "txt", "text", "json"].includes(type)){
            if(!confirm("You have not entered a .shipdesign file. You might cause an error.\nContinue?")){
                finput.value = "";
                return false;
            }
        }

        var fr = new FileReader();
        fr.onload = function(){
            var tempcells = cells;
            try{
                var val = fr.result;
                if(type !== "json"){
                    val = atob(val);
                }
                cells = JSON.parse(val.replace(/-1/g, "0"));
                selection = makeCells(cells.length, cells[0].length);
                drawCells();
                close();
            }
            catch(e){
                alert(e);
                cells = tempcells;
                drawCells();
            }
            finally{
                finput.value = "";
                center();
            }
        };
        fr.readAsText(finput.files[0]);
    }, false);


    var jsonb = document.getElementById("filebuttonopenmenujson");
    var jsonin = document.getElementById("filebuttonopenmenujsoninput");
    var jsontxt = jsonin.children[0];
    var jsoneb = jsonin.children[1];

    jsonb.addEventListener("click", function(){
        jsonin.style.display = "block";
        jsonin.style.opacity = 1;
    }, true);

    jsoneb.addEventListener("click", function(){
        var tempcells = cells;
        try{
            reundo(0);
            cells = JSON.parse(jsontxt.value);
            selection = makeCells(cells.length, cells[0].length);
        }
        catch(e){
            alert(e);
            cells = tempcells;
        }
        finally{
            close();
            center();
        }
    }, true);
}


// set up bottom open and close button
function setupbottom(){
    var b = document.getElementById("bottom");
    var closed = true;
    var rightcan = document.getElementById("pcontright").style;
    var leftcan = document.getElementById("pcontleft").style;
    b.addEventListener("click", function(e){
        var mid = document.getElementById("middle").style;
        if(closed){
            b.style.bottom = "0px";
            mid.bottom = "100px";
            document.getElementById("bottomtext").innerText = "Hide cell counts";
            //rightcan.top = parseFloat(rightcan.top) - 30 + "px";
            //leftcan.bottom = parseFloat(leftcan.bottom) - 30 + "px";
        }
        else{
            b.style.bottom = "-80px";
            mid.bottom = "20px";
            document.getElementById("bottomtext").innerText = "Show cell counts";
            //rightcan.top = parseFloat(rightcan.top) + 30 + "px";
            //leftcan.bottom = parseFloat(leftcan.bottom) + 30 + "px";
        }
        localStorage.bottomClosed = closed;
        closed = !closed;
        var runs = 0;
        var tempint = setInterval(function(){
            var b = document.getElementById("middle").getBoundingClientRect();
            can.height = b.height;
            drawCells();
            var rightcan = document.getElementById("pcontright");
            rightcan.style.top = can.height / 2 - rightcan.getBoundingClientRect().height / 2 + "px";
            var leftcan = document.getElementById("pcontleft");
            leftcan.style.bottom = rightcan.style.top;
            offy += closed ? 4 : -4;

            runs++;
            if(runs == 10){
                clearInterval(tempint);
            }
        }, 20);
    }, false);

    if(localStorage.bottomClosed !== undefined){
        if(localStorage.bottomClosed != "false"){
            b.click();
        }
    }
}


// set up the #selectionoptions menu
function setupselectionoptions(){
    var options = document.getElementsByClassName("slider");
    for(let i = 0; i < options.length; i++){
        options[i].addEventListener("click", function(e){
            if(this.classList.contains("selected")){
                this.classList.remove("selected");
                window[this.dataset.property] = false;
                localStorage[this.dataset.property] = "false";
            }
            else{
                this.classList.add("selected");
                window[this.dataset.property] = true;
                localStorage[this.dataset.property] = "true";
            }
            return false;
        }, false);
        if(localStorage[options[i].dataset.property] == "true"){
            options[i].click();
        }

        options[i].style.top = i % 3 * 26 + "px";
        if(i > 2){
            options[i].style.left = "176px";
        }
        window[options[i].dataset.property] = options[i].classList.contains("selected");
    }
}