const express = require('express');
const session = require('express-session');

const MySQLStore = require('express-mysql-session')(session);
const mustacheExpress = require('mustache-express');
const path = require('path');


//const sql = require(path.join(process.cwd(),'db.js'));
const templateDir = path.join(__dirname, '.', 'views');
const frontendDir = path.join(__dirname, '.', 'public');
module.exports = function WebServer() {



  var options = {
    host: '',
    port: 3306,
    user: '',
    password: '',
    database: '',
    clearExpired: true,
    // How frequently expired sessions will be cleared; milliseconds:
    //900000
    checkExpirationInterval: 900000
  };

  const app = express();





  app.use(express.json());       // to support JSON-encoded bodies
  app.use(express.urlencoded({ extended: true }));
  let cookie = {
    maxAge: 120000
  };


  if (app.get('env') === 'production') {
    app.set('trust proxy', 1) // trust first proxy
    cookie.secure = true // serve secure cookies
  }



  // Provide the configuration to the view layer because we show it on the homepage





  function customauth(req, res, next) {
    ses = req.session;
    // do any checks you want to in here

    // CHECK THE USER STORED IN SESSION FOR A CUSTOM VARIABLE
    // you can do this however you want with whatever variables you set up
    // if (req.user.authenticated)
    if (req.isAuthenticated()) {
      ses.la = '/';
      return next();
    }
    ses.la = req.originalUrl;



    // IF A USER ISN'T LOGGED IN, THEN REDIRECT THEM SOMEWHERE
    res.redirect('/login');
  }

  // This server uses mustache templates located in views/ and css assets in assets/
  //app.use('/assets', oidc.ensureAuthenticated());
  app.engine('mustache', mustacheExpress());
  app.set('view engine', 'mustache');
  app.set('views', templateDir);



  /*app.get('/', (req, res) => {
    const template = homePageTemplateName || 'home';
    const userinfo = req.userContext && req.userContext.userinfo;
    console.log(req.userContext && req.userContext.userinfo);
    res.render('home', {
   //   isLoggedIn: !!userinfo,
   //   userinfo: userinfo
    });
  }); */





  app.use('/', express.static(frontendDir));







  app.listen(3000, () => {
    console.log(`Example app listening on port 3000`)
  })

};
