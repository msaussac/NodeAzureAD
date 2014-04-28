
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , secure = require('./routes/secure')
  , http = require('http')
  , path = require('path')
  , passport = require('passport')
  , wsfedsaml2 = require('passport-azure-ad').WsfedStrategy;

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.cookieParser('your secret here'));
app.use(express.session({ secret: 'keyboard cat' }));
app.use(passport.initialize());
app.use(passport.session());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

var config = {
    realm: 'http://localhost:3000',
    identityProviderUrl: 'https://login.windows.net/96fc478c-547a-4e0d-be6b-2eeefac1e86b/wsfed',
    identityMetadata: 'https://login.windows.net/96fc478c-547a-4e0d-be6b-2eeefac1e86b/federationmetadata/2007-06/federationmetadata.xml',
    logoutUrl:'http://localhost:3000/'
};

var wsfedStrategy = new wsfedsaml2(config, function(profile, done) {
    if (!profile.email) {
        done(new Error("No email found"));
        return;
    }
    // validate the user here
    done(null, profile);
});
passport.use(wsfedStrategy);


// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);

app.get('/login', passport.authenticate('wsfed-saml2', { failureRedirect: '/', failureFlash: true }), function(req, res) {
    return secure.index;
});

app.get('/secure', secure.index);

app.post('/login/callback',
  passport.authenticate('wsfed-saml2', { failureRedirect: '/', failureFlash: true }),
  function(req, res) {
    res.redirect('/secure');
  }
);

app.get('/logout', function(req, res){

// clear the passport session cookies
  req.logout();

// We need to redirect the user to the WSFED logout endpoint so the
// auth token will be revoked
  wsfedStrategy.logout({}, function(err, url) {
    if(err) {
      res.redirect('/');
    } else {
      res.redirect(url);
    }
  });
});


passport.serializeUser(function(user, done) {
  done(null, user.email);
});

passport.deserializeUser(function(id, done) {
    var user = { email: id };
    done(null, user);
});


http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
