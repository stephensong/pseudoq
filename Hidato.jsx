let jQuery = require('jquery');

//require('./css/bootstrap-flatly.css');
//require('./css/psq.css');
//require('bootstrap');
let oxiDate = require('./oxidate.js');
let utils = require('./utils.js');
let Objectassign = require('object-assign');

let timeSpan = require('timeSpan');

let ht = require('./hexTools.js');
let React = require('react');
let ReactBootStrap = require('react-bootstrap');
const { Button, ButtonToolbar, ButtonGroup, ModalTrigger, Input } = ReactBootStrap;

let {LinkContainer} = require('react-router-bootstrap');

let Flex = require('flex.jsx');


let initLinks = function (dim) {
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

let setVal = function(brd, i, v) {
    let cells = Objectassign({}, brd.cells);
    let c = Objectassign({}, brd.cells[i]);
    cells[i] = c;
    c.val = v;
    let vals = Objectassign({}, brd.vals);
    vals[v] = i;
    return Objectassign({}, brd, {cells: cells, vals: vals});
};

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

let clearVal = function(brd, i) {
    let cells = Objectassign({}, brd.cells)
    let v = cells[i].val;
    cells[i] = Objectassign({}, brd.cells[i]);
    cells[i].val = 0;
    cells[i].isError = false;
    let vals = Objectassign({}, brd.vals)
    delete vals[v];
    return Objectassign({}, brd, {cells: cells, vals: vals});
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

    return Objectassign({}, brd, {size: map.length, cells: cells, links: links }) ;
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

    return Objectassign( {}, brd, {canvas: canvas, layout: layout, side: side, height: canvas.height, width: canvas.width} );
};


let renderedBoards = {};

let renderBoard = function(brd,side) {
    let ky = (brd.pubID ? brd.pubID.toString() : '_' ) + side ;

    if (!renderedBoards[ky]) {
        let hid = hidato_draw(brd, side);
        let cUrl = hid.canvas.toDataURL();
        renderedBoards[ky] = Objectassign({}, hid, {url: cUrl});
    }
    return renderedBoards[ky];
};

let hasErrors = function(brd) {
    let soln = brd.soln;
    let vals = brd.vals;
    let isErr = false;
    Object.keys(vals).forEach(function (i) {
        if (!isErr) {
            if (soln[i] !== vals[i] ) isErr = true;
        }
    });
    return isErr;
};

let checkBoard = function(brd) {
    let soln = brd.soln;
    let vals = brd.vals;
    let cells = Objectassign({}, brd.cells);
    Object.keys(vals).forEach(function (i) {
        let k = vals[i];
        let c = cells[k];
        cells[k] = Objectassign({}, c, {isError: vals[i] !== soln[i] });
    })
    return Objectassign({}, brd, {cells: cells});
};

let resetBoard = function(brd) {
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

let Cell = React.createClass({
    render: function() {
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

    handleClick: function(e) {
        let {dispatch, board, insertVal} = this.props;
        if (insertVal === 0) return;  // finished
        var node = this.getDOMNode();
        var rect = node.getBoundingClientRect();
        let x = e.clientX - rect.left;
        let y = e.clientY - rect.top;
        let cell = pixel_to_cell(board,{x: x, y: y});
        if (cell) dispatch({type: 'clickOnCell', cell: cell, board: board});
    },

    render: function() {
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

    componentWillMount: function() { this.initComponent(); },
    componentWillReceiveProps: function() { this.initComponent(); }, 
    initComponent: function() {  
        let {board, brdJson, dispatch} = this.props;
        if (!board) dispatch({type: 'loadHidatoBoard', side: 20, json: brdJson });
    },

    prevInsertVal: function() {
        this.props.dispatch({type: 'prevInsertVal'});
    },

    nextInsertVal: function() {
        this.props.dispatch({type: 'nextInsertVal'});

    },

    undo: function() {
        //console.log("dispatch undo")
        this.props.dispatch({type: 'undo'});
    },

    reload: function() {
        document.location.reload(true);
    },

    check: function() {
        this.props.dispatch({type: 'check'});
    },

    reset: function() {
        this.props.dispatch({type: 'reset'});
    },

    render: function() {
        console.log("rendering Hidato");
        let {board, dispatch, mode} = this.props;
        let {direction,insertVal,moves} = board;

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
            btns.push( <Button key='tryagain' bsSize='small' onClick={this.reload} block >New Game</Button>);
            btns.push( <Button key='undo' bsSize='small' onClick={this.undo} block >Undo</Button> );
            btns.push( <Button key='check' bsSize='small' onClick={ this.check } block >Check</Button>);
            btns.push( <Button key='reset' bsSize='small' onClick={ this.reset } block >Reset</Button>);

            let prog = ( 
                    <Flex row style={ {borderStyle: 'solid', borderWidth: 1 } } >
                      <Flex column style={{alignItems: 'center'}} >
                          <Flex row style={ {height: 21 } }># Moves</Flex>
                          <Flex row>
                              <Flex column style={ {alignSelf: 'middle', height: 50, width: '100%', fontSize: 30 } }>{moves}</Flex>
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
                     <Flex row >
                      <Flex column style={{justifyContent: 'flex-end'  }}>
                        { btns }
                       </Flex>  
                     </Flex>
                   </Flex>
            );
        }

        let lhcol = (
            <Flex column style={{flexGrow: 0, flexShrink: 0, flexBasis: board.width}}>
                <Board board={board} dispatch={dispatch} />
            </Flex>
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
                        <Button style={{color: 'black', backgroundColor: 'white', fontSize:30}} onClick={ this.prevInsertVal }>&lt;</Button>
                        <Flex col style={ {alignItems: 'center', justifyContent: 'center', borderStyle: 'solid', borderWidth: 1, flex: '0 0 100px', fontSize: 30 } }>{ insertVal }</Flex>
                        <Button style={{color: 'black', backgroundColor: 'white', fontSize:30}} onClick={ this.nextInsertVal }>&gt;</Button>
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
              { helptext }
            </div>
        );
    }

});

// reducers

let initState = function(brd) {
    let ival = 1;
    if (brd) while (brd.vals[ival]) ++ival;
    else brd = {};

    return Objectassign( {}, brd, {
        gameType: 'Hidato',
        direction: 'up',
        prevCell: null,
        insertVal: ival,
        prevState: null,
        moves: 0
    });
};

function nextInsertVal(dir, from, board) {
    if (!board) {
        console.log("whoopsie");
    }
    let vals = board.vals;
    let v = from;
    if (dir === 'up') {
        while (true) {
            ++v;
            if (v >= board.size) {
                v = board.size;
                while (vals[v] && v > 0) --v;
                dir = 'down';
                break;
            } else if (!vals[v] && (vals[v+1] || vals[v-1])) {
                if (vals[v+1] && !vals[v-1]) dir = 'down';
                break;
            }
        }
    } else {
        while (true) {
            --v;
            if (v <= 1) {
                v = 1;
                while (vals[v] && v <= board.size) ++v;
                dir = 'up';
                if (v > board.size) v = 0;
                break;
            } else if (!vals[v] && (vals[v+1] || vals[v-1])) {
                if (vals[v-1] && !vals[v+1]) dir = 'up';
                break;
            }
        }
    }
    return {insertVal: v, direction: dir};
};

let clickOnCell = function(brd,cell) {
    let dir = brd.direction;
    if (cell.given) {
        if (brd.prevCell && (brd.prevCell.id === cell.id) ) dir = ( dir === 'up' ? 'down' : 'up' );
        let vf = nextInsertVal(dir, cell.val, brd);
        return Objectassign({}, brd, vf, {prevCell: cell});
    }
    else if (cell.val > 0) {
        brd = clearVal(brd,cell.id);
        return Objectassign({}, brd, {insertVal: cell.val, prevCell: cell, prevState: brd, moves: brd.moves + 1});
    }
    else {
        brd = setVal(brd, cell.id, brd.insertVal);
        let ival = (dir === 'up' ? brd.insertVal + 1 : brd.insertVal - 1 );
        if (brd.vals[ival]) {
            let o = nextInsertVal( dir, ival, brd); 
            ival = o.insertVal;
            dir = o.direction;
        }
        return Objectassign({}, brd, {insertVal: ival, direction: dir, prevCell: cell, prevState: brd, moves: brd.moves + 1});
    }
    return brd;  // should not happen
};

export function hidatoReducer(st, action) {
    if (!st) {
        return initState();
    }
    let v = st.insertVal;
    let dir = st.direction;
    let prv = st.prevState;
    let brd = null;

    switch (action.type) {
    case 'loadHidatoBoard':
        //console.log("loading board");
        let js = action.json || st;
        brd = newBoard(js);
        brd = renderBoard(brd,action.side);
        brd = initState(brd);
        return brd;

    case 'clickOnCell': 
        return clickOnCell(st, action.cell);

    case 'prevInsertVal':
        dir = 'down';
        v = nextInsertVal(dir, v, st);
        return Objectassign({}, st, v, {prevCell: null}); 

    case 'nextInsertVal':
        dir = 'up';
        v = nextInsertVal(dir, v, st);
        return Objectassign({}, st, v, {prevCell: null}); 

    case 'check':
        brd = checkBoard(st);
        return Objectassign({}, brd, {prevCell: null, moves: st.moves+10 });

    case 'undo':
        //console.log("undo called");
        if (!prv) return st;
        return Objectassign({}, prv, { moves: st.moves+1 });

    case 'reset':
        let i = 1;
        let rslt = resetBoard(st);
        rslt = initState(rslt);
        rslt.moves = st.moves; 
        return rslt;

    default:
        return st;
    };

};

