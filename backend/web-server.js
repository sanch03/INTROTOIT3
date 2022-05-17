const express = require('express');
const session = require('express-session');


const mustacheExpress = require('mustache-express');
const path = require('path');


//const sql = require(path.join(process.cwd(),'db.js'));
const templateDir = path.join(__dirname, '.', 'views');
const frontendDir = path.join(__dirname, '.', 'public');
const sql = require(path.join(__dirname, '.', 'db.js'));
module.exports = function WebServer() {

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


  app.post('/api/capture', async function (req, res) {
    let userid = req.body['userid']
    let beaconid = req.body['beaconid']
    let gameid = await api.capturecheck(userid, beaconid)
    res.send(gameid)
    //res.sendStatus(200)
  })


  app.use('/', express.static(frontendDir));







  app.listen(3000, () => {
    console.log(`Example app listening on port 3000`)
  })

};



function api() {
  function capturecheck(userid, beaconid) {
    return new Promise(function (resolve) {
      sql.query("SELECT game_id FROM beacon WHERE beacon_id = ?", [beaconid], (err, res) => {
        if (err) { console.log("error: ", err); resolve(err, null); return; }
        if (!res[0]) {
          resolve("Invalid Beacon ID")
          return;
        }
        let gameid = res[0].game_id

        sql.query("SELECT user_id FROM plays WHERE user_id = ? AND game_id = ?", [userid, gameid], (err, res) => {
          if (err) { console.log("error: ", err); resolve(err, null); return; }
          if (!res[0]) {
            resolve("User not registered in this game")
            return;
          }

          sql.query("INSERT into collectedbeacon VALUES(?,?)", [beaconid, userid], (err, res) => {
            if (err) { console.log("error: ", err); resolve(err.code, null); return; }
            console.log(res);
            resolve("Success!")



          });



        });



      });
    });

  }

  function capture() {
    return new Promise(function (resolve) {
      sql.query("SELECT COUNT(passfail) AS response FROM " + sql.escapeId(v1) + " WHERE day= ? AND passfail='NOK'", [v2], (err, res) => {
        if (err) { console.log("error: ", err); resolve(err, null); return; }


        resolve(res[0]['response']);

      });
    });

  }

  return {
    capturecheck, capture
  };

}

api = api();