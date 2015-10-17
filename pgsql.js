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

let uuid = require('./uuid.js');
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

db.tables.map( t => { console.log("table : "+t.name); });

let userRows = querySync("select * from users").rows;
export const users = Object.create(null);
userRows.forEach(function(r) { users[r.userId] = r; });
users.count = userRows.length;

export function insert_user(id, userName) {
    //console.log('Inserting user : ' + userName ) ;
    return new Promise( function(resolve,reject) {
        let dt = new Date();
        let usr = {userId: id, userName: userName, created: dt, updated: dt };
        db.users.insert( usr, function(err, rslt) {
            if (!err) {
                users[id] = usr;
                users.count = users.count + 1;
                resolve(rslt);
            } else reject(err);
        });
    });
};

let authRows = querySync("select * from auths").rows;
export const auths = Object.create(null);
authRows.forEach(function(r) { auths[r.authId] = r.userId; });

export function insert_auth(prov, authId, userId) {
    return new Promise( function(resolve,reject) {
        //console.log('Inserting auth for prov : ' + prov + ', user : ' + users[userId].userName  ) ;
        let key = prov + ':' + authId;
        let auth = {authId: key, userId: userId};
        db.auths.insert(auth, function(err, rslt) {
            if (!err) {
                auths[key] = userId;
                resolve(rslt);
            } else reject(err);
        });
    });
};

export function get_user_from_auth(prov, authId) {
    let rslt = auths[prov + ':' + authId];
    if (rslt) rslt = users[rslt];
    return rslt;
};

export function set_user_name(userId, newName, next) {
    let usr = users[userId];
    if (!usr) return insert_user(id,newName,next);
    if (usr.userName === newName) return;
    let dt = new Date();
    db.query('update users set "userName" = $2, updated = $3 where "userId" = $1',[userId,newName,dt], function (err,rslt) {
        if (!err) {
            usr.userName = newName;
            usr.updated = dt;
        }
        if (next) next(err,usr);
        else if (err) throw err;
        else return usr;
    });
};

export function insert_solution(soln, next) {
    console.log("inserting solution for : " + soln.puzzle);
    db.solutions.insert( soln, next) ;
};

export function upsert_solution(soln, next) {
    console.log('solution submitted, puzzle : '+soln.puzzle+", user : "+soln.user);
    db.solutions.where('puzzle=$1 and "user"=$2',[soln.puzzle,soln.user],function(err,rslt) {
        //console.log("solutions found : "+rslt.length);
        if (err) throw err;
        if (rslt.length > 0) {
            soln.solnId = rslt[0].solnId;
            db.solutions.save(soln, next);
        } else {
            insert_solution(soln,next);
        }
    });
};

export function upsert_challenge(chrslt, next) {
    console.log('challenge submitted, timeOut : '+chrslt.timeOut+", user : "+chrslt.user);
    if (chrslt.percentCompleted) delete chrslt.percentCompleted;
    db.challenges.where('"timeOut"=$1 and "user"=$2',[chrslt.timeOut,chrslt.user],function(err,rslt) {
        //console.log("solutions found : "+rslt.length);
        if (err) throw err;
        if (rslt.length > 0) {
            rslt = rslt[0];
            let strt = oxiDate.addDays(new Date(),-7);
            console.log(chrslt.points.toString() + ", " + rslt.points);
            if (strt > rslt.lastPlay || chrslt.points > rslt.points) {
                console.log("saving challenge : "+ chrslt.points);
                chrslt.rsltId = rslt.rsltId;
                db.challenges.save(chrslt, next);
            } else if (next) next(err,chrslt);
        } else {
            db.challenges.insert( chrslt, next) ;
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
    return new Promise( function(resolve,reject) {
        db.solutions.where("puzzle=$1 and completed=true", [pzlId], function (err,rslt) {
            if (err) reject(err);
            else resolve(rslt);
        });
    });
};

export function get_challenges(tmOut) {
    //console.log("getting solutions for "+pzlId);
    return new Promise( function(resolve,reject) {
        let strt = oxiDate.toFormat(oxiDate.addDays(new Date(),-7),'yyyyMMdd');
        db.query('select * from challenges where "timeOut"=$1 and "lastPlay" > $2 order by points desc limit 10', [tmOut,strt], function (err,rslt) {
            if (err) reject(err);
            else resolve(rslt);
        });
    });
};

export function get_puzzle(pzlId) {
    //console.log("getting puzzle "+pzlId);
    return new Promise( function(resolve,reject) {
        db.puzzles.findOne(pzlId, function (err,rslt) {
            if (err) reject(err);
            else {
                rslt.layout.pubID = pzlId;
                resolve(rslt.layout);
            }
        });
    });
};

export function get_day(dt) {
    //console.log("getting day "+cdt);
    return new Promise( function(resolve,reject) {
        db.days.find({date: dt}, function (err,rslt) {
            if (err) reject(err);
            else {
                let res = new Array(rslt.length);
                rslt.forEach(function (r) {
                    res[r.pos] = r.puzzle;
                });
                resolve(res);
            }
        });
    });
};

export function query(cmd,prms) {
    return new Promise( function(resolve,reject) {
        db.query(cmd,prms, function (err,rslt) {
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


