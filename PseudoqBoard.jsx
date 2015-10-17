"use strict";

window.jQuery = require('jquery');

require('./css/bootstrap-flatly.css');
require('./css/psq.css');
require('bootstrap');
let oxiDate = require('./oxidate.js');
let utils = require('./utils.js');

let timeSpan = require('timeSpan');

let grph = require('graphics');
let React = require('react');
let ReactDOM = require('react-dom')
let ReactBootStrap = require('react-bootstrap');

const { Button, ButtonToolbar, ButtonGroup, Input, Modal } = ReactBootStrap;

let {LinkContainer} = require('react-router-bootstrap');
let SolutionsTable = require('SolutionsTable.jsx');
let ChallengesTable = require('challengesTable.jsx');
let PickerPanels = require('pickers.js');
let HorizontalPickerPanel = PickerPanels.Horizontal;
let VerticalPickerPanel = PickerPanels.Vertical;
let ColwisePickerPanel = PickerPanels.Colwise;
let RowwisePickerPanel = PickerPanels.Rowwise;
let tinycolor = require('tinycolor2');
let Flex = require('flex.jsx');
//let carota = require('carota');
let renderedBoards = {};

let renderBoard = function(brd,mode) {
    let ky = brd.pubID.toString() + brd.unitsize + (mode === 'view' ? '1' : '0') + (mode === 'completed' ? '1' : '0') ;
    let cUrl = renderedBoards[ky];

    if (!cUrl) {
        //console.log('rendering : '+mode);
        let d = grph.Drawer(brd);
        let canvas = d.drawLayout();
        cUrl = canvas.toDataURL();
        renderedBoards[ky] = cUrl;
    }
    return cUrl;
}


let vals = [1, 2, 3, 4, 5, 6, 7, 8, 9];
let defaultAvail = Object.create(null);
vals.forEach( function(i) {
    defaultAvail[i] = false; 
});


let CheckModal = React.createClass({

    getInitialState() {
        return { showModal: false };
    },

    close() {
        this.setState({ showModal: false });
    },

    open() {
        this.setState({ showModal: true });
    },

    fixErrors() {
        this.close();
        this.props.fix();
    },

    render() {
        let modal = this.props.check() ? (
                <Modal show={this.state.showModal} onHide={this.close}>
                  <Modal.Header closeButton>
                    <Modal.Title>Errors found</Modal.Title>
                  </Modal.Header>
                  <Modal.Body>
                      <div> Mistakes have been made! Revert to last good state?
                      </div>
                  </Modal.Body>
                  <Modal.Footer>
                    <Button onClick={this.fixErrors} bsStyle="primary">Revert</Button>
                    <Button onClick={this.close} >Cancel</Button>
                  </Modal.Footer>
                </Modal>
            ): (
                <Modal show={this.state.showModal} onHide={this.close}>
                  <Modal.Header closeButton>
                    <Modal.Title>Heavenly bliss</Modal.Title>
                  </Modal.Header>
                  <Modal.Body>
                      <div> Fantastic, you&apos;ve managed to not fuck it up yet ... You&apos;re naked genius shines eternal!
                      </div>
                  </Modal.Body>
                  <Modal.Footer>
                    <Button onClick={this.close} >Close</Button>
                  </Modal.Footer>
                </Modal>
            );
        return (
              <Button bsSize='small' block>
                <div onClick={this.open} >Check</div>
                {modal}
              </Button>
            );
    }

});

let RestartModal = React.createClass({
  getInitialState() {
    return { showModal: false };
  },

  close() {
    this.setState({ showModal: false });
  },

  open() {
    this.setState({ showModal: true });
  },

  restart() {
    this.close();
    this.props.restart();
  },

  render() {
    return (
      <Button bsSize="small" block>
        <div onClick={this.open} >Restart</div>

        <Modal show={this.state.showModal} onHide={this.close}>
          <Modal.Header closeButton>
            <Modal.Title>Restart Puzzle</Modal.Title>
          </Modal.Header>
          <Modal.Body>
              <div>This will erase all moves and restart the puzzle from scratch.  It is not Undo-able.
              </div>
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={this.restart} bsStyle="primary">Proceed</Button>
            <Button onClick={this.close} >Cancel</Button>
          </Modal.Footer>
        </Modal>
      </Button>  
    );
  }
});

let Poss = React.createClass({
    handleRightClick: function(e) {
        if (this.props.mode === 'play') {
            this.props.setCellValue(this.props.val);
            e.preventDefault();
        }
    },

    render: function() {
        let board = this.props.board;
        let styl = {
                display: 'block',
                width: board.possSize,
                height: board.possSize,
                float: 'left',
                textAlign: 'center',
                fontFamily: 'Verdana',
                fontWeight: '600',
                fontSize: board.possFontSize,
                color: this.props.clr, 
                cursor: 'default',
                backgroundColor: this.props.bkg
            };
        return(
            <div style={styl} onContextMenu={this.handleRightClick} > 
               {this.props.val}
            </div>
        );
    }

});

let GameState = React.createClass({
    getInitialState: function() {
        return {
            notused: true
        }
    },
    render: function() {

    }
});

/*
let Carota = React.createClass({
    render: function() {
        let div = <div></div>;
        let editor = carota.editor.create(div);
        return editor;
    }
});
*/

let Cell = React.createClass({
    getInitialState: function() {
        return {
            promoted: false
        }
    },

    handleClick: function() {
        if (this.props.mode === 'play' || this.props.mode === 'review') this.props.handleClick(this);
    },

    handleKeyPress: function(e) {
        if (this.props.mode === 'play') {
            let it = e.which - 48;
            this.setCellValue(it);
        }
    },

    setCellValue: function(it) {
        this.props.setCellValue(this.props.cid,it);
    },

    render: function() {
        let id = this.props.cid;
        let mdl = this.props.model;
        let mode = this.props.mode;
        let board = this.props.board;
        let issel = this.props.issel;
        let isreviewsel = mode === 'review' && this.props.isreviewsel;
        let ps = mdl[id];
        /*
        let cellSize = ( board.unitsize * (21 / 36) ) ;
        let possSize = cellSize / 3;
        let cellLeft = (cellSize / 6);
        let cellTop = cellLeft + (board.unitsize / 25);
        let fontSize = Math.floor( board.unitsize * 100 / 36 ).toString() + "%";
        */

        let borderStyle = {
            display: 'block',
            float: 'left',
            width: board.unitsize,
            height: board.unitsize,
            padding: 6
        };

        let cellStyle = {
            display: 'block',
            position: 'relative',
            backgroundColor: 'Transparent',
            top: board.cellTop,
            left: board.cellLeft,
            width: board.cellSize,
            height: board.cellSize,
            float: 'left',
            padding: 0,
            margin: 0
        };

        if (mode === 'review' && isreviewsel) borderStyle.backgroundColor = tinycolor("rgba (0, 0, 196, .1)");
        else if (this.props.active && this.props.completed) {
            //console.log("soln : "+this.props.solutionn+", "+( (typeof ps === 'object') ? ps[this.props.solution] : ps));
            let ok = (typeof ps === 'object' && ps[this.props.solution]) || ps === this.props.solution;
            if (!ok) cellStyle.backgroundColor = board.clrRed;
        }



        if (!this.props.active) {
            return(
                <div style={borderStyle} />
            );

        } else if (typeof ps === 'object') {
            let alltrue = true;
            vals.forEach( function(i) { if (!ps[i]) { alltrue = false; return; } });
            if (alltrue && !issel) {
                return mode === 'view' ? ( <div style={borderStyle}  /> )
                                                  : ( <div style={borderStyle} onKeyPress={this.handleKeyPress} onClick={this.handleClick}  tabIndex='0' /> );
            } else {
                let fontsz = board.possFontSize; //Math.floor(possSize * 6.5).toString() + '%';
                let poss =
                    vals.map( function(i) {
                        let bkg = 'Transparent'; // board.clrBackGround;
                        let clr = ps[i] ? board.clrForeGround : 'Transparent';
                        if (issel && ps[i] ) {
                            bkg = this.props.pickers[i] ? board.clrRed : board.clrGreen;
                        }
                        return (
                            <Poss board={board} mode={mode} setCellValue={this.setCellValue} bkg={bkg} clr={clr} key={i} val={i} />
                        );
                    }, this);
                return this.props.mode === 'view' ? (<div style={borderStyle}  ><div style={cellStyle} >{poss}</div></div> )
                                                  : (
                   <div style={borderStyle}  onKeyPress={this.handleKeyPress} onClick={this.handleClick} tabIndex='0'>
                       <div style={cellStyle}>
                           {poss}
                       </div>    
                    </div>
                );
            }
        } else {
            cellStyle.color = board.clrForeGround;
            cellStyle.textAlign = "center";
            cellStyle.fontWeight = "bold";
            cellStyle.fontSize = board.cellFontSize;
            return (
                <div style={borderStyle}  >
                    <div style={cellStyle} onClick={this.handleClick}  tabIndex='0' >{ps}</div>
                </div>
            );
        };

    }

});

let Timer = React.createClass({

    getInitialState: function(){
        return { timer: null, elapsed: 0};
    },

    componentDidMount: function(){
        this.setState({timer: window.setInterval(this.tick, 500)});
    },

    componentWillUnmount: function(){
        window.clearInterval(this.state.timer);
    },

    tick: function(){
        if (!this.props.timer.isPaused()) {
            this.setState({elapsed: this.props.timer.elapsed()});
        }        
    },

    render: function() {
        var elapsed = new timeSpan(this.state.elapsed);
        return <span>{elapsed.toString()}</span>;
    }
});

let Progress = React.createClass({

    getInitialState: function(){
        return { timer: null, elapsed: 0};
    },

    componentDidMount: function(){
        this.setState({timer: window.setInterval(this.tick, 500)});
    },

    componentWillUnmount: function(){
        window.clearInterval(this.state.timer);
    },

    tick: function(){
        let el = Math.floor(this.props.timer.elapsed() / 1000);
        if (el >= this.props.timeOut) {
            if (this.props.onTimeout) this.props.onTimeout();
            window.clearInterval(this.state.timer);
        }
        this.setState({elapsed: el});
    },

    render: function() {
        var elapsed = this.state.elapsed;
        //console.log("elapsed : "+elapsed);
        var tmOut = this.props.timeOut; 
        let h = this.props.height;
        let w = this.props.width;
        var pc = Math.floor((elapsed / tmOut) * 100);
        var pct = pc.toString() + '%'; 
        var pcr = (100-pc).toString() + '%'; 
        return (
            <Flex row style={{height: h, width: '100%', borderStyle: 'solid', borderWidth: 2, marginTop: 5, marginLeft: 5, padding: 6 }} >
                <Flex column style={{alignItems: 'center'}} >
                    <Flex row style={{flex: 1} }>Score</Flex>
                    <Flex row style={{flex: 2, fontSize: 30 }}>{ this.props.score }</Flex>
                    <Flex row style={{borderStyle: 'solid', borderWidth: 1, flex: 70, width: '100%'}}>
                        <Flex column>
                            <Flex row style={{backgroundColor: 'Transparent', flex: pc, width: '100%' }} />
                            <Flex row style={{backgroundColor: 'red', flex: (100-pc), width: '100%' }} />
                        </Flex>
                    </Flex>
                </Flex>
            </Flex>
        );
    }
});



let PseudoqBoard = React.createClass({ 

    statics: {
        newPickers: function() { return [false,false,false,false,false,false,false,false,false,false]; },
        newModel: function(cols,rows) {
            let mdl = Object.create(null);
            cols.forEach( function(c) {
                rows.forEach( function(r) {
                    let trues = Object.create(null)
                    vals.forEach( function(i) {
                        trues[i] = true;
                    });
                    mdl[c+r] = trues;
                });
            }); 
            mdl.comment = '';
            mdl.moveCount = 0;
            return mdl;
        },

        createModel: function(prnt) {
            let mdl = Object.create(prnt);
            mdl.comment = '';
            mdl.moveCount = prnt.moveCount + 1;
            return mdl;
        }

    },

    getInitialState: function() {
        return {
            pickers: PseudoqBoard.newPickers(),
            selectedCells: [],
            selectedreviewCells: [],
            mode: 'view',
            model: undefined,
            storedModel: undefined,
            cvsurl: '',
            board: undefined,
            boardsize: 9 ,
            timer: null,
            autoEliminate: true,
            autoPromote: false,
            focusCell: undefined,
            moveComment: '',
            moveIndex: -1,   // currently only used in review mode
            savedMoveCount: 0,
            savedModel: undefined,
            moves: [], 
            newMoves: [],
            solutions: [],
            reSubmit: false,
            reSubmitTimer: null,
            completed: false,
            pickerPanelPos: 'top',
            unitsize: 54,
            lastMoveWasUndo: false,
            layoutNo: 1,
            colorTag: 'Transparent'
        };
    },

    setModelState: function(mdl,st,cb) {
        let cmt = this.state.moveComment;
        let newst = {   model: mdl,
                        pickers: [false,false,false,false,false,false,false,false,false,false],
                        selectedCells: [],
                        moveComment: '',
                        lastMoveWasUndo: false
                    };
        if (typeof st === 'string') cmt = st; 
        else if (typeof st === 'function') cb = st;
        else if (st && typeof st === 'object') {
            Object.keys(st).forEach( function(c) {
                newst[c] = st[c];
            });
        }
        mdl.comment = cmt;
        this.setState( newst, cb);
    },

    hasSolution: function() {
        let solns = this.state.solutions;
        return solns && solns.length > 0;
    },

    saveComment: function() {
        var cmt = this.refs.comment.getValue();
        this.setState({
            moveComment: cmt
        });
    },

    restart: function() {
        let board = this.state.board;
        let mdl = PseudoqBoard.newModel(board.cols,board.rows);
        mdl.moveCount = this.state.model.moveCount;
        this.setModelState(mdl);
    },

    getPickables: function() {
        let avail = Object.create(defaultAvail);
        let state = this.state;
        let mdl = state.model;
        state.selectedCells.forEach( function (id) {
            let ps = mdl[id];
            vals.forEach(function(i) {
                if (!avail[i] && ps[i]) avail[i] = true;
            });
        });
        return avail;
    },

    isCompleted: function(mdl, board) {
        board = board || this.state.board;
        let soln = board.solution;
        return board.cols.every( function(c) {
            return board.rows.every( function(r) {
                let id = c+r;
                let ps = mdl[id];
                let chk = soln[id];
                return !this.isCellActive(id) || ( typeof ps !== 'object' ? ps === chk : vals.every( function (i) { return i === chk ? ps[i] : !ps[i]; }) );
            }, this);
        }, this);
    },

    completionPoints: function(mdl) {
        mdl = mdl || this.state.model;
        let board = this.state.board;
        let soln = board.solution;
        let score = 0;
        let tot = 0;
        board.cols.forEach( (c) => {
            board.rows.forEach( (r) => {
                let id = c+r;
                if (this.isCellActive(id)) {  
                    let ps = mdl[id];
                    let chk = soln[id];
                    tot += 8;
                    if ( typeof ps !== 'object' ) {
                         if (ps === chk) score += 8;
                    } else {
                        let ok = true;
                        let tscore = 0
                        vals.forEach( (i) => { 
                            if (i === chk && !ps[i]) ok = false;
                            else if (!ps[i]) tscore += 1; 
                        });
                        if (ok) score += tscore; 
                    } 
                } 
            });
        });
        return {points: score, total: tot};

    },

    percentCompleted: function(mdl) {
        mdl = mdl || this.state.model;
        let {points, total} = this.completionPoints(mdl);
        return Math.round((points/total) * 100);
    },

    toggleCellSelect: function(cell) {
        let mode = this.state.mode;
        if (mode === 'view') return;
        let selectedCells = mode.indexOf('review') >= 0 ? this.state.selectedreviewCells : this.state.selectedCells;
        let id = cell.props.cid;
        let i = selectedCells.indexOf(id);
        if ( mode.indexOf('review') >= 0) {
            if ( i >= 0 ) { 
                selectedCells.splice(i,1)
            } else {
                selectedCells.push(id); 
            }
        } else {
            if (this.state.board.size === 21) {
                let col = id.charCodeAt(0) - 65;
                let row = parseInt( id.slice(1) ) - 1;
                let ppos = this.state.pickerPanelPos;
                if (ppos === 'top') { if (row > 11) this.setPickerPanelPos('bottom'); }
                else if (ppos === 'bottom') { if (row < 9) this.setPickerPanelPos('top'); }
                else if (ppos === 'left') { if (col > 11) this.setPickerPanelPos('right'); }
                else if (col < 9) { this.setPickerPanelPos('left'); }
            }

            if ( i >= 0 ) { 
                selectedCells.splice(i,1)
                let avail = this.getPickables();
                let pkrs = this.state.pickers;
                let fnd = false;
                vals.forEach( function (i) {
                    if (pkrs[i] && !avail[i]) {
                        fnd = true;
                        pkrs[i] = false;
                    }
                });
                if (fnd) this.setState({pickers: pkrs});
            } else { 
                let ps = this.state.model[id];
                if (typeof ps === 'object') {
                    selectedCells.push(id); 
                }
            }
        }
        ReactDOM.findDOMNode(cell).focus();
        this.setState({focusCell: cell});
    
    },

    handleKeyPress: function(cell,e) {
        let it = e.which - 48;
        this.setCellValue(cell.props.cid,it);
    },

    selectThisOne: function(it) {
        if (this.state.selectedCells.length !== 1) return;
        let pkrs = this.state.pickers;
        if (pkrs[it]) return;
        this.setCellValue(this.state.selectedCells[0],it);
    },

    setCellValue: function(cid,it) {
        if (this.state.mode === 'view') return;
        let selectedCells = this.state.selectedCells;
        let newmdl = PseudoqBoard.createModel(this.state.model);
        let i = selectedCells.indexOf(cid);
        if ( it > 0 && it < 10 ) {
            let ps = newmdl[cid];
            if (typeof ps === 'object' && ps[it]) {
                if ( i >= 0 ) selectedCells.splice(i,1);
                newmdl[cid] = it;
                if (this.state.autoEliminate) {
                    let newmdl2 = this.eliminate(cid, newmdl);
                    if (newmdl2) {
                        newmdl.comment = this.state.moveComment;
                        this.setModelState(newmdl2, 'Elimination');
                    } else this.setModelState(newmdl);
                } else this.setModelState(newmdl);
            }
        }
    },

    eliminate: function(cid, prnt) {
        let newmdl = PseudoqBoard.createModel(prnt || this.state.model);
        let autoPromote = this.state.autoPromote;
        let it = newmdl[cid];
        if ( typeof it === 'object') return;
        let regs = this.state.regions;
        let fnd = false;
        regs.forEach( function(reg) {
            let j = reg.indexOf(cid);
            if (j >= 0) {
                reg.forEach( function (c) {
                    if (c !== cid) {
                        let ps = newmdl[c];
                        if ( typeof ps === 'object' && ps[it]) {
                            let newps = Object.create(null);
                            let mps = -1;
                            vals.forEach( function(i) {
                                if (ps[i]) {
                                    if (i !== it) {
                                        mps = mps < 0 ? i : 0;
                                        newps[i] = true;
                                    } else {
                                        newps[i] = false;
                                        fnd = true;
                                    }
                                } else newps[i] = false;
                            });
                            newmdl[c] = (mps > 0 && autoPromote) ? mps : newps;
                        }

                    }
                });
            }    
        });
        return fnd ? newmdl : undefined;
    },

    togglePicker: function(i) {
        let pkrs = this.state.pickers;
        pkrs[i] = !pkrs[i];
        this.setState({pickers: pkrs});

    },

    toggleAllPickers: function() {
        let pkrs = this.state.pickers;
        for (let i = 1; i < 10; ++i) { pkrs[i] = !pkrs[i]; };
        this.setState({pickers: pkrs});
    },

    toggleAutoPromote: function() {
        if (this.state.autoPromote) this.setState({autoPromote: false});
        else {
            let newmdl = PseudoqBoard.createModel(this.state.model);
            let board = this.state.board;
            board.cols.forEach( function(c) {
                board.rows.forEach( function(r) {
                    let id = c+r;
                    if (this.isCellActive(id)) { 
                        let ps = newmdl[id];
                        if (typeof ps === 'object') {
                            let it = undefined;
                            if (vals.every( function (i) { 
                                                if (!it) {
                                                    if (ps[i]) it = i;
                                                    return true;
                                                } else return !ps[i];
                                            })) newmdl[id] = it;
                        }
                    }
                }, this);
            }, this);
            this.setState({autoPromote: true, model: newmdl});
        } 
    },

    toggleAutoElim: function() {
        let aut = !this.state.autoEliminate;
        localStorage.setItem('pseudoq.settings.autoEliminate', aut ? 'true' : 'false'); 
        this.setState({autoEliminate: aut});
    },

    cycleColorTagging: function() {
        let clr = this.state.colorTag;
        let brd = this.state.board;
        if (clr === 'Transparent') clr = brd.clrYellow;
        else if (clr === brd.clrYellow) clr = brd.clrBlue ;
        else if (clr === brd.clrBlue) clr = brd.clrPurple;
        else if (clr === brd.clrPurple) clr = 'Transparent';
        else console.log("whoops - unknown color");
        this.setState({colorTag: clr});
    },

    nakedGroup: function() {
        let newmdl = this.checkNakedGroup();
        if (newmdl) {
            let cmt = this.state.moveComment ? this.state.moveComment + " (Naked Group)" : "Naked Group";
            this.setModelState(newmdl,cmt);
        }
    },

    checkNakedGroup: function(mdl) {
        let cs = this.state.selectedCells;
        let autoPromote = this.state.autoPromote;
        let l = cs.length;
        let grp = [];
        let fnd = false;
        mdl = mdl || this.state.model;
        if (l > 0 && l < 5) {
            vals.forEach( function(i) {
                if ( cs.some( function(c) { return mdl[c][i]; }) ) grp.push(i); 
            });
            if (grp.length === l) {
                let newmdl = PseudoqBoard.createModel(mdl);
                let regs = this.state.regions;
                regs.forEach( function(reg) {
                    if (cs.every(function(c) { return reg.indexOf(c) >= 0; })) {
                        //console.log("region :" + JSON.stringify(reg));
                        reg.forEach( function (c) {
                            if (cs.indexOf(c) === -1) {
                                let ps = newmdl[c];
                                if ( typeof ps === 'object' && grp.some(function(it) { return ps[it]; }) ) {
                                    let newps = Object.create(null);
                                    let mps = -1;
                                    fnd = true;
                                    vals.forEach( function(i) {
                                        if (ps[i]) {
                                            if (grp.indexOf(i) === -1 ) {
                                                mps = mps < 0 ? i : 0;
                                                newps[i] = true;
                                            }
                                            else newps[i] = false;
                                        } else newps[i] = false;
                                    });
                                    newmdl[c] = (mps > 0 && autoPromote) ? mps : newps;
                                }
                            }
                        });
                    }    
                });
                if (fnd) return newmdl;
            }
        }
        return undefined;
    },

    applySelections: function () {
        if (this.state.selectedCells.length === 0) {
            if (this.state.focusCell) {
                let newmdl = this.eliminate(this.state.focusCell.props.cid);
                if (newmdl) {
                    this.state.model.comment = this.state.moveComment
                    this.setModelState(newmdl, 'Elimination');
                }
            }
        }
        else {
            let pkrs = this.state.pickers;
            if (pkrs.every( function(pkr) { return !pkr; })) this.nakedGroup(); 
            else this.applySels(pkrs);
        }
    },

    applySels: function(pkrs) {
        let fnd = false;
        let mdl = this.state.model;
        let autoPromote = this.state.autoPromote;
        let newmdl = PseudoqBoard.createModel(mdl);
        this.state.selectedCells.forEach( function(cid) {
            let ps = newmdl[cid];
            let mps = -1;
            let newps = Object.create(null);
            vals.forEach( function(i) {
                if (pkrs[i] && ps[i]) {
                    fnd = true;
                    newps[i] = false;
                } else {
                    newps[i] = ps[i];
                    if (ps[i]) mps = mps < 0 ? i : 0;
                };
            });
            newmdl[cid] = (mps > 0 && autoPromote) ? mps : newps;
        });
        if (fnd) {
            if (this.state.autoEliminate) {
                let newmdl2 = this.checkNakedGroup(newmdl);
                if (newmdl2) {
                    newmdl.comment = this.state.moveComment;
                    this.setModelState(newmdl2, "Naked Group"); 
                }
                else this.setModelState(newmdl);
            }
            else this.setModelState(newmdl);
        }
        else this.setModelState(mdl); 
    },

    undo: function() {
        let mdl = this.state.model;
        let prvmdl = Object.getPrototypeOf(mdl);
        if (prvmdl) {
            if (this.state.lastMoveWasUndo) prvmdl.moveCount = mdl.moveCount + 1;
            this.setModelState(prvmdl,{lastMoveWasUndo: true});
        }
    },

    constructMoves: function(mdl,storeModel) {
        let _cons = function _cons(mdl,storeModel) {
            let prnt = Object.getPrototypeOf(mdl);
            if (!prnt) return [];
            let rslt = Object.getPrototypeOf(prnt) ? _cons(prnt,storeModel) : [];
            let pstr = function(ps) {
                let trslt = '';
                if (typeof ps === 'object') vals.forEach( function(i) { if (ps[i]) { trslt += i.toString(); } } );
                else trslt = ps.toString();
                return trslt;
            };
            let a = {};
            Object.keys(mdl).forEach( function(c) {
                if (mdl[c]) {
                    let s = pstr(mdl[c]);
                    if (s.length < 9) a[c] = pstr(mdl[c]);
                }
            });
            a.comment = mdl.comment; 
            a.moveCount = mdl.moveCount;
            if (storeModel) {
                let t = {}
                t.model = prnt;
                t.move = a;
                a = t;
            }
            rslt.push(a);
            return rslt;
        }
        let rslt = _cons(mdl,storeModel);
        if (storeModel) rslt.push({model: mdl, move: {dummy: true, comment: '', moveCount: mdl.moveCount}});
        return rslt;

    },

    play: function() {
        this.setState({mode: 'play'});
    },
    
    review: function() {
        let mdl = this.state.model;
        let mvs = this.constructMoves(mdl, true);
        let cmt = mvs.length === 0 ? '' : mvs[0].move.comment;
        let cnt = mdl.moveCount;
        this.setState({mode: 'review', moves: mvs, moveIndex: 0, moveComment: cmt, savedMoveCount: cnt, savedModel: mdl}, this.reviewFirst);
    },

    reviewSolution: function(a) {
        let board = this.state.board;
        let mdl = PseudoqBoard.newModel(board.cols,board.rows);
        mdl = this.applyMovesToModel(mdl,a);
        let mvs = this.constructMoves(mdl, true);
        let cmt = mvs.length === 0 ? '' : mvs[0].move.comment;
        let savmdl = this.state.model;
        let cnt = savmdl.moveCount;
        this.setState({mode: 'reviewSolution', moves: mvs, moveIndex: 0, moveComment: cmt, savedMoveCount: cnt, savedModel: savmdl}, this.reviewFirst);
    },

    reviewGoto: function(i,mvs) {
        //console.log('goto : '+i);
        mvs = mvs || this.state.moves;
        mvs[this.state.moveIndex].move.comment = this.state.moveComment;
        if (i < 0 || i >= mvs.length) return;
        let mv = mvs[i];
        let sels = [];
        let pkrs = PseudoqBoard.newPickers();
        let mdl = mv.model;

        Object.keys(mv.move).forEach( function(cid) {
            if (cid !== 'comment' && cid !== 'moveCount' && mdl[cid]) sels.push(cid);
        });


        vals.forEach( function(i) { 
            sels.forEach( function(cid) { 
                let ps = mdl[cid];
                if (typeof ps === 'object') {
                    if (!pkrs[i] && ps[i]) pkrs[i] = true; 
                }
            });
        });

        sels.forEach( function(cid) {
            let ps = mv.move[cid];
            vals.forEach( function(i) {
                if (ps.indexOf(i) >= 0 ) {
                    pkrs[i] = false;
                };
            });
        });
        this.setState({model: mdl, moveComment: mv.move.comment || '', selectedCells: sels, pickers: pkrs, moveIndex: i});
    },

    reviewLoad: function() {
        let a = this.state.moves;
        a[this.state.moveIndex].move.comment = this.state.moveComment;
        let cnt = this.state.savedMoveCount;
        a.length = this.state.moveIndex + 1;
        let moves = a.map( function(mv) { return mv.move; } );
        moves.splice(moves.length - 1,1);
        let mdl = a[0].model;
        mdl = this.applyMovesToModel(mdl, moves);
        mdl.moveCount += cnt;
        this.setModelState(mdl, '', this.play );
    },

    reviewReturn: function() {
        let mdl = this.state.savedModel;
        if (mdl) {
            mdl.comment = '';
            //mdl.moveCount += 2;
            this.setModelState(mdl, {mode: 'play', savedModel: undefined, savedMoveCount: 0});
        }
    },

    reviewFirst: function() {
        this.reviewGoto(0);
    },

    reviewNext: function() {
        this.reviewGoto(this.state.moveIndex + 1);
    },

    reviewPrev: function() {
        this.reviewGoto(this.state.moveIndex - 1);
    },

    reviewLast: function() {
        this.reviewGoto(this.state.moves.length - 1);
    },

    autoSubmit: function(mdl) {
        mdl = mdl || this.state.model;
        this._submit(this.constructMoves(mdl, true));
    },

    reviewSubmit: function() {
        this._submit(this.state.moves);
    },

    tick: function() {
        if (this.isMounted && !this.state.completed) this.setState({reSubmit: true});
    },

    _submit: function(a) {
        let {board, mode} = this.state;
        let id = board.pubID;
        let {dayName, pos, timeOut} = this.props;

        let xhr = new XMLHttpRequest();   
        if (timeOut) xhr.open("POST", "/challenges");
        else xhr.open("POST", "/solutions");
        xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        let rslt = timeOut? {timeOut: timeOut} : {puzzle: id};
        rslt.lastPlay = new Date();
        if (a && a.length > 0) {
            let mvs = a.map( function(mv) { return mv.move; } );
            rslt.doc = {moves: mvs};
            rslt.moveCount = mvs[mvs.length-1].moveCount;
            let {points, total} = this.completionPoints();
            rslt.completed = (points === total);
            rslt.percentCompleted = Math.round(100 * points / total);
            if (timeOut) rslt.points = points;
        } else {
            rslt.doc = {moves: []};
            rslt.moveCount = 0;
            rslt.percentCompleted = 0;
            //rslt.secondsElapsed = 0;
            rslt.completed = false;
        }

        let txt = JSON.stringify(rslt);

        xhr.onload = () => this.receiveSolutions(xhr);
        xhr.send(txt);
        this.setState({reSubmit: false});
    },

    requestSolutions: function(a) {
        let xhr = new XMLHttpRequest();   
        let {timeOut} = this.props;
        if (timeOut) xhr.open("GET", "/challenges/"+timeOut);
        else xhr.open("GET", "/solutions/"+this.state.board.pubID);
        //let that = this;
        //xhr.onload = () => { that.receiveSolutions(xhr) };
        xhr.onload = () => this.receiveSolutions(xhr);
        xhr.send();
    },

    receiveSolutions: function(xhr) {
        if(xhr.status !== 200) { 
            let msg = 'failed : ' + xhr.status + " - " + xhr.responseText;
            console.log(msg);
        } else {
            let rsp = JSON.parse(xhr.responseText);
            if (rsp.ok) {

                let {dayName, pos, timeOut} = this.props;
                if (timeOut) {
                    let rslts = rsp.results ;
                    this.setState({solutions: rslts});  // lazy kludge?
                } else {
                    let solns = rsp.solutions.sort(utils.solutionSorter);
                    //console.log("solutions received : "+solns.length);
                    //solns.forEach(function (s) {console.log(s.lastPlay);});
                    //localStorage.setItem('pseudoq.solutions.' + dayName + '.' + pos, JSON.stringify(solns));
                    this.setState({solutions: solns});
                }
            } else {
                console.log(rsp.msg);
            }
        }
    },

    reviewShow: function() {
        let a = this.state.moves;
        let mvs = [];
        a.forEach( function(mv) { 
            let o = Object.create(null);
            let mov = mv.move;
            if (!mov.dummy) {
                Object.keys(mov).forEach(function (k) {
                    if (k !== 'moveCount' && k !== 'comment') o[k] = mov[k];  
                });
                if (mov.comment) o.comment = mov.comment;
                mvs.push(o);
            } 
        });
        let rslt = {user: 'anonymousCoward', puzzle: this.props.puzzleId, moves: mvs }
        let txt = JSON.stringify(rslt);
        let w = window.open("data:text/json," + encodeURIComponent(txt), "_blank"); //, "width=200,height=100");
        w.focus();
    },

    applyMoveToModel: function(orgmdl,m) {
        let mdl = PseudoqBoard.createModel(orgmdl);
        Object.keys(m).forEach( function(cid) {
            if (cid !== 'moveCount' && cid != 'comment' && cid != 'user' && mdl[cid]) {
                let oks = m[cid];
                if (oks.length === 1) {
                    mdl[cid] = parseInt(oks);
                } else {
                    let ps = Object.create(null)
                    vals.forEach( function(i) {
                        let c = i.toString();
                        ps[i] = oks.indexOf(c) >= 0;
                    });
                    mdl[cid] = ps;
                }
            }
        }); 
        mdl.comment = m.comment;
        mdl.moveCount = m.moveCount;
        mdl.user = m.user;
        return mdl;
    },

    applyMovesToModel: function (org, mvs) {
        let mdl = org;   
        mvs.forEach(function (m) { mdl = this.applyMoveToModel(mdl,m); }.bind(this));
        return mdl;
    },

    isCellActive: function(id) {
        let a = [
          "J1", "K1", "L1", "J2", "K2", "L2", "J3", "K3", "L3",
          "J4", "K4", "L4", "J5", "K5", "L5", "J6", "K6", "L6",
          "J16", "K16", "L16", "J17", "K17", "L17", "J18", "K18", "L18",
          "J19", "K19", "L19", "J20", "K20", "L20", "J21", "K21", "L21",
          "A10", "B10", "C10", "D10", "E10", "F10", "P10", "Q10", "R10", "S10", "T10", "U10",
          "A11", "B11", "C11", "D11", "E11", "F11", "P11", "Q11", "R11", "S11", "T11", "U11",
          "A12", "B12", "C12", "D12", "E12", "F12", "P12", "Q12", "R12", "S12", "T12", "U12" ]
        return a.indexOf(id) < 0;
    },

    checkForErrors: function(mdl) {

        let board = this.state.board; 
        let soln = board.solution;
        mdl = mdl || this.state.model;

        return board.cols.some( function(c) {
            return board.rows.some( function(r) {
                let id = c+r;
                let rslt = false;
                if (Object.prototype.hasOwnProperty.call(soln,id)) {
                    let sn = soln[id];
                    let ps = mdl[id];
                    rslt = (typeof ps === 'object') ? !ps[sn] : ps !== sn;
                }
                return rslt;
            });
        });
    },

    fixErrors: function() {
        let mdl = this.state.model;
        let nmvs = mdl.moveCount + 10;
        if (this.checkForErrors()) {
            while (true) {
                mdl = Object.getPrototypeOf(mdl)
                if (!this.checkForErrors(mdl)) break;
            }
        }
        mdl.moveCount = nmvs;
        this.setModelState(mdl);
    },

    initRegions: function(cols,rows) {
        let regs = []
        let sz = rows.length;
        let origs =  sz === 9 ? [ [0,0 ] ]
                              : [ [6,6], [0,0], [0,12], [12,0], [12,12] ]

        origs.forEach( function(e) {
            let x = e[0], y = e[1];
            let cid;
            let reg;
            for (let c = 0; c < 9; c++) {
                reg = []; 
                for (let r = 0; r < 9; r++) {
                    cid = cols[x+c] + rows[y+r]
                    reg.push(cid);
                };
                regs.push(reg)
            }; 

            for (let r = 0; r < 9; r++) {
                reg = []; 
                for (let c = 0; c < 9; c++) {
                    cid = cols[x+c] + rows[y+r]
                    reg.push(cid);
                };
                regs.push(reg)
            }; 

            let a = [0,1,2];

            for (let n = 0; n < 9; n++) {
                let x0 = ( n % 3 ) * 3;
                let y0 = Math.floor( n / 3 ) * 3;
                reg = [];
                a.forEach( function (i) {
                    a.forEach( function (j) {
                        cid = cols[x+x0+i] + rows[y+y0+j]
                        reg.push(cid);
                    });
                });
                regs.push(reg); 

            };
        });

        return regs;

    },

    getLocalStorage: function() {
        let {dayName, pos, brdJson} = this.props;
        let pzl = dayName + "/" + pos;
        let mvs = localStorage.getItem('pseudoq.local.' + pzl);
        let bmvs = brdJson.moves;
        if (mvs) {
            mvs = JSON.parse(mvs);
            if (mvs.pubID !== brdJson.pubID) mvs = null;
            else mvs = mvs.moves;
        }
        if (bmvs) bmvs = bmvs.moves;
        let a = mvs && mvs.length > 0 ? mvs[mvs.length - 1].moveCount : -1; 
        let b = bmvs && bmvs.length > 0 ? bmvs[bmvs.length - 1].moveCount : -1; 
        if (b > a) mvs = bmvs;
        return mvs;
    },

    setLocalStorage: function(mvs) {
        let {dayName, pos} = this.props;
        let pzl = dayName + "/" + pos;
        localStorage.setItem('pseudoq.local.' + pzl, mvs);
    },

    changeLayout: function() {
        let lno = this.state.layoutNo + 1;
        if (lno === 5) lno = 1;
        localStorage.setItem('pseudoq.settings.layoutNo', lno.toString()); 
        this.setState({layoutNo: lno});
    },

    setUnitSize: function(unitsz) {
        let st = this.state;
        let sz = st.board.cols.length;
        localStorage.setItem('pseudoq.settings.' + sz, unitsz.toString()); 
        this.setState({unitsize: unitsz});
    },

    enlarge: function() {
        this.setUnitSize(this.state.unitsize + 9);
    },

    shrink: function() {
        this.setUnitSize(this.state.unitsize - 9);
    },


    componentWillMount: function() { this.initComponent(); },
    componentWillReceiveProps: function() { this.initComponent(); }, 
    initComponent: function() {  
        //console.log('Board will receive props');
        let brd = this.props.brdJson;
        let strt = new Date();
        let mode = this.props.initmode || 'view' ;
        let mvs = this.props.random ? null : mode === 'reviewSolution' ? this.props.initMoves : this.getLocalStorage();

        let sz = parseInt(brd.size)
        let rows = [];
        let cols = [];
        for (let i = 1; i <= sz; ++i) {
            rows.push(i);
            cols.push(String.fromCharCode(64+i));
        }

        brd.cols = cols;
        brd.rows = rows;
        brd.unitsize = 36;
        let regs = [];
        let autoEliminate = true;
        let layoutNo = 1;

        if (mode === 'play' || mode.indexOf('review') >= 0) {
            regs = this.initRegions(cols,rows)
            Object.keys(brd.regions).forEach(r => regs.push(r.split(":")) );
            brd.unitsize = sz == 9 ? 54 : 45;
            let svd = localStorage.getItem('pseudoq.settings.' + sz );
            if (svd) brd.unitsize = parseInt(svd);
            let svdauto = localStorage.getItem('pseudoq.settings.autoEliminate');
            if (svdauto) autoEliminate = (svdauto === 'true');
            let svdlno = localStorage.getItem('pseudoq.settings.layoutNo')
            if (svdlno) layoutNo = parseInt(svdlno);
        }
        brd.clrBackGround = "White";
        brd.clrForeGround = "Black";
        brd.clrRed = "Red";
        brd.clrGreen = "LightGreen";
        brd.clrYellow = "Yellow";
        brd.clrBlue = '#64E8E2';
        brd.clrPurple = '#CE2DB3';

        brd.showTotals = mode !== 'view';
        let gt = brd.lessThans || brd.equalTos;
        brd.gameType = sz == 21 ? ( gt ? "Assassin" : "Samurai")
                                : ( gt ? "Ninja" : "Killer");

        let mdl = PseudoqBoard.newModel(cols,rows);
        let st = {board: brd, unitsize: brd.unitsize, model: mdl, mode: mode, boardsize: rows.length, regions: regs, autoEliminate: autoEliminate, layoutNo: layoutNo, completed: false};
        if (brd.solutions) st.solutions = brd.solutions;
        if (mvs) {
            mdl = this.applyMovesToModel(mdl, mvs);
            st.model = mdl;
            if (mode.indexOf('review') >= 0) {
                st.moves = this.constructMoves(mdl, true);
                st.moveIndex = 0;
                st.moveComment = st.moves[0].move.comment;
                st.model = st.moves[0].model;
            } 
            else st.completed = this.isCompleted(mdl, brd);

        }

        if (mode === 'play' && !st.completed ) {
            if (this.props.random) st.timer = new oxiDate.pauseableTimer();
            else st.reSubmitTimer = window.setInterval(this.tick, 60000);   // only submit a max of once a minute, upon next move.

        }
        this.setState(st);
    },

    componentDidMount: function () {
        //console.log("PseudoqBoard mounted");
        let mode = this.state.mode;
        if (mode.indexOf('review') >= 0) this.reviewFirst();
        else if (mode === 'play') this.requestSolutions();
    },

    componentWillUnmount: function(){
        //console.log("PseudoqBoard will unmount");
        window.clearInterval(this.state.reSubmitTimer);
    },

    getSecondsElapsed: function () {
        let timer = this.state.timer;
        return timer ? Math.round(timer.elapsed() / 1000) : 0;
     },

    timedOut: function () {
        //console.log("timed out");
        if (!this.checkForErrors()) this.autoSubmit();
        this.setState({completed: true});
    },

    reload: function () {
        document.location.reload(true);
    },

    setPickerPanelPos: function(pos) {
        this.setState({pickerPanelPos: pos});
    },

    componentDidUpdate: function(prevProps, prevState) {
        let mode = this.state.mode;
        let board = this.state.board;
        if (mode === 'play' || mode == 'review') {
            let mdl = this.state.model;
            if (mode === 'review' || this.state.storedModel !== mdl) {
                let mvs = {};
                mvs.version = 2.1;
                mvs.pubDay = board.pubDay;
                mvs.samurai = this.state.boardsize === 21;
                mvs.greaterThan = (board.lessThans || board.equalTos ? true : false );
                mvs.rating = board.rating;
                mvs.pubID = board.pubID;

                if (mode === 'play') {
                    mvs.moves = this.constructMoves(mdl);
                    mvs.completed = this.isCompleted(mdl);
                    mvs.lastPlay = new Date();
                } else if (mode === 'review') {
                    let a = this.state.moves;
                    if (a[this.state.moveIndex].move.comment === this.state.moveComment ) mvs = undefined;
                    else {
                        a[this.state.moveIndex].move.comment = this.state.moveComment;
                        mvs.moves = a.map( function(mv) { return mv.move; } );
                    }
                }
                if (mvs) {
                    //let timer = this.state.timer;
                    //if (timer) mvs.started = timer.started;
                    let txt = JSON.stringify(mvs);
                    this.setLocalStorage(txt);
                    //if (mvs.completed && timer) timer.pause();
                    if (mode !== 'review') {
                        let st = {storedModel: mdl};
                        if (this.state.reSubmit || (mvs.completed && !this.state.completed)) {
                            if (!this.props.random) this.autoSubmit(mdl);
                            st.completed = mvs.completed;
                        }
                        this.setState(st);
                    }
                }
            }
        }
    },

    render: function() {
        let that = this;
        let state = this.state;
        let mode = state.mode; 
        let board = state.board;
        if (!board || mode === 'hide') {
             return undefined;
        }
        let {dayName, pos} = this.props;
        //let mvs = this.getLocalStorage();
        //let timeElapsed = mode === 'play' ? this.getSecondsElapsed() : 0; 

        let unitsize = state.unitsize;
        board.unitsize = unitsize;
        let dim = state.boardsize * unitsize + 1; 
        board.cellSize = unitsize * (21 / 36);
        board.possSize = board.cellSize / 3;
        board.cellLeft = (board.cellSize / 6);
        board.cellTop = board.cellLeft + (unitsize / 25);
        board.cellFontSize = Math.floor( unitsize * 3 ).toString() + "%";
        let pss = Math.floor( board.possSize * 6 );
        if (pss < 43) pss = 43;
        board.possFontSize = pss.toString() + '%';


        let completed = mode.indexOf('review') >= 0 ? this.isCompleted(state.model) : ( this.state.completed || this.isCompleted(state.model) );

        if (completed) {
            board.clrBackGround = board.clrGreen;
            board.lineColor = 'black';
        } else {
            delete board.clrBackGround;
            delete board.lineColor;
        }
        let cvsurl = renderBoard(board, completed ? 'completed' : mode);

        let divStyle = {
          color: board.clrBackGround,
          width: dim,
          height: dim,
          background: 'url(' + cvsurl + ')',
          backgroundRepeat: "no-repeat",
        };

        let mnuStyle = {
            width: 130, 
            height: dim + 30,
            display: 'inline-block',
            verticalAlign: 'top',
            padding: 6,
        };

        let btnStyle = {
            width: '100%',
            margin: 2,
        };

        let game = board.gameType;

        let cells = [];
        let soln = board.solution;
        board.rows.forEach( r => {
            board.cols.forEach( c => {
                let id = c+r;
                let issel = state.selectedCells.indexOf(id) >= 0;
                let isreviewsel = state.selectedreviewCells.indexOf(id) >= 0;
                cells.push(
                    <Cell key={id} cid={id} col={c} row={r} 
                          active={this.isCellActive(id)} 
                          model={state.model} 
                          board={board} 
                          mode={mode} 
                          pickers={state.pickers} 
                          issel={issel} 
                          solution={soln[id]}
                          completed={completed}
                          isreviewsel={isreviewsel} 
                          handleClick={this.toggleCellSelect} 
                          setCellValue={this.setCellValue}  />
                )
            }); 
        });

        let layoutNo = this.state.layoutNo;
        let pkrpanels = [];
        let lhcol = null;
        let hpnl = null
        let ppos = this.state.pickerPanelPos;

        let th1 =  <h2>{ mode.indexOf('review') < 0 ? "Play" : "Review"}</h2>;

        let h1txt = this.props.timeOut ? 'Try to get as many points as you can before your time runs out. Go!'
                                       : '"It\'s Sudoku, Jim, but not as we know it." - anon.';

        let h1 = <Flex row style={{justifyContent: 'space-between', width: dim}}>
                    <span>{ th1 }</span>
                    <span>{ h1txt }</span>
                 </Flex>

        let h2 = (
          <Flex row style={ {flex: 'none', justifyContent: 'space-between', height: 30, width: dim, paddingTop: 10} }>
            <span style={ {paddingLeft: 10} } >{ game }</span>
            <span style={ {paddingRight: 10} } >Rating : {board.rating}</span>
          </Flex>
        );


        let btns = []
        if (mode === 'view') {
            let rt = "/" + dayName + "/" + pos;
            btns.push( <LinkContainer key='play' to={rt} ><Button  style={btnStyle} >Play</Button></LinkContainer> );
            let ftr = null;
            let l = this.state.solutions.length;
            if (l > 0) {
                //console.log("solutions : "+l);
                ftr = <div>Solutions: { l }</div>
            }
            return (
                <div> 
                  {h2}
                  <div>
                      <div style={ {display: 'inline-block', width: dim} }>
                        <div className="brd" style={divStyle} >
                          {cells}
                        </div>  
                      </div>
                      <ButtonGroup vertical style={mnuStyle}>
                          {btns}
                      </ButtonGroup>
                  </div>
                  {ftr}
                  {this.props.children}
                </div>
            );
        } 

        let avail = this.getPickables();
        let glyphSpanStyle = {fontFamily: 'entypo', fontSize: '200%', lineHeight: 0} ;
        let tglPt = '\uD83D\uDD04';
        let goPt = '\u25B6';
        let tglSpan = <span style={ glyphSpanStyle} >{tglPt}</span>;
        let goSpan = <span style={ glyphSpanStyle } >{goPt}</span>;
        let mvCount = state.model.moveCount;
        let tmr = null;

        let {points, total} = this.completionPoints();
        //console.log("points: "+points);
        let pccomp = Math.round((points/total) * 100);


        if (mode === 'play') {
            if (this.props.timeOut) {
                if (completed && this.checkForErrors()) points = 0;
                btns.push( <Button key='tryagain' bsSize='small' onClick={this.reload} block >Try Again</Button>);
                btns.push( <Button key='undo' bsSize='small' onClick={this.undo} block >Undo</Button> );
            } else {
                if (!completed) {
                    btns.push( <Button key='undo' bsSize='small' onClick={this.undo} block >Undo</Button> );
                    btns.push( <CheckModal key='check' check={this.checkForErrors} fix={this.fixErrors} /> );
                    if (localStorage.getItem('pseudoq.authprov')  && !this.props.random) {
                        btns.push( <Button key='upload' bsSize='small' onClick={this.autoSubmit} block>Upload</Button>)
                    }
                }
                btns.push( <RestartModal key='restart' restart={this.restart} /> );
                btns.push( <Button key='review' bsSize='small' onClick={this.review} block >Review</Button> );
                if (this.props.random) {
                    tmr = <Flex row style={{ height: 30}}>Time: <Timer timer={this.state.timer } /></Flex>
                }
            }
            btns.push( <Button key='enlarge' bsSize='small' onClick={ this.enlarge } block >Enlarge</Button> );
            btns.push( <Button key='shrink' bsSize='small' onClick={ this.shrink } block >Shrink</Button> );
            if (game === 'Killer' || game === 'Ninja') btns.push( <Button key='layout' bsSize='small' onClick={ this.changeLayout } block >Layout</Button> );

        } else if (mode.indexOf('review') >= 0) {
            btns.push( <Button key='first' bsSize='small' onClick={this.reviewFirst} block >First</Button> );
            btns.push( <Button key='next' bsSize='small' onClick={this.reviewNext} block >Next</Button> );
            btns.push( <Button key='prev' bsSize='small' onClick={this.reviewPrev} block >Prev</Button> );
            btns.push( <Button key='last' bsSize='small' onClick={this.reviewLast} block >Last</Button> );
            if (process.env["NODE_ENV"] !== "production") btns.push( <Button key='show' bsSize='small' onClick={this.reviewShow} block >Show All</Button> );
            if (mode === 'review') {
                btns.push( <Button key='submit' bsSize='small' onClick={this.reviewSubmit} block >Upload</Button> );
            }
            btns.push( <Button key='reviewplay' bsSize='small' onClick={this.reviewLoad} block >Load</Button> );
            btns.push( <Button key='reviewReturn' bsSize='small' onClick={this.reviewReturn} block >Return</Button> );
        }

        let prog =  (mode === 'play' && this.props.timeOut) ? (
            <Progress key='progress' width={mnuStyle.width} height={200} timer={this.state.timer} 
                                timeOut={this.props.timeOut} onTimeout={this.timedOut} score={points}/> 
            ) : (
                <Flex row style={ {borderStyle: 'solid', borderWidth: 1 } } onClick={this.applySelections} >
                  <Flex column style={{alignItems: 'center'}} >
                      <Flex row style={ {height: 21 } }># Moves</Flex>
                      <Flex row>
                          <Flex column style={ {alignSelf: 'middle', height: 50, width: '100%', fontSize: 30 } }>{mvCount}</Flex>
                      </Flex>
                    </Flex>
                </Flex>     
            );

        let toppad = 32 + unitsize / 2;
        let lthelp = (board.lessThans || board.equalTos) ? ( <p>A '&lt;', '&gt;', or, '=' between two cages means the sum of the values in the cages must obey the indicated relationship.</p> )
                                                         : null;
        let helptext = (
            <div>
              <h3>Rules</h3>
              <p>Normal Sudoku rules apply.  Numbers inside cages must be unique, and add up to the total displayed.</p>
              { lthelp }
              <h3>Play</h3>
              <p>Click on the board cells you wish to affect. Selected cells will display with a green background.
              </p>

              <p>Click on the numbered buttons to select the possibilities you wish to eliminate (from the selected cells). Selected numbers will have a red background.  (Pressing the {tglSpan} button will toggle all number selections.)
              </p>

              <p>Press the {goSpan} button to have the selected numbers (highlighted in red) eliminated as possibilities from the selected cells (highlighted in green). (Selections will then be reset.)
              </p>

              <h4>Direct Selection</h4>

              <p>Typing a number (1 to 9) will directly select that number for the currently focused cell (unless the number has already been eliminated from that cell).<br/>          
                 Right clicking on a a green numbered button when exactly one cell is selected, will directly select that number for the selected cell.<br/>  
                 Right clicking on a possibility will also directly select that number for the containing cell.  
              </p>

              <h4>Elimination and auto-Elimination</h4>
              
              <p>If no cells have been selected and the focus is on a solved cell, then pressing the {goSpan} button will eliminate
                 the value of the focused cell from all other cells that share a region with that cell. This will count as one move, regardless of the outcome.
              </p>

              <p>If a direct selection is made (see above), and the auto-Eliminate option is active, then the eliminate process will be automatically applied
              </p>

              <p>In addition, a number of <b>special patterns</b> will be automatically detected and acted upon when the {goSpan} button is pressed.<br/>  
                 It is left as an exercise for the attentive reader to figure out the relevant rules.  (Hint: <b>Naked Pairs</b> is the name of one such pattern. ) 
              </p>

              <p>These mechanisms allow only for possibilities to be <b>eliminated</b>.  Use the Undo button to restore previous eliminations.
              </p>

              <h4>Uploaded Solutions</h4>

              <p>Partial solutions can be uploaded at any time using the 'Upload', so long as you have signed in. If you sign in on a different machine, 
              you should see the game in progress as it was uploaded.  Partial solutions are automatically uploaded on completion of a move,
              but only if more than a minute has elapsed since last uploaded.
              </p>
              <p>If desired, solutions can also elaborated with comments and uploaded from review mode (by use of the 'Review' button).  
              </p>
              <p>Completed puzzles are automatically uploaded. Such completed submitted solutions can be reviewed by clicking on the solution number in the table displayed.  
              </p>
              <p>Only the top ten submitted solutions (graded by minimum number of Moves) will be displayed.  
              </p>
              <h4>Move Count</h4>
              <p>Whilst the aim of the game is obviously to solve the puzzle, the subplot it to solve it in as few moves as possible.
              </p>
              <p>As such, the intent is to never allow the Move Count to decrease for a given puzzle. The Check button 'costs'
              10 moves, Undo costs 1 move and Restart leaves the move count unchanged.  
              If you find a way to decrease the move count somehow, it is a bug in the program, and a bug report would be much appreciated.
              </p>
            </div>
            );
        let solutionTable = 
              mode.indexOf('review') >= 0 ? null
            : this.props.timeOut ? ( <ChallengesTable board={ this } results={ this.state.solutions } /> )         
            : (<SolutionsTable board={ this } solutions={ this.state.solutions } /> );
        let commentInput = <div />;
        let rowlbls = <div />;
        let collbls = <div />;
        let thght = 30;
        if (mode.indexOf('review') >= 0) {
            thght += 20;
            /*
            let selectedCells = this.state.selectedreviewCells;   
            selectedCells.sort();
            let cellstr = "[" + selectedCells.join(":") + "]";
                <Input type="textarea" label='Marked Cells : ' value={ cellstr }  />


                <p>To assist with the formulation of helpful comments, a mechanism is (will be!) provided to allow regions to be
                lighlighted within the board and the equivalent textual representation to be displayed in the comment text.  Simply
                click on each cell to be included, locate the cursor at the desired point of insertion in the comment text and press
                ctrl-V (or right click and select Paste). 
                </p>
            */
            
            commentInput = (
                <div style={ { width: dim-20} }>
                    <Input type="textarea" ref="comment" label='Commentary for Move' value={ this.state.moveComment } onChange={this.saveComment} />                  
                </div> );

            helptext = (
              <div>
                <h2>Review mode</h2>
                <p>Navigate through the moves with the First, Last, Next and Prev buttons.  Whilst the moves themselves 
                cannot be changed, the comments associated with them can.  The idea is that you can describe the thought process
                that led to the move being made.  
                </p>

                <p>The Submit button allows the entire set of moves to be uploaded and made available to future players of this 
                game.
                </p>

                <p>The Load button return to Play mode with the currently displayed review state loaded. 
                </p>

                <p>The Return button returns to Play mode in the state it was in before the review (abandoning any comments entered). 
                </p>

              </div>
            );

            let rowLabels = [];
            board.rows.forEach( function(r) {
                rowLabels.push( <div key={r} style={ {float: 'left', width: 20, margin: 0, border: 0, padding: 0, height: unitsize } }>{r}</div>);
            });

            let colLabels = [];
            board.cols.forEach( function(c) {
                colLabels.push( <span key={c} style={ {float: 'left', textAlign: 'center', width: unitsize, height: 20 } }>{c}</span>);
            });

            rowlbls = (
                <div style={ {display: 'inline-block', width: 20, height: dim + thght, marginLeft: 5, border: 0, verticalAlign: 'top', paddingTop: toppad, clear: 'both'} }>
                   {rowLabels}
                </div>
            );
            collbls = (
                <div style={ {height: 20, width: dim, margin: 0, border: 0, padding: 0, clear: 'both'} }>
                    {colLabels}
                </div>
            );
        }

        let rhMnuStyle = mnuStyle
        if (mode.indexOf('review') >= 0) {
            let th = mnuStyle.height += 20;
            rhMnuStyle = {...mnuStyle, height: th};
            let th2 = ( <div style={{height: thght}} >{ h2 }{ collbls }</div> );
            h2 = th2;
        }
        
        if (board.size === 21) {
            //console.log("picker panel :" + ppos);
            pkrpanels.push( ppos === 'top' ? (
                <div key='top' style={{ position: 'absolute', top: unitsize, left: (9*unitsize)+2, width: (3*unitsize) - 1, height: (5*unitsize) - 1 }}>
                    <ColwisePickerPanel parent={ this } avail={ avail } pickers={state.pickers} />
                </div> ) 
            : (
                <div key='topblank' onClick={ function () {that.setPickerPanelPos('top');} } style={{ position: 'absolute', top: 0, left: (9*unitsize)+1, width: (3*unitsize) - 1, height: (6*unitsize) - 1 }} />
            ));
            pkrpanels.push( ppos === 'left' ? (
                <div key='left' style={{ position: 'absolute', left: unitsize, top: (9*unitsize), width: (5*unitsize) - 1, height: (3*unitsize) - 2 }}>
                    <RowwisePickerPanel parent={ this } avail={ avail } pickers={state.pickers} />
                </div> )
            : (
                <div key='leftblank' onClick={ function () {that.setPickerPanelPos('left');} } style={{ position: 'absolute', left: 0, top: (9*unitsize)+1, height: (3*unitsize) - 1, width: (6*unitsize) - 1 }} />
            ));
            pkrpanels.push( ppos === 'bottom' ? (
                <div key='bottom' style={{ position: 'absolute', top: (unitsize * 15), left: (9*unitsize)+2, width: (3*unitsize) - 1, height: (5*unitsize) - 1 }}>
                    <ColwisePickerPanel parent={ this } avail={ avail } pickers={state.pickers} />
                </div> )
            : (
                <div key='bottomblank' onClick={ function () {that.setPickerPanelPos('bottom');} } style={{ position: 'absolute', top: (unitsize * 15), left: (9*unitsize)+1, width: (3*unitsize) - 1, height: (6*unitsize) - 1 }} />
            ));
            pkrpanels.push( ppos === 'right' ? (
                <div key='right' style={{ position: 'absolute', left: (unitsize * 15), top: (9*unitsize), width: (5*unitsize) - 1, height: (3*unitsize) - 2 }}>
                    <RowwisePickerPanel parent={ this } avail={ avail } pickers={state.pickers} />
                </div> )
            : (
                <div key='rightblank' onClick={ function () {that.setPickerPanelPos('right');} } style={{ position: 'absolute', left: (unitsize * 15) , top: (9*unitsize)+1, width: (6*unitsize) - 1, height: (3*unitsize) - 1 }} />
            ));
        } else {
            let pnl = layoutNo === 1 ? ( <Flex column style={{alignItems: 'center'}}>
                                                <RowwisePickerPanel key='rowwise' parent={ this } avail={ avail } pickers={state.pickers} />
                                               </Flex> )
                        :  layoutNo === 2 ? ( <Flex column style={{alignItems: 'center'}}>
                                                 <HorizontalPickerPanel key='horizontal' parent={ this } avail={ avail } pickers={state.pickers} />
                                               </Flex> )
                        :  layoutNo === 3 ? <div style={{margin: 'auto'}}><ColwisePickerPanel key='colwise' parent={ this } avail={ avail } pickers={state.pickers} /></div>
                        :  layoutNo === 4 ? <VerticalPickerPanel key='vertical' parent={ this } avail={ avail } pickers={state.pickers} />
                        : null;
            if (layoutNo === 1 || layoutNo === 2 ) hpnl = <div style={{width: dim}}>{ pnl } </div>;
            else if (layoutNo === 4 || layoutNo === 3) {
                let w = layoutNo === 4 ? 45 : (unitsize - 1) * 3
                lhcol = (
                    <Flex column style={{flex: 'none', height: '100%', width: w}} >
                        <div style={{height: thght}} />
                        { pnl }
                    </Flex>
                    );

            }
        }

        let rhcol = (
                  <div style={rhMnuStyle}>
                   <Flex column style= {{justifyContent: 'space-between', width: '100%', height: '100%' }}>
                     <Flex row >
                      <Flex column style={{justifyContent: 'flex-start', xwidth: '100%' }}>
                        <div style={{height: thght}} />
                        { btns }
                       </Flex>  
                     </Flex>
                     <Flex row auto >
                       <Flex column style={{justifyContent: 'flex-end'}} >
                        <Flex row style={{ height: 40, backgroundColor: this.state.colorTag}} >
                            <Input type="checkbox" style={{backgroundColor: this.state.colorTag}} checked={this.state.colorTag !== "Transparent"} onChange={this.cycleColorTagging} label="Tagging"/>
                        </Flex>
                        <Flex row style={{ height: 40}} >
                            <Input type="checkbox" checked={this.state.autoEliminate} onChange={this.toggleAutoElim} label="AutoEliminate"/>
                        </Flex>
                        <Flex row style={{ height: 30}}>Completed: {pccomp}%</Flex>
                        { tmr }
                        { prog }
                       </Flex>                 
                      </Flex>
                   </Flex>
                  </div>
            );

        let midcol = (
              <Flex column style={{ flex: 'none ' }}>
                {h2}
                <Flex row>
                  <div style={ {display: 'inline-block', width: dim, position: 'relative'} }>
                    <div className="brd" style={divStyle} >
                      {cells}
                    </div>
                    { pkrpanels }
                  </div>
                </Flex>
              </Flex>
            );

        return (
            <div>  
              {h1}
              <Flex row style={{justifyContent: 'flex-start', height: dim + thght}} >
                    { lhcol }
                    { rowlbls }
                    { midcol }
                    { rhcol }
              </Flex>
              { hpnl }
              { commentInput }
              <p/>
              { solutionTable }
              { helptext }
              { this.props.children }
            </div>
        );
    }

});


module.exports = PseudoqBoard;