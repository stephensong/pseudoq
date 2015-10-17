"use strict";

var React = require('react');
var Board = require('PseudoqBoard.jsx');
var Utils = require('utils');

var DailyPanel = React.createClass({

    getInitialState: function() {
        return {
        };
    },

    render: function() {
        console.log("rendering daily panel");
        var rslt = [];
        var brds = this.props.boards;
        var dt = Utils.str2Date(this.props.date);
        var cdt = dt.toFormat("DDDD, MMMM D");
        for (var j in brds) {
            if (brds.hasOwnProperty(j)) {
                console.log("board : " + j);
                var js = brds[j];
                rslt.push( <Board key={ j } puzzleId={ j } brdJson={ js } initmode='view'  /> );
            }
        }

        return ( 
          <div>
            <h2>Puzzles for { cdt }</h2>
            <div>{rslt}</div>
          </div>
        );
    }
});

module.exports = DailyPanel;

