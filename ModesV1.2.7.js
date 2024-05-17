var fillarea;
var selection;
var invert;

function setupmodes(){
    var x1 = NaN;
    var x2 = NaN;
    var y1 = NaN;
    var y2 = NaN;
    var selectionActive = false;
    
    fillarea = function(){
        var oldC = JSON.stringify(cells);
        for(let i = 0; i < cells.length; i++){
            for(let j = 0; j < cells[0].length; j++){
                if(selection[i][j] === false){
                    cells[i][j] = celltype;
                }
            }
        }
        drawCells();
        var newC = JSON.stringify(cells);
        if(oldC != newC){
            cells = JSON.parse(oldC);
            reundo(0);
            cells = JSON.parse(newC);
        }
    };
    
    var isDown = false;
    var isSecond = false;
    
    var down1 = function(e){
        if(selectionActive){
            escHandler();
        }
        var x = calcX(e.clientX);
        var y = calcY(e.clientY);
        
        if(inGrid(x, y)){
            isDown = true;
            reundo(0);
            cells[x][y] = celltype;
        }
        
        adjustIfNeeded(e.clientX, e.clientY);
        drawAsNeeded(e.clientX, e.clientY);
        
        return false;
    };
    
    var move1 = function(e){
        var x = calcX(e.clientX);
        var y = calcY(e.clientY);
        
        if(inGrid(x, y) && isDown){
            cells[x][y] = celltype;
        }
        
        drawAsNeeded(e.clientX, e.clientY);
        
        return false;
    };
    
    var up1 = function(e){isDown = false;};
    
    var selX1 = NaN;
    var selY1 = NaN;
    var selX2 = NaN;
    var selY2 = NaN;
    
    var down2 = function(e){
        if(selectionActive){
            escHandler();
            return false;
        }
        
        x2 = selX2 = e.clientX - can.getBoundingClientRect().left;
        y2 = selY2 = e.clientY - can.getBoundingClientRect().top;
        
        if(!isSecond){
            x1 = selX1 = selX2;
            y1 = selY1 = selY2;
        }
        
        isDown = true;
        
        c.beginPath();
        c.fillStyle = colors.TRANS_GREEN;
        c.lineWidth = 1;
        c.strokeStyle = colors.DARKBLUE;
        c.arc(selX2, selY2, scale / 2, 0, 2 * Math.PI);
        c.closePath();
        c.fill();
        c.stroke();
        return false;
    };
    
    var move2 = function(e){
        drawAsNeeded(e.clientX, e.clientY, true, isDown);
        if(isDown){
            selX2 = e.clientX - can.getBoundingClientRect().left;
            selY2 = e.clientY - can.getBoundingClientRect().top;
            
            c.beginPath();
            c.fillStyle = colors.TRANS_GREEN;
            c.lineWidth = 1;
            c.strokeStyle = colors.DARKBLUE;
            c.strokeRect(selX1, selY1, selX2 - selX1, selY2 - selY1);
            if(!invertSelection){
                c.fillRect(selX1, selY1, selX2 - selX1, selY2 - selY1);
            }
            
            select2();
            
        }
        
        return false;
    };
    
    var up2 = function(e){
        drawAsNeeded(e.clientX, e.clientY, isDown);
        
        if(selX1 == selX2 && selY1 == selY2 && isDown && !isSecond){
            isSecond = true;
        }
        
        else if(isDown){
            isDown = false;
            isSecond = false;
            selectionActive = true;
            
            select2();
            fillarea();
            
            window.addEventListener("keydown", escHandler, true);
        }
        
        return false;
    };
    
    var select2 = function(){
        x1 = calcX(selX1 + can.getBoundingClientRect().left);
        x2 = calcX(selX2 + can.getBoundingClientRect().left);
        y1 = calcY(selY1 + can.getBoundingClientRect().top);
        y2 = calcY(selY2 + can.getBoundingClientRect().top);
        
        
        if(x2 < x1){
            let temp = x1;
            x1 = x2;
            x2 = temp;
        }
        if(y2 < y1){
            let temp = y1;
            y1 = y2;
            y2 = temp;
        }
        
        if((x1 > cells.length || x2 < 0 || y1 > cells[0].length || y2 < 0) && !invertSelection){
            x1 = x2 = y1 = y2 = NaN;
            return false;
        }
        
        x1 = Math.max(x1, 0);
        x2 = Math.min(x2 + 1, cells.length);
        y1 = Math.max(y1, 0);
        y2 = Math.min(y2 + 1, cells[0].length);
        selection = makeCells(cells.length, cells[0].length);
        for(let i = x1; i < x2; i++){
            for(let j = y1; j < y2; j++){
                selection[i][j] = false;
            }
        }
        if(edgesOnly){
            for(let i = x1 + 1; i < x2 - 1; i++){
                for(let j = y1 + 1; j < y2 - 1; j++){
                    selection[i][j] = 0;
                }
            }
        }
        invert();
        highlightSelected();
    };
    
    var down3 = function(e){
        if(selectionActive){
            escHandler();
            return false;
        }
        down2(e);
        if(!isSecond){
            selX1 = Math.floor((selX1 - offx - scale / 4) / scale * 2) / 2;
            selY1 = Math.floor((selY1 - offy - scale / 4) / scale * 2) / 2;
        }
        return false;
    };
    
    var move3 = function(e){
        drawAsNeeded(e.clientX, e.clientY, true, isDown);
        if(isDown){
            x2 = selX2 = e.clientX - can.getBoundingClientRect().left;
            y2 = selY2 = e.clientY - can.getBoundingClientRect().top;
            
            var mx = selX1 * scale + offx + scale / 2;
            var my = selY1 * scale + offy + scale / 2;
            
            c.beginPath();
            c.fillStyle = colors.TRANS_GREEN;
            c.lineWidth = 1;
            c.strokeStyle = colors.DARKBLUE;
            c.arc(mx, my, Math.pyth(mx, my, selX2, selY2), 0, Math.PI * 2);
            c.stroke();
            if(!invertSelection){
                c.fill();
            }
            
            select3();
        }
        
        return false;
    };
    
    var up3 = function(e){
        drawAsNeeded(e.clientX, e.clientY, true);
        
        if(x1 == x2 && y1 == y2 && isDown && !isSecond){
            isSecond = true;
        }
        
        else if(isDown){
            isDown = false;
            isSecond = false;
            selectionActive = true;
            
            fillarea();
            
            window.addEventListener("keydown", escHandler, true);
            select3();
        }
        return false;
    };
    
    var select3 = function(){
        selection = makeCells(cells.length, cells[0].length);
        var mx = selX1 * scale + offx + scale / 2;
        var my = selY1 * scale + offy + scale / 2;
        var r = Math.pyth(mx, my, selX2, selY2);
        for(let i = 0; i < cells.length; i++){
            for(let j = 0; j < cells[0].length; j++){
                if(i >= cells.length || i < 0 || j >= cells[0].length || j < 0){
                    continue;
                }
                if(Math.pyth(i, j, selX1, selY1) <= r / scale){
                    if(edgesOnly && Math.pyth(i, j, selX1, selY1) < r / scale - 1){
                        continue;
                    }
                    selection[i][j] = false;
                }
            }
        }
        invert();
    };
    
    var xs;
    var ys;
    var notSecond = false;
    
    var down4 = function(e){
        if(selectionActive){
            escHandler();
            return false;
        }
        isDown = true;
        notSecond = false;
        if(!isSecond){
            xs = [];
            ys = [];
            selX1 = e.clientX - can.getBoundingClientRect().left;
            selY1 = e.clientY - can.getBoundingClientRect().top;
            xs.push(selX1);
            xs.push(selX1);
            ys.push(selY1);
            ys.push(selY1);
        }
        return false;
    };
    
    var move4 = function(e){
        drawAsNeeded(e.clientX, e.clientY, true, isDown);
        
        if(isDown){
            if(isSecond){
                var x = e.clientX - can.getBoundingClientRect().left;
                var y = e.clientY - can.getBoundingClientRect().top;
                if(isSecond && Math.pyth(x, y, xs[0], ys[0]) < scale * 2){
                    c.beginPath();
                    c.fillStyle = colors.TRANS_GREEN;
                    if(Math.pyth(x, y, xs[0], ys[0]) < scale / 2){
                        c.fillStyle = colors.GREEN;
                    }
                    c.lineWidth = 1;
                    c.strokeStyle = colors.DARKBLUE;
                    c.arc(xs[0], ys[0], scale / 2, 0, 2 * Math.PI);
                    c.closePath();
                    
                    c.fill();
                    
                    c.stroke();
                }
            }
            else{
                notSecond = true;
            }
            
            xs.splice(-1, 0, e.clientX - can.getBoundingClientRect().left);
            ys.splice(-1, 0, e.clientY - can.getBoundingClientRect().top);
            
            c.beginPath();
            for(let i = 0; i < xs.length - 1; i++){
                c.lineTo(xs[i], ys[i]);
            }
            c.lineWidth = 4;
            c.strokeStyle = colors.DARKBLUE;
            c.stroke();
            c.lineWidth = 1;
            c.strokeStyle = colors.GREEN;
            c.stroke();
            if(!invertSelection){
                c.fillStyle = colors.TRANS_GREEN;
                c.fill();
            }
            
            select4();
            if(isSecond){
                xs.splice(-2, 1);
                ys.splice(-2, 1);
            }
        }
        return false;
    };
    
    var up4 = function(e){
        drawAsNeeded(e.clientX, e.clientY, true, true);
        
        var x = e.clientX - can.getBoundingClientRect().left;
        var y = e.clientY - can.getBoundingClientRect().top;
        
        if(isSecond && Math.pyth(x, y, xs[0], ys[0]) < scale / 2){
            isSecond = false;
        }
        
        if(!notSecond && ((isDown && x == xs[xs.length - 2] && y == ys[ys.length - 2]) || isSecond)){
            isSecond = true;
            xs.splice(-1, 0, x);
            ys.splice(-1, 0, y);
            select4();
        }
        
        else if(isDown){
            isDown = false;
            isSecond = false;
            selectionActive = true;
            
            window.addEventListener("keydown", escHandler, true);
            
            select4();
            fillarea();
        }
        return false;
    };
    
    var select4 = function(){
        selection = makeCells(cells.length, cells[0].length);
        for(let i = 0; i < cells.length; i++){
            for(let j = 0; j < cells[0].length; j++){
                for(let k = 1; k < xs.length; k++){
                    var x = gridX(i) + scale / 2;
                    var y = gridY(j) + scale / 2;
                    if((x >= xs[k] && x < xs[k - 1]) || (x >= xs[k - 1] && x < xs[k])){
                        let m = (ys[k - 1] - ys[k]) / (xs[k - 1] - xs[k]);
                        if(y <= m * x + (ys[k - 1] - m * xs[k - 1])){
                            if(xs[k] <= x){
                                selection[i][j]++;
                            }
                            else{
                                selection[i][j]--;
                            }
                        }
                    }
                }
                if(edgesOnly && selection[i - 2]){
                    if((selection[i - 1][j - 1] === false || selection[i - 1][j - 1] === "")
                        && (selection[i - 2][j] === false || selection[i - 2][j] === "")
                        && (selection[i - 1][j + 1] === false || selection[i - 1][j + 1] === "")
                        && selection[i][j]){
                        selection[i - 1][j] = "";
                    }
                }
                if(selection[i][j]){
                    selection[i][j] = false;
                }
            }
        }
        invert();
    };
    
    var escHandler = function(e){
        if(!e || e.keyCode == 27){
            x1 = x2 = y1 = y2 = NaN;
            selX1 = selX2 = selY1 = selY2 = NaN;
            selection = makeCells(cells.length, cells[0].length);
            isDown = false;
            isSecond = false;
            selectionActive = false;
            drawCells();
            window.removeEventListener("keydown", escHandler, true);
        }
    };
    
    invert = function(){
        if(invertSelection){
            for(let i = 0; i < selection.length; i++){
                for(let j = 0; j < selection[0].length; j++){
                    if(selection[i][j] === false){
                        selection[i][j] = 0;
                    }
                    else{
                        selection[i][j] = false;
                    }
                }
            }
        }
    }
    
    var downs = [down1, down2, down3, down4];
    var moves = [move1, move2, move3, move4];
    var ups = [up1, up2, up3, up4];
    
    var changemode = function(){
        escHandler();
        intype = this.dataset.mode;
        can.onmousedown = downs[intype - 1];
        onmouseup = ups[intype - 1];
        onmousemove = moves[intype - 1];
        ms = document.getElementsByClassName("modeselect");
        for(let i = 0; i < ms.length; i++){
            ms[i].classList.remove("selected");
        }
        this.classList.add("selected");
        localStorage.mode = this.id;
    };
    
    can.addEventListener("touchstart", function(e){
        can.dispatchEvent(new MouseEvent("mousedown", {
            clientX: e.changedTouches[0].clientX,
            clientY: e.changedTouches[0].clientY
        }));
    }, true);
    window.addEventListener("touchmove", function(e){
        window.dispatchEvent(new MouseEvent("mousemove", {
            clientX: e.changedTouches[0].clientX,
            clientY: e.changedTouches[0].clientY
        }));
    }, true);
    window.addEventListener("touchend", function(e){
        window.dispatchEvent(new MouseEvent("mouseup", {
            clientX: e.changedTouches[0].clientX,
            clientY: e.changedTouches[0].clientY
        }));
    }, true);
    
    var ms = document.getElementsByClassName("modeselect");
    for(let i = 0; i < ms.length; i++){
        let x = ms[i];
        ms[i].addEventListener("click", changemode, false);
    }
    
    if(localStorage.mode !== undefined){
        try{
            document.getElementById(localStorage.mode).click();
        }
        catch(e){
        
        }
    }
    else{
        document.getElementById("singleselect").click();
    }
    
    drawCells(ms[0].children[0].getContext("2d"), [[0, 0, 0, 0], [0, 10, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]],
        false, false, 46 / 4, true, 2, 2);
    drawCells(ms[1].children[0].getContext("2d"), [[0, 10, 10, 10, 0], [0, 10, 10, 10, 0], [0, 10, 10, 10, 0], [0, 10, 10, 10, 0], [0, 0, 0, 0, 0]],
        false, false, 46 / 5, true, 2, 2);
    drawCells(ms[2].children[0].getContext("2d"), [[0, 0, 0, 0, 0, 0, 0], [0, 0, 10, 10, 10, 0, 0], [0, 10, 10, 10, 10, 10, 0], [0, 10, 10, 10, 10, 10, 0], [0, 10, 10, 10, 10, 10, 0], [0, 0, 10, 10, 10, 0, 0], [0, 0, 0, 0, 0, 0, 0]],
        false, false, 46 / 7, true, 2, 2);
    drawCells(ms[3].children[0].getContext("2d"), [[0, 0, 0, 0, 0, 0, 0], [10, 10, 0, 0, 10, 10, 0], [0, 10, 10, 10, 10, 0, 0], [0, 10, 10, 10, 10, 0, 0], [0, 0, 10, 10, 10, 10, 0], [0, 0, 0, 10, 10, 10, 0], [0, 0, 0, 0, 0, 0, 0]],
        false, false, 46 / 7, true, 2, 2);
}