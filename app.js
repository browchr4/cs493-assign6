//Chris Brown CS493 Assign6
//Used GAE's nodejs-docs-samples, lectures, https://stackoverflow.com/questions/5643321/how-to-make-remote-rest-call-inside-node-js-any-curl, https://stackoverflow.com/questions/1349404/generate-random-string-characters-in-javascript

'use strict';

const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const app = express();
const request = require('request');

let hbs = require('express-handlebars').create({
	defaultLayout: 'main',
	extname: 'hbs',
	layoutDir: '${__dirname}/views/layouts'
});
app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static("public"));

const secret = '5_uCmjfrKpr4gXHq1RFsW6Bn';
const redirectionBase = 'https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=447522676163-jp2pi47rl10p8737mmenb1c2n3frhtdm.apps.googleusercontent.com&redirect_uri=https://cs493-assign5.wm.r.appspot.com/greetings&scope=profile email openid&state=';
const serverUri = 'https://cs493-assign5.wm.r.appspot.com'
var state = ''; 
var accessToken = '';

//https://stackoverflow.com/questions/1349404/generate-random-string-characters-in-javascript
function makeRandomState() {
   var result           = '';
   var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
   var charactersLength = characters.length;
   for ( var i = 0; i < 15; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
   }
   return result;
}

//Load the very basic homepage
app.get('/', (req, res) => {
	res.render('home');
});

//This is strictly a redirection page to generate a new State value
app.get('/createState', (req, res) => {
	state = makeRandomState();
    var totalUri = redirectionBase + state;
    res.redirect(totalUri);
});

//This page presents all the data it has received
app.get('/greetings', (req, res) => {
	if (req.query.state == state){                                          //If state matches it is a request from same client
        var totalUri = serverUri + '/greetings';

        const payload = {
            code: req.query.code,
            client_id: '447522676163-jp2pi47rl10p8737mmenb1c2n3frhtdm.apps.googleusercontent.com',
            client_secret: secret,
            redirect_uri: totalUri,
            grant_type: 'authorization_code'
        };
        //Let's get that OAuth token
        request.post({
            uri: 'https://oauth2.googleapis.com/token',
            json: true,
            body: payload
        }, function (error, response, body) {
            if (!error && response.statusCode == 200) {                     //If state and secret are same then turns auth code into a token
                accessToken = 'Bearer ' + body.access_token;                //Set global token in case we needed subsequent requests

                request({                                                   //Use token to request People API url from Assignment hints
                    uri: 'https://people.googleapis.com/v1/people/me?personFields=names,emailAddresses',
                    json: true,
                    headers: {'Authorization': accessToken}
                }, function (error, response, body) {
                    var fill = {};
                    fill.firstName = body.names[0].givenName;
                    fill.lastName = body.names[0].familyName;
                    fill.curState = state;

                    res.render('hello', fill);
                });
            }
            else{
                res.send('Something went wrong');
            }
        })
    } 
    else {                                                                  //If state doesn't match then ignore
        res.send('Fraud!')
    }
});

// Start the server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
  console.log('Press Ctrl+C to quit.');
});
// [END gae_node_request_example]

module.exports = app;
