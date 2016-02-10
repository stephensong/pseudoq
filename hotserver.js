'use strict';

'use strict';

//const {hmr, hmr_backend} = require('./hmr.js');
const {hmr} = require('./hmr.js');
const app = require('./serverIndex.js');

hmr(app);
//hmr_backend(app);
 
var port = parseInt(process.env.PORT, 10) || 8080;

console.log("Listening at http://localhost:" + port);
app.listen(port);


