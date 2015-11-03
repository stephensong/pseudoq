"use strict";

export function solutionSorter(a,b) { 
    let ma = a.moves;
    let mb = b.moves;
    let acnt = ma[ma.length - 1].moveCount;
    let bcnt = mb[mb.length - 1].moveCount;
    return acnt > bcnt;

};

export function isMember(grp) {
	let grps = localStorage.getItem('pseudoq.groups');
	return grps && grps.indexOf(grp+',') >= 0;

}