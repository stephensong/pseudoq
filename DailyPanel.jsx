"use strict";

const React = require('react');
const oxiDate = require('./oxidate.js');

import {PseudoqBoard} from 'PseudoqBoard.jsx';
import { Hidato } from 'Hidato.jsx';

const Daily = React.createClass({displayName: 'Daily',

    render() {
        let {dayName, date, boards, dispatch} = this.props;
        if (dayName !== this.props.params.dayName) console.log("Something farked");
        if (!boards) return null;
        let rslt = [];
        let dt = oxiDate.parse(date, 'yyyyMMdd');
        let cdt = oxiDate.toFormat(dt, "DDDD, MMMM D");

        Object.keys(boards).forEach( pos => {
            let brd = boards[pos];
            if (brd) {
                let pzl = dayName + "/" + pos;
                if (brd.gameType === 'Hidato') {
                    rslt.push( <Hidato       key={ pzl+':view' } dayName={ dayName } pos={ pos } dispatch={ dispatch } {...brd} mode='view' /> );
                }
                else {
                    rslt.push( <PseudoqBoard key={ pzl+':view' } dayName={ dayName } pos={ pos } dispatch={ dispatch } {...brd} mode='view'  /> );
                }
            }
        });

        return ( 
          <div>
            <h2>Puzzles for  { cdt } </h2>
            <div>{ rslt }</div>
          </div>
        );

    }    
});

export default Daily;

