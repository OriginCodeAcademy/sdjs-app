
require('dotenv').config()
const loopback = require('loopback');
const boot = require('loopback-boot');
const path = require('path');

const app = module.exports = loopback();
const cookieParser = require('cookie-parser');
const session = require('express-session');
const bodyParser = require('body-parser');
const flash = require('express-flash');

var DataSource = require('loopback-datasource-juggler').DataSource;
var dsSendGrid = new DataSource('loopback-connector-sendgrid', {
  api_key: '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'
});
loopback.Email.attachTo(dsSendGrid);

// Passport configurators..
var loopbackPassport = require('loopback-component-passport');
var PassportConfigurator = loopbackPassport.PassportConfigurator;
var passportConfigurator = new PassportConfigurator(app);

// attempt to build the providers/passport config
var config = {};
try {
  config = require('../app/providers.json');
} catch (err) {
  console.trace(err);
  process.exit(1); // fatal
}

var path = require('path');
app.set('views', path.join(__dirname, '../app/screens'));
app.set('view engine', 'jsx');
app.engine('jsx', require('express-react-views').createEngine())

// boot scripts mount components like REST API
boot(app, __dirname);

// to support JSON-encoded bodies
app.middleware('parse', bodyParser.json());
// to support URL-encoded bodies
app.middleware('parse', bodyParser.urlencoded({
  extended: true,
}));

// The access token is only available after boot
app.middleware('auth', loopback.token({
  model: app.models.accessToken,
}));

app.middleware('session:before', cookieParser('kll6k6vit4k8cjf8d5i48shqpj'));

app.middleware('session', session({
  secret: 'kitty',
  saveUninitialized: true,
  resave: true,
}));
passportConfigurator.init();

// We need flash messages to see passport errors
app.use(flash());

passportConfigurator.setupModels({
  userModel: app.models.user,
  userIdentityModel: app.models.userIdentity,
  userCredentialModel: app.models.userCredential,
});
for (var s in config) {
  var c = config[s];
  c.session = c.session !== false;
  passportConfigurator.configureProvider(s, c);
}
var ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn;

app.get('/auth/account', ensureLoggedIn('/login'), function (req, res, next) {
  res.render('ProfileScreen', {
    user: req.user,
    url: req.url,
  });
});

app.get('/signup', function (req, res, next) {
  res.render('SignupScreen', {
    user: req.user,
    url: req.url,
  });
});

app.post('/signup', function (req, res, next) {
  var User = app.models.user;

  var newUser = {};
  newUser.email = req.body.email.toLowerCase();
  newUser.username = req.body.username.trim();
  newUser.password = req.body.password;

  User.create(newUser, function (err, user) {
    if (err) {
      req.flash('error', err.message);
      return res.redirect('back');
    } else {
      // Passport exposes a login() function on req (also aliased as logIn())
      // that can be used to establish a login session. This function is
      // primarily used when users sign up, during which req.login() can
      // be invoked to log in the newly registered user.
      req.login(user, function (err) {
        if (err) {
          req.flash('error', err.message);
          return res.redirect('back');
        }
        return res.redirect('/auth/account');
      });
    }
  });
});

app.get('/login', function (req, res, next) {
  res.render('LogInScreen', {
    user: req.user,
    url: req.url,
  });
});

app.get('/auth/logout', function (req, res, next) {
  req.logout();
  res.redirect('/');
});

app.start = function () {
  // start the web server
  return app.listen(function () {
    app.emit('started');
    var baseUrl = app.get('url').replace(/\/$/, '');
    console.log('Web server listening at: %s', baseUrl);
    if (app.get('loopback-component-explorer')) {
      var explorerPath = app.get('loopback-component-explorer').mountPath;
      console.log('Browse your REST API at %s%s', baseUrl, explorerPath);
    }
  });
};

// start the server if `$ node server.js`
if (require.main === module) {
  app.start();
}
