'use-strict';

const express = require(`express`);
const session = require(`express-session`);
const exphbs = require(`express-handlebars`);
const path = require('path');
const fs = require('fs');
const axios = require('axios');

//------------------- Remove Later---------------
const access_token = "ZTE4YTQxOWMtOTJjZS00N2Q4LTlmMjctMjUxMTBjMDM1Y2QzNDczNTdmYjUtMmEw";
//------------------------------------------------

const env = JSON.parse(fs.readFileSync('./env.json', 'utf8'));
console.log(env);

let server = express();

server.use(session({
    secret: '2C44-4D44-WppQ38S',
    resave: true,
    saveUninitialized: true
}));

// server.engine('handlebars', exphbs({defaultLayout: 'main', layoutsDir: path.join(__dirname, "src", "views")})); 
// server.set('view engine', 'handlebars');

server.use(express.static(path.join(__dirname, 'src')));

let auth = function(req, res, next) {
    if(req.session.login && req.session.login == "true")
        next();
    else
    {
        //https://api.ciscospark.com/v1/authorize?response_type=code&client_id=Cf14c66a547d565a58a107141a509e8f4d8a7367e7a9cd9966675387841c41ca9&scope=spark:rooms_read,spark:messages_write&state=youbetcha&redirect_uri=https://requestb.in/zh18zhzh
        //const url = `https://api.ciscospark.com/v1/authorize?response_type=code&client_id=` + env.ciscospark["client-id"] + `&scope=` + env.ciscospark.scope + `&redirect_uri=https://requestb.in/zh18zhzh`;
        //console.log(url);
        //res.redirect(url);
        console.log("HELOOOO");
        next();
    }
        
};

server.get('/', function(req,res) {

    if(req.pquery.code) {
        console.log(req.query.code);
        res.sendCode(200);
    }  
    else
        res.sendFile(path.join(__dirname, 'index.html')); 
});

server.post('/', function(req, res) {
    console.log(req.params);
    console.log("session.login: ", req.session.login);
    console.log('hello2');

    res.send(200);
});

clearImmediate
server.post('/shopify/access_code', function(req, res) {
    console.log(res.query);
    req.session.login == "true";

    console.log('hello3');

    res.redirect('/');
});

server.listen(process.env.port || 80, function () {
  console.log('Example app listening on port 80...');
});