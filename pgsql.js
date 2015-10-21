"use strict";

let url = process.env.DATABASE_URL;
//let url='postgres://gary:gary@10.1.1.2:5432/postgres';
let Promise = require('bluebird');
let massive = require('massive');
let oxiDate = require('./oxidate.js');
//Promise.promisifyAll(massive);
let fs = require('fs');
Promise.promisifyAll(fs);

let pg = require('pg');

let deasync = require('deasync');

let util = require('util');

let querySync = function(sql,args) {
    let rslt = null;
    let fin = false;
    let err = null;
    pg.connect(url, function (e,client, done) {
        if (e) err = e;
        else {
            client.query(sql, args, function (e, res) {
                done();  // return client to pool
                if (err) err = e;
                else rslt = res;
                fin = true;
            });
        }
    });
    while(!fin) deasync.runLoopOnce();
    if (err) throw err;
    return rslt;
};

export const db = massive.loadSync({connectionString: url});

//db.tables.map( t => { console.log("table : "+t.name); });

let userRows = querySync("select * from users").rows;
export const users = Object.create(null);
userRows.forEach( r => { users[r.userId] = r; });
users.count = userRows.length;

let authRows = querySync("select * from auths").rows;
export const auths = Object.create(null);
authRows.forEach(function(r) { auths[r.authId] = r.userId; });

export function query(cmd,prms) {
    return new Promise( function(resolve,reject) {
        db.query(cmd,prms, function (err,rslt) {
            if (err) reject(err);
            else resolve(rslt);
        });
    });
};

export function where(tbl,cqry,prms) {
    return new Promise( function(resolve,reject) {
        tbl.where(cqry, prms, function (err,rslt) {
            if (err) reject(err);
            else resolve(rslt);
        });
    });
};

export function find(tbl, o) {
    return new Promise( function(resolve,reject) {
        tbl.find(o, function (err,rslt) {
            if (err) reject(err);
            else resolve(rslt);
        });
    });
};

export function findOne(tbl, o) {
    return new Promise( function(resolve,reject) {
        tbl.findOne(o, function (err,rslt) {
            if (err) reject(err);
            else resolve(rslt);
        });
    });
};

export function insert(tbl,o) {
    return new Promise( function(resolve,reject) {
        tbl.insert(o, function (err,rslt) {
            if (err) reject(err);
            else resolve(rslt);
        });
    });
};

export function update(tbl,o) {
    return new Promise( function(resolve,reject) {
        tbl.update(o, function (err,rslt) {
            if (err) reject(err);
            else resolve(rslt);
        });
    });
};

export function save(tbl,o) {
    return new Promise( function(resolve,reject) {
        tbl.save(o, function (err,rslt) {
            if (err) reject(err);
            else resolve(rslt);
        });
    });
};

export function destroy(tbl,o) {
    return new Promise( function(resolve,reject) {
        tbl.destroy(o, function (err,rslt) {
            if (err) reject(err);
            else resolve(rslt);
        });
    });
};

export function insert_user(id, userName) {
    //console.log('Inserting user : ' + userName ) ;
    let dt = new Date();
    let usr = {userId: id, userName: userName, created: dt, updated: dt };
    return insert(db.users, usr).then(rslt => {
        users[id] = usr;
        users.count = users.count + 1;
        return rslt;
    });
};

export function insert_auth(prov, authId, userId) {
    //console.log('Inserting auth for prov : ' + prov + ', user : ' + users[userId].userName  ) ;
    let key = prov + ':' + authId;
    let auth = {authId: key, userId: userId};
    return insert(db.auths, auth).then( rslt => {
        auths[key] = userId;
        return rslt;
    });
};

export function get_user_from_auth(prov, authId) {
    let rslt = auths[prov + ':' + authId];
    if (rslt) rslt = users[rslt];
    return rslt;
};

export function set_user_name(userId, newName) {
    let usr = users[userId];
    if (!usr) return insert_user(id,newName);
    if (usr.userName === newName) return;
    let dt = new Date();
    return query('update users set "userName" = $2, updated = $3 where "userId" = $1',[userId,newName,dt]).then(rslt => {
        usr.userName = newName;
        usr.updated = dt;
        return usr;
    });
};

export function touch_user(userId) {
    let usr = users[userId];
    let dt = new Date();
    return query('update users set updated = $2 where "userId" = $1',[userId,dt]).then(rslt => {
        usr.updated = dt;
        return usr;
    });
};

export function upsert_solution(soln) {
    console.log('solution submitted, puzzle : '+soln.puzzle+", user : "+soln.user);
    return where(db.solutions, 'puzzle=$1 and "user"=$2',[soln.puzzle,soln.user]).then( rslt => {
        //console.log("solutions found : "+rslt.length);
        if (rslt.length > 0) {
            soln.solnId = rslt[0].solnId;
            return update(db.solutions, soln);
        } else {
            return insert(db.solutions, soln);
        }
    });
};

export function upsert_challenge(chrslt) {
    console.log('challenge submitted, timeOut : '+chrslt.timeOut+", user : "+chrslt.user);
    if (chrslt.percentCompleted) delete chrslt.percentCompleted;
    return where(db.challenges, '"timeOut"=$1 and "user"=$2',[chrslt.timeOut,chrslt.user]).then(rslt => {
        //console.log("solutions found : "+rslt.length);
        if (rslt.length > 0) {
            rslt = rslt[0];
            let strt = oxiDate.addDays(new Date(),-7);
            console.log(chrslt.points.toString() + ", " + rslt.points);
            if (strt > rslt.lastPlay || chrslt.points > rslt.points) {
                console.log("saving challenge : "+ chrslt.points);
                chrslt.rsltId = rslt.rsltId;
                return update(db.challenges, chrslt);
            } else return {ok: true};
        } else {
            return insert(db.challenges, chrslt) ;
        }
    });
};

export function shift_solutions(ufrom, uto) {
    return new Promise( function(resolve,reject) {
        db.query('update solutions set "user" = $2 where "user" = $1',[ufrom,uto], function (err,rslt) {
            if (err) reject(err);
            else {
                db.query('delete from users where "userId" = $1',[ufrom], function (err,rslt) {
                    if (err) reject(err);
                    else resolve(rslt);
                });
            }
        });
    });
};

export function get_solutions(pzlId) {
    //console.log("getting solutions for "+pzlId);
    return where(db.solutions, "puzzle=$1 and completed=true", [pzlId]);
};

export function get_challenges(tmOut) {
    //console.log("getting solutions for "+pzlId);
    let strt = oxiDate.toFormat(oxiDate.addDays(new Date(),-7),'yyyyMMdd');
    return query('select * from challenges where "timeOut"=$1 and "lastPlay" > $2 order by points desc limit 10', [tmOut,strt]);
};

export function get_puzzle(pzlId) {
    //console.log("getting puzzle "+pzlId);
    return findOne( db.puzzles, pzlId).then(rslt => {
        rslt.layout.pubID = pzlId;
        return rslt.layout;
    });
};

export function get_day(dt) {
    //console.log("getting day "+cdt);
    return find( db.days, {date: dt}).then(rslt => {
        let res = new Array(rslt.length);
        rslt.forEach(function (r) {
            res[r.pos] = r.puzzle;
        });
        return res;
    });
};

export function get_weekly_user(dt,uid) {

let csql = 
    ' with pids as ('
+   '     select "date",pos,puzzle from days'
+   '     where "date" <= $1 and "date" > $2'
+   '     )'
+   ' select pids."date", pids.pos, p.*, s2.moves'
+   ' from pids '
+   ' left join puzzles p on pids.puzzle = p."puzzleId"'
+   ' left join (select puzzle, doc as moves from solutions s where s.user = $3) s2 on p."puzzleId" = s2.puzzle'
+   ' order by pids.date desc,pids.pos '
;
    let dt1 = oxiDate.toFormat( oxiDate.addDays(dt, 7), 'yyyyMMdd' );
    let dt2 = oxiDate.toFormat( oxiDate.addDays(dt, -7), 'yyyyMMdd' );
    return query(csql,[dt1, dt2, uid]);
};


let killerIds = querySync('select "puzzleId" from puzzles where "gameType" = \'Killer\' and rating = \'Easy\'').rows.map(function (o) { return o.puzzleId; });

export function get_random_killer() {
    let i = Math.floor(Math.random() * killerIds.length);
    let pzl = killerIds[i];
    return get_puzzle(pzl);
};

let samuraiIds = querySync('select "puzzleId" from puzzles where "gameType" = \'Samurai\' and rating = \'Easy\'').rows.map(function (o) { return o.puzzleId; });

export function get_random_samurai() {
    let i = Math.floor(Math.random() * samuraiIds.length);
    let pzl = samuraiIds[i];
    return get_puzzle(pzl);
};

let hidatoIds = querySync('select "puzzleId" from puzzles where "gameType" = \'Hidato\' ').rows.map(function (o) { return o.puzzleId; });

export function get_random_hidato() {
    let i = Math.floor(Math.random() * hidatoIds.length);
    let pzl = hidatoIds[i];
    return get_puzzle(pzl);
};

//console.log = function(msg) { console.trace(msg) }

//rslt.import_new_puzzles();
//rslt.import_new_days();


