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

var ChallengesTable = React.createClass({

    render: function() {
        var rows = []
        var j = 0;
        let board = this.props.board;
        let rslts = this.props.results;

        if (rslts.length === 0) return null;

        rslts.forEach(function (rslt) {
            var mvs = rslt.doc.moves;
            var lp = rslt.lastPlay;
            var dt = oxidate.parse(lp);
            var lastplay = oxidate.toFormat(dt, "DDDD, MMMM D @ HH:MI");
            //console.log(lp + " : " + lastplay);

            //var elapsed = '';
            //if (rslt.secondsElapsed) elapsed = timeSpan.FromSeconds(rslt.secondsElapsed).toString();
            //         <td>{ elapsed }</td>
            //      <th>Time Taken</th>

            ++j;
            rows.push( 
                <tr key={ rslt.rsltId } >
                     <td>{ rslt.userName }</td>
                     <td>{ lastplay }</td>
                     <td>{ rslt.points }</td>
                </tr>
            );

        });

        return(
          <div>
            <h2>Leaderboard : </h2>
            <Table striped bordered condensed hover>
              <thead>
                <tr>
                  <th>Player</th>
                  <th>At</th>
                  <th>Points</th>
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


module.exports = ChallengesTable;