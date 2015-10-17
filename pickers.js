"use strict";

require('./css/bootstrap-flatly.css');
require('./css/psq.css');
require('bootstrap');
let utils = require('./utils.js');

let timeSpan = require('timeSpan');

let jQuery = require('jquery');
let grph = require('graphics');
let React = require('react');
let ReactBootStrap = require('react-bootstrap');
let tinycolor = require('tinycolor2');
let Flex = require('flex.jsx');

let vals = [1, 2, 3, 4, 5, 6, 7, 8, 9];  // nqr - copied from pseudoqboard

let glyphSpanStyle = {fontFamily: 'entypo', fontSize: '200%', lineHeight: 0} ;
let tglPt = '\uD83D\uDD04';
let goPt = '\u25B6';
let tglSpan = <span style={ glyphSpanStyle} >{tglPt}</span>;
let goSpan = <span style={ glyphSpanStyle } >{goPt}</span>;

let defaultStyle = function() {
    return {  
      display: 'block',  
      float: 'left',
      textAlign: 'center',
      fontWeight: 'bold',
      fontSize: '150%',
      width: '100%',
      height: '100%',
      lineHeight: 1.2,
      padding: 6,
      margin: 'auto',
      borderStyle: 'solid',
      borderWidth: 1
    };
};

let Picker = React.createClass({

    handleClick: function() {
        if (!this.props.pickable) return;
        this.props.handleClick(this.props.val)
    },

    handleRightClick: function(e) {
        this.props.handleRightClick(this.props.val);
        e.preventDefault();
    },
    
    render: function() {
        let styl = defaultStyle();
        let board = this.props.board;
        if (this.props.width) styl.width = this.props.width;
        if (this.props.height) styl.height = this.props.height;
        styl.color = board.clrForeGround;
        let h = styl.height || board.unitsize;
        styl.fontSize = board.cellFontSize;
        styl.lineHeight = this.props.lineHeight || 0.3 * (h / 9);
        styl.backgroundColor = !this.props.pickable ? board.clrBackGround : this.props.picked ? board.clrRed : board.clrGreen;
        return (
            <div className='pkr-cell' onClick={this.handleClick}  onContextMenu={this.handleRightClick} style={styl} >
              {this.props.val}
            </div>
        );
    }

});

let Horizontal = React.createClass({displayName: 'HorizontalPickerPanel',

    render: function() {
        let pickers = this.props.pickers;
        let avail = this.props.avail;
        let prnt = this.props.parent;
        let board = prnt.state.board;
        let height = 45;
        let pkrStyle = defaultStyle();
        pkrStyle.height = height;
        pkrStyle.lineHeight = 1.5;
        let pkrnodes = [];
        pkrnodes.push( <div key={0} className='pkr-cell' style={ pkrStyle } onClick={prnt.toggleAllPickers} >{ tglSpan }</div> );
        vals.forEach( function(i) {
            pkrnodes.push( <Picker key={i} val={i} board={board} height={height} picked={avail[i] && pickers[i]} pickable={avail[i]} handleClick={prnt.togglePicker} handleRightClick={prnt.selectThisOne} /> );
        }, this);
        pkrnodes.push( <div key={10} className='pkr-cell' style={ pkrStyle } onClick={prnt.applySelections} >{ goSpan }</div> );

        return (
            <Flex row className='pkr' style= {{ width: '100%', height: height }}>
                {pkrnodes}
            </Flex>
        );
    }
});

let Vertical = React.createClass({displayName: 'VerticalPickerPanel',

    render: function() {
        let pickers = this.props.pickers;
        let avail = this.props.avail;
        let prnt = this.props.parent;
        let board = prnt.state.board;
        let width = 45;
        let dim = board.unitsize - 1;
        let pkrStyle = defaultStyle();
        pkrStyle.width = width;
        let gStyle = defaultStyle();
        gStyle.width = width;
        gStyle.lineHeight = 1.5;
        let pkrnodes = [];
        pkrnodes.push( <div key={0} className='pkr-cell' style={ gStyle } onClick={prnt.toggleAllPickers} >{ tglSpan }</div> );
        vals.forEach( function(i) {
            pkrnodes.push( <Picker key={i} val={i} board={board} width={width} lineHeight={pkrStyle.lineHeight} picked={avail[i] && pickers[i]} pickable={avail[i]} handleClick={prnt.togglePicker} handleRightClick={prnt.selectThisOne} /> );
        }, this);
        pkrnodes.push( <div key={10} className='pkr-cell' style={ gStyle } onClick={prnt.applySelections} >{ goSpan }</div> );

        return (
            <Flex column className='pkr' style= {{width: width, height: dim }}>
                {pkrnodes}
            </Flex>
        );
    }
});

let Colwise = React.createClass({displayName: 'ColwisePickerPanel',

    render: function() {
        let pickers = this.props.pickers;
        let avail = this.props.avail;
        let prnt = this.props.parent;
        let board = prnt.state.board;
        let dim = board.unitsize - 1;
        let pkrStyle = defaultStyle();
        pkrStyle.height = dim;
        pkrStyle.width = dim * 3;
        pkrStyle.lineHeight = 1.8;
        let f = function(i) {
            return ( <Picker key={i} val={i} board={board} height={dim} width={dim} picked={avail[i] && pickers[i]} pickable={avail[i]} handleClick={prnt.togglePicker} handleRightClick={prnt.selectThisOne} /> );
        }.bind(this);
        let r1 = [1,2,3].map(f);
        let r2 = [4,5,6].map(f);
        let r3 = [7,8,9].map(f);

        return (
            <div style={{width: (dim * 3), height: (dim * 5), padding: 2}} >
              <Flex column>
                <Flex row className='pkr' style= {{ width: '100%', height: dim }} onClick={prnt.toggleAllPickers}>
                    <div key={0} className='pkr-cell' style={ pkrStyle } >{ tglSpan }</div> 
                </Flex>
                <Flex row style= {{ width: '100%', height: dim }}>
                    {r1}
                </Flex>
                <Flex row style= {{ width: '100%', height: dim }}>
                    {r2}
                </Flex>
                <Flex row style= {{ width: '100%', height: dim }}>
                    {r3}
                </Flex>
                <Flex row className='pkr' style= {{ width: '100%', height: dim }} onClick={prnt.applySelections} >
                   <div key={10} className='pkr-cell' style={ pkrStyle } >{ goSpan }</div> 
                </Flex>
              </Flex>
            </div> 
        );
    }
});

let Rowwise = React.createClass({displayName: 'RowwisePickerPanel',

    render: function() {
        let pickers = this.props.pickers;
        let avail = this.props.avail;
        let prnt = this.props.parent;
        let board = prnt.state.board;
        let dim = board.unitsize - 1;
        let pkrStyle = defaultStyle();
        pkrStyle.height = dim;
        pkrStyle.width = dim;
        pkrStyle.borderStyle = 'none';
        pkrStyle.lineHeight = 0.3 * (dim / 9);
        let f = function(i) {
            return ( <Picker key={i} val={i} board={board} height={dim} width={dim} picked={avail[i] && pickers[i]} pickable={avail[i]} handleClick={prnt.togglePicker} handleRightClick={prnt.selectThisOne} /> );
        }.bind(this);
        let c1 = [1,4,7].map(f);
        let c2 = [2,5,8].map(f);
        let c3 = [3,6,9].map(f);

        return (
            <div style={{width: (dim * 5), height: (dim * 3), padding: 2}} >
              <Flex row>
                <Flex column className='pkr' style= {{ height: (dim * 3), width: dim, justifyContent: 'center', borderStyle: 'solid', borderWidth: 1 }} onClick={prnt.toggleAllPickers} >
                    <div key={0} className='pkr-cell' style={ pkrStyle } >{ tglSpan }</div> 
                </Flex>
                <Flex column style= {{ height: '100%', width: dim }}>
                    {c1}
                </Flex>
                <Flex column style= {{ height: '100%', width: dim }}>
                    {c2}
                </Flex>
                <Flex column style= {{ height: '100%', width: dim }}>
                    {c3}
                </Flex>
                <Flex column className='pkr' style= {{ height: (dim * 3), width: dim, justifyContent: 'center', borderStyle: 'solid', borderWidth: 1  }} onClick={prnt.applySelections} >
                   <div key={10} className='pkr-cell' style={ pkrStyle }>{ goSpan }</div> 
                </Flex>
              </Flex>
            </div> 
        );
    }
});

module.exports = {Horizontal: Horizontal, Vertical: Vertical, Colwise: Colwise, Rowwise: Rowwise};