'use strict';

const app = require('./serverIndex.js');
//const {hmr} = require('./hmr.js')
//hmr(app);
const port = parseInt(process.env.PORT, 10) || 8080;

console.log("Listening at http://localhost:" + port);
app.listen(port);


