'use strict';
var bodyParser = require('body-parser');
var loopback = require('loopback');
var boot = require('loopback-boot');
var app = module.exports = loopback();

app.use(bodyParser.json());

app.start = function () {
  // start the web server
  return app.listen(function () {
    var baseUrl = app.get('url').replace(/\/$/, '');
    console.log(`Server is running on port :: ${baseUrl}`);
    app.emit('started');
    if (app.get('loopback-component-explorer')) {
      var explorerPath = app.get('loopback-component-explorer').mountPath;
      console.log(`Server is running on port :: ${baseUrl}`);
}
  });
};

// Bootstrap the application, configure models, datasources and middleware.
// Sub-apps like REST API are mounted via boot scripts.
boot(app, __dirname, function (err) {
  if (err) throw err;

  // start the server if `$ node server.js`
  if (require.main === module)
    app.start();     

});
