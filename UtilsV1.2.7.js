// average
Math.avg = function(){
    var sum = 0;
    for(let i = 0; i < arguments.length; i++){
        sum += arguments[i];
    }
    return sum / arguments.length;
};

// pythagorean
Math.pyth = function(x1, y1, x2, y2){
    return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
};

// vectoring
Math.vector = function(x1, y1, x2, y2){
    var x = x1 - x2;
    var hyp = Math.pyth(x1, y1, x2, y2);
    if(y1 < y2){
        return Math.acos(x / hyp) * -1 + Math.PI
    }
    return Math.acos(x / hyp) || 0;
};


// center grid on screen
function center(){
    var b = document.getElementById("middle").getBoundingClientRect();
    offx = b.width / 2 - cells.length * scale / 2;
    offy = b.height / 2 - cells[0].length * scale / 2;
    drawCells(c, cells);
}


// erase canvas content
function clear(c){
    var can = c.canvas;
    c.save();
    c.setTransform(1, 0, 0, 1, 0, 0);
    c.globalCompositeOperation = "copy";
    c.fillStyle = colors.TRANSPARENT;
    c.fillRect(0, 0, can.width, can.height);
    c.restore();
}


// draw frame/border for cells
function frame(c, x, y, scale){
    scale = scale || window.scale;
    c.save();
    c.beginPath();
    c.fillStyle = colors.LIGHTBLUE;
    c.fillRect(x, y, scale, scale);
    c.closePath();
    c.beginPath();

    c.fillStyle = colors.BLACK;
    c.fillRect(x, y, 1, 1);
    c.fillRect(x, y + scale - 1, 1, 1);
    c.fillRect(x + scale - 1, y, 1, 1);
    c.fillRect(x + scale - 1, y + scale - 1, 1, 1);

    c.fill();
    c.restore();
}


// draw cell
function square(c, x, y, type, scale, drawFrame){
    type = type.toString();
    var text = type.indexOf("+") !== -1 ? type.split("+").slice(1).join("+") : "";
    type = parseInt(type);
    scale = scale || window.scale;
    if(type >= 100 && type < 105){
        if(!drawFrame){
            frame(c, x, y, scale);
        }
        type = type.toString();
        var grad = c.createRadialGradient(x + scale / 2, y + scale / 2, scale / 3, x + scale / 2, y + scale / 2, scale / 2);
        grad.addColorStop(0, colors.BLUE);
        grad.addColorStop(1, square.fills[type[2]]);
        c.fillStyle = grad;
        c.fillRect(x + 1, y + 1, scale - 2, scale - 2);
    }
    if(type <= 12 && type >= 0){
        if(!drawFrame){
            frame(c, x, y, scale);
        }
        c.save();
        c.beginPath();
        c.moveTo(x + 1, y + 1);
        c.fillStyle = square.fills[Math.ceil(type / 3)];
        c.fillRect(x + 1, y + 1, scale - 2, scale - 2);

        if(type == 3){
            c.fillStyle = colors.BLUE;
        }

        if(type == 0){
        }
        else if(type % 3 == 2){
            c.beginPath();
            c.fillStyle = colors.BLUE;
            c.moveTo(x + scale - 1, y + scale - 1);
            c.lineTo(x + 1, y + scale - 1);
            c.lineTo(x + scale - 1, y + 1);
        }
        else if(type % 3 == 0){
            var a = scale / 5;
            var b = scale / 8;
            c.moveTo(x + b, y + a);
            c.lineTo(x + a, y + b);
            c.lineTo(x + scale - a, y + b);
            c.lineTo(x + scale - b, y + a);
            c.lineTo(x + scale - b, y + scale - a);
            c.lineTo(x + scale - a, y + scale - b);
            c.lineTo(x + a, y + scale - b);
            c.lineTo(x + b, y + scale - a);
            c.fillStyle = colors.BLUE;
        }
        c.closePath();
        c.fill();
        c.restore();
    }
    if(text.length){
        c.lineWidth = scale / 10;
        c.miterLimit = 3;
        c.strokeStyle = colors.DARKBLUE;
        c.fillStyle = colors.GREEN;
        c.textAlign = "center";
        c.textBaseline = "middle";
        c.strokeText(text, x + scale / 2, y + scale / 2);
        c.fillText(text, x + scale / 2, y + scale / 2);
    }
}

//See Basic.js main setup function line 26.


// draw +/- buttons
function drawAdjuster(x, y, type, c, t, back, scale){
    c = c || window.c;
    scale = scale || window.scale;
    if(type == 1){
        let l = scale / 5;
        if(!back){
            c.beginPath();
            c.fillStyle = colors.GREEN;
            c.fillRect(x, y, scale, scale);
        }

        c.beginPath();
        c.lineCap = "butt";
        c.lineWidth = l;
        c.strokeStyle = colors.WHITE;

        c.moveTo(x + l, y + scale / 2);
        c.lineTo(x + scale - l, y + scale / 2);
        c.moveTo(x + scale / 2, y + l);
        c.lineTo(x + scale / 2, y + scale - l);

        if(!t){
            c.canvas.title = "add" + c.canvas.title;
        }
        c.stroke();
    }

    if(type == 0){
        let l = scale / 5;
        if(!back){
            c.beginPath();
            c.fillStyle = colors.YELLOW;
            c.fillRect(x, y, scale, scale);
        }

        c.beginPath();
        c.lineCap = "butt";
        c.lineWidth = l;
        c.strokeStyle = colors.WHITE;

        c.moveTo(x + l, y + scale / 2);
        c.lineTo(x + scale - l, y + scale / 2);

        if(!t){
            c.canvas.title = "remove" + c.canvas.title;
        }
        c.stroke();
    }
}


// draw grid
function drawCells(c, cells, nums, drawNums, scale, off0, offx, offy){
    c = c || window.c;
    cells = cells || window.cells;
    scale = scale || window.scale;
    offx = off0 ? offx || 0 : window.offx;
    offy = off0 ? offy || 0 : window.offy;
    if(!off0){
        clear(c);
    }

    c.font = Math.max(scale / 2, 8) + "px arial";
    for(let i = 0; i < cells.length; i++){
        for(let j = 0; j < cells[i].length; j++){
            square(c, (i * scale) + offx, (j * scale) + offy, cells[i][j], scale);
            if(cells === window.cells && selection[i][j] === false){
                highlight(i, j);
            }
        }
    }

    c.font = Math.max(scale * 0.7, 8) + "px arial";
    nums = nums || [];
    if(drawNums !== false){
        c.textBaseline = "middle";
        c.strokeStyle = colors.DARKBLUE;
        c.lineWidth = 4;
        for(let i = 0; i < cells[0].length; i++){
            c.fillStyle = colors.GREEN;
            if(nums.includes("y" + i)){
                c.fillStyle = colors.YELLOW;
            }

            c.beginPath();
            c.textAlign = "left";
            c.strokeText(i + 1, 2, (i * scale) + offy + scale / 2);
            c.fillText(i + 1, 2, (i * scale) + offy + scale / 2);

            c.textAlign = "right";
            c.strokeText(cells[0].length - i, c.canvas.width - 2, (i * scale) + offy + scale / 2);
            c.fillText(cells[0].length - i, c.canvas.width - 2, (i * scale) + offy + scale / 2);
        }

        c.textAlign = "center";
        for(let i = 0; i < cells.length; i++){
            c.fillStyle = colors.GREEN;
            if(nums.includes("x" + i)){
                c.fillStyle = colors.YELLOW;
            }

            c.textBaseline = "top";
            c.strokeText(i + 1, (i * scale) + offx + scale / 2, 2);
            c.fillText(i + 1, (i * scale) + offx + scale / 2, 2);

            c.textBaseline = "bottom";
            c.strokeText(cells.length - i, (i * scale) + offx + scale / 2, c.canvas.height - 2);
            c.fillText(cells.length - i, (i * scale) + offx + scale / 2, c.canvas.height - 2);
        }
    }
    if(!off0){
        countCells();
    }
}


// adjust scale of grid
function scalecan(amount, set){
    var b = document.getElementById("middle").getBoundingClientRect();
    var oldoffx = Math.round(b.width / 2 - cells.length * scale / 2);
    var oldoffy = Math.round(b.height / 2 - cells[0].length * scale / 2);

    if(set){
        scale = amount;
    }
    else{
        scale += amount;
    }
    scale = Math.min(Math.max(scale, 10), 30);
    b = document.getElementById("middle").getBoundingClientRect();

    var newoffx = Math.round(b.width / 2 - cells.length * scale / 2);
    var newoffy = Math.round(b.height / 2 - cells[0].length * scale / 2);
    offx -= oldoffx - newoffx;
    offy -= oldoffy - newoffy;

    c.font = Math.max(scale * 0.7, 8) + "px arial";
    c.lineWidth = scale / 5;
    checkOffsets();
    drawCells(c, cells);

    document.getElementById("scalars").title = Math.round(scale);
}


// keep grid on screen
function checkOffsets(){
    var b = document.getElementById("middle").getBoundingClientRect();

    var ox = b.width - scale;
    if(offx > ox){
        offx = ox;
    }
    ox = -(cells.length - 1) * scale;
    if(offx < ox){
        offx = ox;
    }

    var oy = b.height - scale;
    if(offy > oy){
        offy = oy;
    }
    oy = -(cells[0].length - 1) * scale;
    if(offy < oy){
        offy = oy;
    }
}


// count the cell types in a grid
function countCells(hideOutput){
    var counts = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    for(let i = 0; i < cells.length; i++){
        for(let j = 0; j < cells[i].length; j++){
            if(cells[i][j] == 0){
                continue;
            }
            var control = Math.ceil(cells[i][j] / 3 - 0.1) * 3;
            switch(cells[i][j] % 3){
                case 2:
                    for(let k = control; k <= counts.length; k += 3){
                        if(control == 6 && k == 9){
                            continue;
                        }
                        counts[k - 1]++;
                        counts[k - 2]++;
                        counts[k - 3]++
                    }
                    break;
                case 1:
                    for(let k = control; k <= counts.length; k += 3){
                        if(control == 6 && k == 9){
                            continue;
                        }
                        counts[k - 1]++;
                        counts[k - 3]++
                    }
                    break;
                case 0:
                    for(let k = control; k <= counts.length; k += 3){
                        if(control == 6 && k == 9){
                            continue;
                        }
                        counts[k - 1]++;
                        counts[k - 2]++;
                    }
                    break;
            }
        }
    }

    if(!hideOutput){
        var outarray = [[1], [3], [101], [4], [6], [102], [7], [9], [103], [10], [12], [104]];
        for(let i = 0; i < counts.length; i++){
            outarray[i][0] += "+" + counts[i];
        }
        var b = document.getElementById("bottom").getBoundingClientRect();
        var s = Math.min(b.width / 12, b.height - 20);
        var outputs = document.getElementById("outputs");
        outputs.width = s * 12;
        outputs.height = s;

        drawCells(outputs.getContext("2d"), outarray, null, false, s, true);
    }
    return counts;
}


// Draw a highlight over a cell
function highlight(x, y){
    x = gridX(x);
    y = gridY(y);

    c.beginPath();
    c.lineWidth = 1;
    c.strokeStyle = colors.DARKBLUE;
    c.strokeRect(x + 2, y + 2, scale - 4, scale - 4);
    c.strokeStyle = colors.GREEN;
    c.strokeRect(x + 1, y + 1, scale - 2, scale - 2);
    if(invertSelection){
        c.fillStyle = colors.TRANS_GREEN;
        c.fillRect(x + 2, y + 2, scale - 4, scale - 4);
    }
}


// convert canvas image to blob
function dataURItoBlob(dataURI){
    var byteString = atob(dataURI.split(',')[1]);
    var a = new Uint8Array(byteString.length);
    for(var i = 0; i < byteString.length; i++){
        a[i] = byteString.charCodeAt(i);
    }
    return new Blob([a], {type: "image/png"});
}


// Create image from grid
function prepareImageDownload(){
    //downloader.href = dataURItoBlob(c.canvas.toDataURL());

    var cs = JSON.parse(JSON.stringify(trim(cells)).replace(/([\[,])0/g, "$1-1"));

    addrow(undefined, cs, -1);

    var y = cs[0].length * 20 - 20;
    var counts = countCells();
    var outarray = [1, 3, 101, 4, 6, 102, 7, 9, 103, 10, 12, 104];
    var outs = [[0], [1], [2], [3], [4], [5], [6], [7], [8], [9], [10], [11]];
    if(cs.length < 12){
        addrow(undefined, cs, -1);
        outs = [[0, 6], [1, 7], [2, 8], [3, 9], [4, 10], [5, 11]];
    }
    if(cs.length < 6){
        addrow(undefined, cs, -1);
        outs = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [9, 10, 11]];
    }
    if(cs.length < 4){
        addrow(undefined, cs, -1);
        outs = [[0, 3, 6, 9], [1, 4, 7, 10], [2, 5, 8, 11]];
    }

    var x = (cs.length - outs.length) * 10;

    for(let i = 0; i < outs.length; i++){
        for(let j = 0; j < outs[i].length; j++){
            outs[i][j] = [outarray[outs[i][j]], counts[outs[i][j]]].join("+");
        }
    }

    var can2 = document.createElement("canvas");
    can2.width = cs.length * 20;
    can2.height = cs[0].length * 20;
    var c2 = can2.getContext("2d");
    drawCells(c2, cs, null, false, 20, true);
    drawCells(c2, outs, null, false, 20, true, x, y);

    var url = URL.createObjectURL(dataURItoBlob(can2.toDataURL()));

    document.getElementById("downloadimage").href = url;
    document.getElementById("downloadimageview").src = url;
}


// add column to grid
function addcol(index, cells, num){
    cells = cells || window.cells;
    num = num || 0;
    if(index === undefined){
        index = cells.length;
    }
    if(index < 0){
        index = cells.length + index + 1;
    }
    var l = cells[0].length;
    cells.splice(index, 0, []);
    selection.splice(index, 0, []);
    for(let i = 0; i < l; i++){
        cells[Math.floor(index)].push(num);
        if(cells === window.cells){
            selection[Math.floor(index)].push(0);
        }
    }
    if(cells == window.cells){
        offx -= scale / 2;
        drawCells();
    }
}


// remove column from grid
function removecol(index, cells){
    cells = cells || window.cells;
    if(index === undefined){
        index = cells.length - 1;
    }
    if(index < 0){
        index = cells.length + index + 1;
    }
    if(cells.length == 1){
        return false;
    }
    cells.splice(index, 1);
    if(cells === window.cells){
        selection.splice(index, 1);
    }
    if(cells == window.cells){
        offx += scale / 2;
        drawCells();
    }
}


// add row to grid
function addrow(index, cells, num){
    cells = cells || window.cells;
    num = num || 0;
    if(index === undefined){
        index = cells[0].length;
    }
    if(index < 0){
        index = cells[0].length + index + 1;
    }
    for(let i = 0; i < cells.length; i++){
        cells[i].splice(index, 0, num);
        if(cells === window.cells){
            selection[i].splice(index, 0, 0);
        }
    }
    if(cells == window.cells){
        offy -= scale / 2;
        drawCells();
    }
}


// remove row from grid
function removerow(index, cells){
    cells = cells || window.cells;
    if(index === undefined){
        index = cells[0].length - 1;
    }
    if(index < 0){
        index = cells[0].length + index + 1;
    }
    if(cells[0].length == 1){
        return false;
    }

    for(let i = 0; i < cells.length; i++){
        cells[i].splice(index, 1);
        if(cells === window.cells){
            selection[i].splice(index, 1);
        }
    }
    if(cells == window.cells){
        offy += scale / 2;
        drawCells();
    }
}


// shortcut for setTimeout/clearTimeout
function async(f, t){
    if(typeof f == "number"){
        return clearTimeout(f);
    }
    return setTimeout(f, t || 0);
}


// produce new grid and fill with type
function makeCells(w, h, type){
    w = w || 15;
    h = h || 15;
    type = type || 0;
    var c = [];
    for(let i = 0; i < w; i++){
        c.push([]);
        for(let j = 0; j < h; j++){
            c[i].push(type);
        }
    }
    return c;
}


// produce new trimmed grid
function trim(cs){
    cs = cs || window.cells;
    cs = JSON.parse(JSON.stringify(cs));

    // left
    outer: while(cs.length > 1){
        for(let j = 0; j < cs[0].length; j++){
            if(cs[0][j] !== 0){
                break outer;
            }
        }
        removecol(0, cs);
    }

    // right
    outer: while(cs.length > 1){
        for(let j = 0; j < cs[0].length; j++){
            if(cs[cs.length - 1][j] !== 0){
                break outer;
            }
        }
        removecol(undefined, cs);
    }

    //todo error below

    // top
    outer: while(cs[0].length > 1){
        for(let i = 0; i < cs.length; i++){
            if(cs[i][0] !== 0){
                break outer;
            }
        }
        removerow(0, cs);
    }
    // todo fix error.

    // bottom
    outer: while(cs[0].length > 1){
        for(let i = 0; i < cs.length; i++){
            if(cs[i][cs[0].length - 1] !== 0){
                break outer;
            }
        }
        removerow(undefined, cs);
    }

    addcol(0, cs, 0);
    addcol(undefined, cs, 0);
    addrow(0, cs, 0);
    addrow(undefined, cs, 0);

    return cs;
}


// handle undos and redos
function reundo(dir, cs){
    if(dir == 0 || dir === undefined){
        redos = [];
        cs = cs || window.cells;
        undos.push([JSON.parse(JSON.stringify(cs)), JSON.parse(JSON.stringify(selection))]);

        document.getElementById("undo").classList.add("doactive");
        document.getElementById("redo").classList.remove("doactive");
    }
    else if(dir == -1 && undos.length){
        let old = cells;
        redos.push([old, selection]);
        let temp = undos.pop();
        cells = temp[0];
        selection = temp[1];
        offx += scale / 2 * (old.length - cells.length);
        offy += scale / 2 * (old[0].length - cells[0].length);

        document.getElementById("redo").classList.add("doactive");

        if(undos.length){
            document.getElementById("undo").classList.add("doactive");
        }
        else{
            document.getElementById("undo").classList.remove("doactive");
        }
        drawCells();
    }
    else if(dir == 1 && redos.length){
        let old = cells;
        undos.push([old, selection]);
        let temp = redos.pop();
        cells = temp[0];
        selection = temp[1];
        offx += scale / 2 * (old.length - cells.length);
        offy += scale / 2 * (old[0].length - cells[0].length);

        document.getElementById("undo").classList.add("doactive");

        if(redos.length){
            document.getElementById("redo").classList.add("doactive");
        }
        else{
            document.getElementById("redo").classList.remove("doactive");
        }
        drawCells();
    }
}


// compute grid cell based on mouse coords
function calcX(x){return Math.floor(((x - can.getBoundingClientRect().left) - offx) / scale);}

function calcY(y){return Math.floor(((y - can.getBoundingClientRect().top) - offy) / scale);}

function gridX(x){return x * scale + offx;}

function gridY(y){return y * scale + offy;}


// check if cell is in grid
function inGrid(x, y){return x >= 0 && x < cells.length && y >= 0 && y < cells[x].length;}


// highlight selected cells
function highlightSelected(){
    for(let i = 0; i < cells.length; i++){
        for(let j = 0; j < cells[0].length; j++){
            if(selection[i][j] === false){
                highlight(i, j);
            }
        }
    }
}


// draw as needed
function drawAsNeeded(X, Y, s, noHighlight){
    var b = can.getBoundingClientRect();

    var x = calcX(X);
    var y = calcY(Y);

    c.canvas.style.cursor = "default";
    c.canvas.removeAttribute("title");

    if(s){
        drawCells(c, cells, ["x" + x, "y" + y]);
        if(inGrid(x, y) && !noHighlight){
            highlight(x, y);
        }
        return;
    }

    var xA = Math.floor((((X - b.left) - offx) - scale / 4) / scale * 2);
    var yA = Math.floor((((Y - b.top) - offy) - scale / 4) / scale * 2);

    if((x == -1 || x == cells.length) && yA >= -1 && yA < cells[0].length * 2){
        drawCells(c, cells, ["y" + Math.floor(yA / 2 + 0.6), "y" + Math.floor(yA / 2)]);
        c.canvas.style.cursor = "pointer";
        c.canvas.title = " row";
        drawAdjuster((x * scale) + offx, (yA * scale / 2) + offy, (yA % 2 + 2) % 2);
    }
    else if((y == -1 || y == cells[0].length) && xA >= -1 && xA < cells.length * 2){
        drawCells(c, cells, ["x" + Math.floor(xA / 2 + 0.6), "x" + Math.floor(xA / 2)]);
        c.canvas.style.cursor = "pointer";
        c.canvas.title = " column";
        drawAdjuster((xA * scale / 2) + offx, (y * scale) + offy, (xA % 2 + 2) % 2);
    }
    else{
        drawCells(c, cells, ["x" + x, "y" + y]);
    }

    if(inGrid(x, y) && !noHighlight){
        highlight(x, y);
    }
}


// adjust grid dimensions if needed
function adjustIfNeeded(X, Y){
    var b = can.getBoundingClientRect();

    var xA = Math.floor((((X - b.left) - offx) - scale / 4) / scale * 2);
    var yA = Math.floor((((Y - b.top) - offy) - scale / 4) / scale * 2);

    var x = calcX(X);
    var y = calcY(Y);

    if((x == -1 || x == cells.length) && yA >= -1 && yA < cells[0].length * 2){
        reundo(0);
        if(yA % 2){
            addrow(yA / 2 + 1);
        }
        else{
            removerow(yA / 2);
        }
    }
    else if((y == -1 || y == cells[0].length) && xA >= -1 && xA < cells.length * 2){
        reundo(0);
        if(xA % 2){
            addcol(xA / 2 + 1);
        }
        else{
            removecol(xA / 2);
        }
    }
}