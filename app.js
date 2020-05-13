// Copyright 2017 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';

// [START gae_node_request_example]
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const app = express();
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
const redirectionBase = 'https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=447522676163-jp2pi47rl10p8737mmenb1c2n3frhtdm.apps.googleusercontent.com&redirect_uri=https://cs493-assign5.wm.r.appspot.com/greetings&scope=profile&state=';
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
	if (req.query.state == state){
        res.send('Successful Flow');
    }
    else {
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
