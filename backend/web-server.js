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

  app.post('/api/userinfo', async function (req, res) {
    let userid = req.body['userid']
    let resp = await api.userinfo(userid)
    res.send(resp)
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

  async function userinfo(userid) {
    return new Promise(function (resolve) {
      sql.query(`SELECT plays.game_id, game.winner_id FROM plays
JOIN game ON plays.game_id = game.game_id WHERE plays.user_id = ?`, [userid], async (err, res) => {
        if (err) { console.log("error: ", err); resolve(err, null); return; }
        if (!res[0]) {
          resolve("User not registered in any game")
          return;
        }
        let games = []

        for (let i = 0; i < res.length; i++) {
          let curgame = { "gameid": res[i]['game_id'], "winnerid": res[i]['winner_id'], "beacons": {} }
          curgame["beacons"] = await api.userinfo2(userid, res[i]['game_id'])
          games.push(curgame)




        }


        resolve(JSON.stringify(games))




      });
    });


  }

  function userinfo2(userid, gameid) {
    return new Promise(function (resolve) {
      sql.query(`SELECT beacon_number, beacon.beacon_id, worded_hint, collectedbeacon.beacon_id collectedid FROM plays
      JOIN beacon ON plays.game_id  = beacon.game_id
      LEFT JOIN collectedbeacon ON beacon.beacon_id = collectedbeacon.beacon_id AND plays.user_id = collectedbeacon.user_id
      WHERE plays.user_id = ? AND plays.game_id = ? ORDER BY beacon_number ASC`, [userid, gameid], (err, res) => {

        if (err) { console.log("error: ", err); resolve(err, null); return; }
        // console.log(JSON.stringify(res2))
        resolve(res)

      });
    });

  }

  return {
    capturecheck, userinfo, userinfo2
  };

}

api = api();