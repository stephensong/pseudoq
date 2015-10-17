"use strict";

var mod = {};

mod.solutionSorter = function (a,b) { 
    let ma = a.doc.moves;
    let mb = b.doc.moves;
    let acnt = ma[ma.length - 1].moveCount;
    let bcnt = mb[mb.length - 1].moveCount;
    return acnt > bcnt;

};

module.exports = mod;
