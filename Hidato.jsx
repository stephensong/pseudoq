const jQuery = require('jquery');

//require('./css/bootstrap-flatly.css');
//require('./css/psq.css');
//require('bootstrap');
const oxiDate = require('./oxidate.js');
const utils = require('./utils.js');
const Objectassign = require('object-assign');

const timeSpan = require('timeSpan');

const ht = require('./hexTools.js');
const React = require('react');
const ReactDOM = require('react-dom');
const ReactBootStrap = require('react-bootstrap');
const { Button, ButtonToolbar, ButtonGroup, ModalTrigger, Input } = ReactBootStrap;

const SolutionsTable = require('SolutionsTable.jsx');


const {LinkContainer} = require('react-router-bootstrap');

const Flex = require('flex.jsx');


function initLinks(dim) {
    let links = {};
    
    let link = (i,j) => {
        if (!links[i]) links[i] = [];
        links[i].push(j);

        if (!links[j]) links[j] = [];
        links[j].push(i);
    }

    let idx = 0;
    let rowsz = dim - 1;
    for (let j = 1; j <= dim; ++j) {
        ++rowsz;    
        for(let i = 1; i <= rowsz; ++i) {
            ++idx;
            if( j < dim ) {
                link(idx, idx+rowsz);
                link(idx, idx+rowsz+1);
            }
            if (i < rowsz) link(idx,idx+1);
        }
    }
    for(let j = dim + 1; j <= dim + dim - 1; ++j) {
        ++rowsz;    
        for(let i = 1; i <= rowsz; ++i) {
            ++idx;
            link(idx, idx - rowsz - 1);
            link(idx, idx - rowsz);
            if (i < rowsz) link(idx,idx+1);
        }
    }
 
    return links; 
};

let checkCell = function(c) {
    let ks = Object.keys(c.blanks);
    if (ks.length === 0 && !(c.prv && c.nxt)) return false;
    else if (ks.length === 1 && !(c.prv || c.nxt)) return false;
    return true;
};

let clearVal = function(brd, i) {
    let cells = {...brd.cells};
    let v = cells[i].val;
    cells[i] = {...brd.cells[i]};
    cells[i].val = 0;
    cells[i].isError = false;
    let vals = {...brd.vals};
    delete vals[v];
    let maxVal = brd.maxVal;
    let minVal = brd.minVal;
    if (v < minVal) minVal = v;
    else if (v > maxVal) maxVal = v;
    return {...brd, cells, vals, minVal, maxVal};
};

let setVal = function(brd, i, v) {
    if (v === 0) return clearVal(brd, i, 0);
    let cells = {...brd.cells};
    let c = {...brd.cells[i]};
    cells[i] = c;
    c.val = v;
    let vals = {...brd.vals};
    vals[v] = i;
    return {...brd, cells: cells, vals: vals};
};

/*
let putValue = function(brd, i, v) {
    let cells = Objectassign({}, brd.cells);
    let c = Objectassign({}, brd.cells[i]);
    let ok = true;
    cells[i] = c;
    c.val = v;
    Object.keys(c.blanks).forEach( j => {
        let b = Objectassign({}, brd.cells[j]);
        delete b.blanks[i];
        b.fills[i] = c;
        cells[j] = b;
    })
    Object.keys(c.fills).forEach( j => {
        let b = Objectassign({}, brd.cells[j]);
        delete b.blanks[i]
        b.fills[i] = c;
        cells[j] = b;
        if (b.val === v+1 ) { c.nxt = b; b.prv = c; }
        else if (b.val === v-1 ) { c.prv = b; b.nxt = c; }
    })
    let vals = Objectassign({}, brd.vals);
    vals[v] = i;
    return Objectassign({}, brd, {cells: cells, vals: vals});
};
*/

function applyMoves(brd, moves) {
    let cells = {...brd.cells};
    let vals = {...brd.vals};
    moves.forEach(mv => {
        if (mv.cell) {
            let v = mv.val;
            let i = mv.cell;
            cells[i] = {...cells[i], val: v}
            if (v > 0) vals[v] = i;
            else delete vals[v];
        }
    });
    let minVal = 1;
    while (vals[minVal]) minVal++;
    let maxVal = brd.size - 1;
    while (vals[maxVal]) maxVal--;
    return {...brd, cells, vals, moves, minVal, maxVal};

};


let newBoard = function(brd) {
    let {dim,vals} = brd;
    let map = ht.hex_map(dim);
    let links = initLinks(dim)  
    let cells = {}
    map.forEach( (c,i) => { cells[i+1] = {id: i+1, val: 0, hex: c, given: false, fills: {} }; });

    Object.keys(vals).forEach(function (v) {
        let i = vals[v];
        //console.log(i.toString()+", "+v);
        cells[i].given = true;
        cells[i].val = v;
    });

    return {...brd, size: map.length, cells: cells, links: links };
};

function hidato_draw(brd, side) {

    let {dim} = brd;
    let size = {x: side, y: side};
    let height = side * 2;
    let h = (dim * height ) + ((dim - 1) * side) + 20;
    let width = ( Math.sqrt(3) / 2 ) * height
    let w = ((dim * 2) - 1) * width + 20;
    let layout = ht.Layout(ht.layout_pointy, size, {x: w/2, y: h/2});
    var canvas = document.createElement("canvas") ;
    canvas.setAttribute('width', w + 1);
    canvas.setAttribute('height', h + 1);
    var cxt = canvas.getContext('2d');

    cxt.fillStyle = 'white';
    cxt.fillRect(0,0,w,h);

    var _pen = function(spec) {
        var that = {};
        that.color = spec.color || 'black';
        that.width = spec.width || 1;
        return that;
    };

    let draw_hex = function(cell, clr, fillClr) {
        let h = cell.hex;
        let cs = ht.polygon_corners(layout, h);
        cxt.save();
        //cxt.translate(0.5, 0.5);
        cxt.strokeStyle = clr;
        cxt.fillStyle = fillClr; 
        //cxt.lineWidth = 1;

        cxt.beginPath();
        cxt.moveTo(cs[0].x,cs[0].y);
        for (let i = 1; i <= 6; i++) {
            let p = cs[(i === 6 ? 0 : i)];
            cxt.lineTo(p.x,p.y);
        }
        cxt.closePath();
        cxt.stroke();
        if (cell.given) cxt.fill();
        cxt.restore();
    };

    Object.keys(brd.cells).forEach(function (c) { draw_hex(brd.cells[c],'black','lightgray'); });
    
    return {...brd, url: canvas.toDataURL(), layout, side, height: canvas.height, width: canvas.width} ;
};


let renderedBoards = {};

let renderBoard = function(brd,side) {
    let ky = (brd.pubID ? brd.pubID.toString() : '_' ) + side ;

    if (!renderedBoards[ky]) {
        let hid = hidato_draw(brd, side);
        renderedBoards[ky] = hid;
    }
    return renderedBoards[ky];
};

let hasErrors = function(brd) {
    let soln = brd.soln;
    let vals = brd.vals;
    return Object.keys(vals).some(i => soln[i] !== vals[i] );
};

let isCompleted = function(brd) {
    let soln = brd.soln;
    let vals = brd.vals;
    return Object.keys(soln).some(i => soln[i] !== vals[i] );
};

function checkBoard(brd) {
    let soln = brd.soln;
    let vals = brd.vals;
    let cells = { ...brd.cells };
    Object.keys(vals).forEach(function (i) {
        let k = vals[i];
        let c = cells[k];
        cells[k] = {...c, isError: vals[i] !== soln[i] };
    })
    return Objectassign({}, brd, {cells: cells});
};

function resetBoard(brd) {
    let soln = brd.soln;
    let cells = {};
    let vals = {};
    Object.keys(brd.cells).forEach(function (k) {
        let c = brd.cells[k];
        cells[k] = Objectassign({}, c, {val : c.given ? c.val : 0, isError: false});
        if (c.given) vals[c.val] = k;
    });
    return Objectassign({}, brd, {cells: cells, vals: vals});
};


let cellFromHex = function(brd,h) {
    let cs = brd.cells;
    let hr = ht.hex_round(h);
    for (var i = 1; i <= brd.size; ++i) {
        let c = cs[i];
        if (!c) {
            console.log("whoops 1");
        }
        let ch = c.hex;
        if (!ch) {
            console.log("whoops 2");
        }
        if (ch.q === hr.q && ch.s === hr.s) return c;
    }
    return null;
}

function pixel_to_cell(board, p) {
    let layout = board.layout;
    let hex = ht.pixel_to_hex(layout, p);
    return cellFromHex(board, hex);

};

function cell_to_inner_rect(board, c) {
    let layout = board.layout;
    let pt = ht.hex_to_pixel(layout, c.hex);
    let sd = board.side;
    return { top: pt.y - (sd / 2),
             left: pt.x - (sd / 2),
             height: sd,
             width: sd
           }

};

function getLocalStorage(brd) {
    console.log("getLocalStorage called");
    let {dayName, pos, pubID} = brd;
    let pzl = dayName + "/" + pos;
    let stg = localStorage.getItem('pseudoq.local.' + pzl);
    if (!stg) return brd;
    stg = JSON.parse(stg);
    if (!pubID) return stg;
    if (stg.pubID !== pubID) return brd;
    let mvs = stg.moves;
    bmvs = brd.moves;
    if (bmvs.length >= mvs.length) return brd;
    if (bmvs.length > 0) {
        brd = resetBoard(brd);
        brd = initState(brd);
    }
    return applyMoves(brd, mvs);
}

function setLocalStorage(brd, moves) {
    let {dayName, pos} = brd;
    let pzl = dayName + "/" + pos;
    if (moves) brd = {...brd, moves};
    localStorage.setItem('pseudoq.local.' + pzl, JSON.stringify(brd));
}

let initState = function(brd) {
    let ival = 1;
    let minVal = 1;
    let maxVal = -1;
    if (brd) {
        while (brd.vals[ival]) ++ival;
        minVal = ival;
        maxVal = brd.size - 1;
    }
    else brd = {};

    return {...brd, 
            gameType: 'Hidato',
            direction: 'up',
            prevCell: null,
            insertVal: ival,
            finished: false,
            moves: [],
            solns: [],
            minVal,
            maxVal, 
            reSubmit: false
        };
};

function nextInsertVal(dir, from, board) {
    if (!board) {
        console.log("whoopsie");
    }
    let vals = board.vals;
    let v = from;
    let maxVal = board.maxVal;
    let minVal = board.minVal
    if (dir === 'up') {
        while (true) {
            ++v;
            if (v >= maxVal) {
                v = maxVal;
                while (vals[v] && v >= minVal) --v;
                maxVal = v;
                dir = 'down';
                break;
            } else if (!vals[v] && (vals[v+1] || vals[v-1])) {
                if (vals[v+1] && !vals[v-1]) dir = 'down';
                break;
            }
        }
        if (from === minVal && minVal < maxVal) minVal = v;
    } else {
        while (true) {
            --v;
            if (v <= minVal) {
                v = minVal;
                while (vals[v] && v <= maxVal) ++v;
                minVal = v;
                dir = 'up';
                break;
            } else if (!vals[v] && (vals[v+1] || vals[v-1])) {
                if (vals[v-1] && !vals[v+1]) dir = 'up';
                break;
            }
        }
        if (from === maxVal && minVal < maxVal) maxVal = v;
    }
    if (maxVal < minVal) v = 0;
    return {insertVal: v, direction: dir, minVal, maxVal};
};

function clickOnCell(brd,cell) {
    return function (dispatch) {
        let dir = brd.direction;
        if (cell.given) {
            if (brd.prevCell && (brd.prevCell.id === cell.id) ) dir = ( dir === 'up' ? 'down' : 'up' );
            let vf = nextInsertVal(dir, cell.val, brd);
            dispatch({type: SETSTATE, props: {...vf, prevCell: cell} });
        }
        else { 
            let reSubmit = brd.reSubmit;
            let l = brd.moves.length;
            let moveCount = ( l === 0 ? 0 : brd.moves[l - 1].moveCount ) + 1;
            let v = cell.val > 0 ? 0 : brd.insertVal;
            let moves = [...brd.moves, {cell: cell.id, val: v, insertVal: brd.insertVal, moveCount, prv: cell.val}];
            let completed = false
            let newb = null;
            if (cell.val > 0) {
                newb = clearVal(brd,cell.id);
                newb.completed = false;
                newb.moves = moves;
                dispatch({type: SETSTATE, props: {...newb, insertVal: cell.val, prevCell: cell, reSubmit} });
            }
            else {
                newb = setVal(brd, cell.id, brd.insertVal);
                newb.completed = isCompleted(newb);
                newb.moves = moves;
                let o = nextInsertVal( dir, brd.insertVal, newb); 
                dispatch({type: SETSTATE, props: {...newb, ...o, prevCell: cell, reSubmit} });
            }
            setLocalStorage(newb, moves);
            if (reSubmit) {
                submit(newb, moves, dispatch);
                reSubmit = false;
            }
        }
        //return brd;  // should not happen
    }
};


function submit(board, moves, dispatch) {
    let {pubID} = board;

    let xhr = new XMLHttpRequest();   
    xhr.open("POST", "/solutions");
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    let rslt = {puzzle: pubID, doc: { moves } };
    rslt.lastPlay = new Date();
    rslt.moveCount = moves.length;

    let txt = JSON.stringify(rslt);

    xhr.send(txt);
    xhr.onload = () => receiveSolutions(xhr, dispatch);
    dispatch({type: SETSTATE,  props: {reSubmit: false} });
};

function requestSolutions(pubID, dispatch) {
    let xhr = new XMLHttpRequest();   
    xhr.open("GET", "/solutions/"+pubID);
    xhr.onload = () => receiveSolutions(xhr, dispatch);
    xhr.send();
};

function receiveSolutions(xhr,dispatch) {
    if(xhr.status !== 200) { 
        let msg = 'failed : ' + xhr.status + " - " + xhr.responseText;
        console.log(msg);
    } else {
        let rsp = JSON.parse(xhr.responseText);
        if (rsp.ok) {
            let solns = rsp.solutions;
            //console.log("solutions received : "+solns.length);
            //solns.forEach(function (s) {console.log(s.lastPlay);});
            //localStorage.setItem('pseudoq.solutions.' + dayName + '.' + pos, JSON.stringify(solns));
            dispatch({type: LOADSOLUTIONS, solns});
        } else {
            console.log(rsp.msg);
        }
    }
};

const LOADBOARD = 'hidato/LOADBOARD';
const LOADSOLUTIONS = 'hidato/LOADSOLUTIONS';
const PREVINSERTVAL = 'hidato/PREVINSERTVAL';
const NEXTINSERTVAL = 'hidato/NEXTINSERTVAL';
const CHECK = 'hidato/CHECK';
const UNDO = 'hidato/UNDO';
const RESET = 'hidato/RESET';
const SETSTATE = 'hidato/SETSTATE';

export function hidatoReducer(st, action) {
    if (!st) {
        return initState();
    }
    let v = st.insertVal;
    let dir = st.direction;
    let brd = null;
    let moves = st.moves;
    let l = moves.length;
    let moveCount = l == 0 ? 0 : moves[l - 1].moveCount;

    switch (action.type) {
    case LOADBOARD:
        //console.log("loading board");
        let js = action.json || st;
        brd = newBoard(js);
        brd = renderBoard(brd,action.side);
        brd = initState(brd);
        brd = getLocalStorage(brd);
        setLocalStorage(brd);
        return brd;

    case LOADSOLUTIONS:  
        return {...st, solns: action.solns};  

    case PREVINSERTVAL:
        dir = 'down';
        v = nextInsertVal(dir, v, st);
        return {...st, ...v, prevCell: null}; 

    case NEXTINSERTVAL:
        dir = 'up';
        v = nextInsertVal(dir, v, st);
        return {...st, ...v, prevCell: null}; 

    case CHECK:
        brd = checkBoard(st);
        moveCount += 10;
        moves = [...st.moves, { moveCount }];
        setLocalStorage(brd, moves);
        return {...brd, prevCell: null, moves };

    case UNDO:
        //console.log("undo called");
        moveCount++;
        let l = st.moves.length - 1;
        while (!st.moves[l].cell) --l;
        let mv = st.moves[l];
        let moves = st.moves.slice(0,l);
        brd = setVal(st, mv.cell, mv.prv);  
        moves.push({ moveCount });
        setLocalStorage(brd, moves);
        return {...brd, insertVal: mv.insertVal, moves };

    case RESET:
        let rslt = resetBoard(st);
        rslt = initState(rslt);
        rslt.moves = [ { moveCount } ]; 
        setLocalStorage(brd, moves);
        return rslt;

    case SETSTATE:
        return {...st, ...action.props};

    default:
        return st;
    };

};

let Cell = React.createClass({
    render() {
        let {board,cell} = this.props;
        let styl = cell_to_inner_rect(board,cell);
        styl.color = cell.isError ? 'red' : 'black';
        //styl.backgroundColor = 'white';
        styl.position = 'absolute';
        styl.alignItems = 'center';
        styl.justifyContent = 'center'
        let txt = cell.val === 0 ? '' : cell.val.toString();
        //let txt = cell.id.toString();
        return (
            <Flex auto style={styl} >
                <div>{txt}</div>
            </Flex> );

    }
});


let Board = React.createClass({

    handleClick(e) {
        let {dispatch, board, insertVal} = this.props;
        if (insertVal === 0) return;  // finished
        var node = ReactDOM.findDOMNode(this);
        var rect = node.getBoundingClientRect();
        let x = e.clientX - rect.left;
        let y = e.clientY - rect.top;
        let cell = pixel_to_cell(board,{x: x, y: y});
        if (cell) dispatch( clickOnCell(board, cell) );
    },

    render() {
        let {board, insertVal} = this.props;
        let divStyle = {
          width: board.width,
          height: board.height,
          background: 'url(' + board.url + ')',
          backgroundRepeat: "no-repeat",
        };

        let cells = Object.keys(board.cells).map(function (k) {
            let c = board.cells[k]; 
            return <Cell key={c.id} board={board} cell={c} /> ;
         
        });

        return ( 
            <div style={ divStyle} onClick={this.handleClick}  >
               <div style={{position: 'relative'}} >
                    {cells}
                </div>
            </div> );

    }

});

export let Hidato = React.createClass({
    getInitialState() {
        return {
            reSubmitTimer: null
        };
    },

    newGame() {
        var xhr = new XMLHttpRequest();
        //console.log("hidato puzzle requested");
        xhr.open("GET", '/hidato');
        xhr.onload = () => {
            let json = JSON.parse(xhr.responseText);
            //console.log("puzzle received : "+json.pubID);
            this.props.dispatch({type: 'hidato/LOADBOARD', json: json, side: 30})
        }
        xhr.send();
    },

    componentWillMount() { this.initComponent(); },
    //componentWillReceiveProps() { this.initComponent(); }, 
    initComponent() {  
        let {dayName, pos, dispatch} = this.props;
        if (dayName === 'hidato') {
            let pzl = dayName + "/" + pos;
            let stg = localStorage.getItem('pseudoq.local.' + pzl);
            if (stg) stg = JSON.parse(stg);
            if (stg && !stg.completed) dispatch({type: SETSTATE, props: stg });
            else this.newGame();
            return;
        }
        dispatch({type: LOADBOARD, side: 20, json: board });
    },

    componentDidMount () {
        console.log("Hidato mounted");
        let {mode, completed, pubID, dispatch} = this.props;
        if (mode === 'play') {
            if (pubID) requestSolutions(pubID, dispatch);
            if (!completed ) {
                this.setState({reSubmitTimer: window.setInterval(this.tick, 60000)});   // only submit a max of once a minute, upon next move.
            }
        }
    },

    componentWillUnmount(){
        //console.log("PseudoqBoard will unmount");
        window.clearInterval(this.state.reSubmitTimer);
    },

    tick() {
        if (this.isMounted && !this.props.completed) this.props.dispatch({type: SETSTATE, props: {reSubmit: true} });
    },

    prevInsertVal() {
        this.props.dispatch({type: PREVINSERTVAL});
    },

    nextInsertVal() {
        this.props.dispatch({type: NEXTINSERTVAL});

    },

    undo() {
        //console.log("dispatch undo")
        this.props.dispatch({type: UNDO});
    },

    newGame() {
        var xhr = new XMLHttpRequest();
        //console.log("hidato puzzle requested");
        xhr.open("GET", '/hidato');
        xhr.onload = () => {
            let {dayName, pos, dispatch} = this.props;
            let pzl = dayName + "/" + pos;
            localStorage.removeItem('pseudoq.local.' + pzl);
            let json = JSON.parse(xhr.responseText);
            json.dayName = dayName;
            json.pos = pos;
            //console.log("puzzle received : "+json.pubID);
            dispatch({type: 'hidato/LOADBOARD', json: json, side: 30})
        }
        xhr.send();
    },

    check() {
        this.props.dispatch({type: CHECK});
    },

    reset() {
        this.props.dispatch({type: RESET});
    },

    reviewSolution() {
        console.log("reviewSolution called");
    },

    render() {
        console.log("rendering Hidato");
        let board = this.props;
        if (!board.cells) return null;
        if (!board.width) board = renderBoard(board,board.side);
        let {direction,insertVal,moves, dispatch, mode} = board;

        let btnStyle = {
            width: '100%',
            margin: 2,
        };

        let h2 = (
            <div style={{width: board.width}} >
          <Flex row style={ {height: 30, paddingTop: 10} }>
            <Flex col style={ {justifyContent: 'flex-start', paddingLeft: 10} } >Hidato</Flex>
            <Flex col style={ {justifyContent: 'flex-end', paddingRight: 40} } >Rating : {board.rating}</Flex>
          </Flex>
            </div>
        );

        let h1 = null;

        let rhcol = null;
        if (mode === 'view') {
            let {dayName, pos} = this.props;
            rhcol = (
                <Flex column style={{justifyContent: 'flex-start', flex: "0 0 130px"}} >
                    btns.push( <LinkContainer key='play' to={rt} ><Button  style={btnStyle} >Play</Button></LinkContainer> );
                </Flex>
                );
        } else {
            h1 =  ( <h1>Play</h1> )
            let btns = [];
            btns.push( <Button key='tryagain' bsSize='small' onClick={this.newGame} block >New Game</Button>);
            btns.push( <Button key='undo' bsSize='small' onClick={this.undo} block >Undo</Button> );
            btns.push( <Button key='check' bsSize='small' onClick={ this.check } block >Check</Button>);
            btns.push( <Button key='reset' bsSize='small' onClick={ this.reset } block >Reset</Button>);
            let l = moves.length;
            let mvcnt = l === 0 ? 0 : moves[l - 1].moveCount;

            let prog = ( 
                    <Flex row style={ {borderStyle: 'solid', borderWidth: 1 } } >
                      <Flex column style={{alignItems: 'center'}} >
                          <Flex row style={ {height: 21 } }># Moves</Flex>
                          <Flex row auto>
                              <Flex column style={ {alignSelf: 'middle', height: 50, width: '100%', fontSize: 30 } }>{mvcnt}</Flex>
                          </Flex>
                        </Flex>
                    </Flex>     
                );

            rhcol = (
                   <Flex column style= {{justifyContent: 'space-between', flex: "0 0 130px", padding: 6, height: board.height }}>
                     <Flex row auto >
                       <Flex column style={{justifyContent: 'flex-start'}} >
                        { prog }
                       </Flex>                 
                      </Flex>
                     <Flex row auto>
                      <Flex column style={{justifyContent: 'flex-end'  }}>
                        { btns }
                       </Flex>  
                     </Flex>
                   </Flex>
            );
        }
        let lhcol = (
                <Board board={board} dispatch={dispatch} />
            );

        let ftr = null;
        let helptext = null;
        if (mode !== 'view') {
            ftr = (insertVal === 0 && !hasErrors(board)) ?
                (
                <div style={{width: board.width }}>
                    <Flex row style={ { justifyContent: 'center' } }>
                        <div style={ {textAlign: 'center', borderStyle: 'solid', borderWidth: 1, width: '200', fontSize: 30, backgroundColor: 'green' } }>** Success **</div>
                    </Flex>
                </div> 
                ):
                (
                <div style={{width: board.width }}>
                    <Flex row style={ { justifyContent: 'center' } }>
                        <Button style={{color: 'black', backgroundColor: 'white', fontSize:30}} disabled={ insertVal === board.minVal } onClick={ this.prevInsertVal }>&lt;</Button>
                        <Flex col style={ {alignItems: 'center', justifyContent: 'center', borderStyle: 'solid', borderWidth: 1, flex: '0 0 100px', fontSize: 30 } }>{ insertVal }</Flex>
                        <Button style={{color: 'black', backgroundColor: 'white', fontSize:30}} disabled={ insertVal === board.maxVal } onClick={ this.nextInsertVal }>&gt;</Button>
                    </Flex>
                    <Flex row style={ { justifyContent: 'center', marginTop: 10 } }>
                        <div style={ {textAlign: 'center', borderStyle: 'solid', borderWidth: 1, width: '100', fontSize: 30 } }>{ direction === 'up' ? '>' : '<' }</div>
                    </Flex>
                </div> 
                );

            helptext = (
                <div>
                  <h3>Rules</h3>
                  <p>Consecutive numbers must be in adjacent cells. That&apos;s it!</p>
                  <h3>Play</h3>
                  <p>Clicking on a blank cell will insert the current number (displayed at bottom).
                  </p>
                  <p>Clicking on a given cell will set the current insert number to the next or previous available number,
                     depending on the current direction. Clicking again on the same cell will toggle the direction and select
                     the next number in the other direction.
                  </p>
                  <p>
                     The current direction can be changed by clicking on the &lt; and &gt; buttons
                     next to the current insert number.  These buttons will also skip to the next available number up or down.
                     An available number is one that is adjacent to a number already placed on the board.
                  </p> 
                  <p>Clicking on a previously filled cell will blank the cell.
                  </p>
                  <p>In a perfect game, the number of moves will be precisely the number of blank cells.
                  </p>
                  <p>Progress is not currently saved, or uploaded as per the sudoku puzzles.  This will be rectified in the next release.
                  </p>
                  <h3>Solving Strategies</h3>
                  <p>Every game has a unique solution. In theory, it is never necessary to guess.  
                  </p>
                  <p>First find cells that must be a particular value.  Then find sequences of cells/values that create no 
                  inaccessible areas. This is more easily achieved by starting at the edges and working from the outside in.
                  </p>
                  <p>One consequence of there being a unique solution is that if placing a sequence of two numbers 
                      in two cells would mean that swapping them over would also be equally valid, you can then be sure that those two 
                      numbers do *not* occupy those two cells.  This happens often, and is a very useful strategy.
                  </p>
                  <p>
                  </p>
                </div>
                );
        }

        return (
            <div>  
              { h1 }
              { h2 }
              <Flex row style={{justifyContent: 'flex-start'}} >
                    { lhcol }
                    { rhcol }
              </Flex>
              { ftr }
              <SolutionsTable board={ this } solutions={ this.props.solutions } />
              { helptext }
            </div>
        );
    }

});

