"use strict";

require('./css/bootstrap-flatly.css');
require('bootstrap');

var React = require('react');
var ReactBootStrap = require('react-bootstrap');
var oxidate = require('./oxidate.js');
var timeSpan = require('./timeSpan.js');
var utils = require('./utils.js');
var Button = ReactBootStrap.Button;

var Table = ReactBootStrap.Table;

var SolutionsTable = React.createClass({

    render: function() {
        var rows = []
        var j = 0;
        let board = this.props.board;
        let solns = this.props.solutions || [];

        if (solns.length === 0) return null;

        solns.forEach(function (soln) {
            var mvs = soln.doc.moves;
            var lp = soln.lastPlay;
            var dt = oxidate.parse(lp);
            var lastplay = oxidate.toFormat(dt, "DDDD, MMMM D @ HH:MI");
            //console.log(lp + " : " + lastplay);
            var compl = soln.completed ? "yes" : "no";
            if (compl === "no" && soln.percentCompleted) {
              compl = soln.percentCompleted.toString() + "%";
            }
            var cnt = mvs[mvs.length-1].moveCount;
            let reviewSolution = function() {
                board.reviewSolution(mvs);
            }

            //var elapsed = '';
            //if (soln.secondsElapsed) elapsed = timeSpan.FromSeconds(soln.secondsElapsed).toString();
            //         <td>{ elapsed }</td>
            //      <th>Time Taken</th>

            ++j;
            rows.push( 
                <tr key={ soln.solnId } >
                     <td><Button onClick={ reviewSolution }>{ j }</Button></td>
                     <td>{ soln.userName }</td>
                     <td>{ lastplay }</td>
                     <td>{ cnt }</td>
                </tr>
            );

        });

        return(
          <div>
            <h2>Leaderboard : </h2>
            <Table striped bordered condensed hover>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Player</th>
                  <th>At</th>
                  <th># Moves</th>
                </tr>
              </thead>
              <tbody>
                {rows}
              </tbody>
            </Table>
          </div>
        );
    }

});


module.exports = SolutionsTable;