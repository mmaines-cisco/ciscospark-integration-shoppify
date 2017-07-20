'use-strict';

const bodyParser = require('body-parser');
const express = require(`express`);
const session = require(`express-session`);
const exphbs = require(`express-handlebars`);
const path = require('path');
const fs = require('fs');
const axios = require('axios');

//------------------- Remove Later---------------
const ciscospark_access_token = "ZTE4YTQxOWMtOTJjZS00N2Q4LTlmMjctMjUxMTBjMDM1Y2QzNDczNTdmYjUtMmEw";
//------------------------------------------------

const env = JSON.parse(fs.readFileSync('./env.json', 'utf8'));
console.log(env);

const db = JSON.parse(fs.readFileSync('./db/connected-stores.json', 'utf8'));

let server = express();

server.use( bodyParser.json() );       // to support JSON-encoded bodies
server.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
})); 

server.use(session({
    secret: '2C44-4D44-WppQ38S',
    resave: true,
    saveUninitialized: true
}));

 //server.engine('handlebars', exphbs({defaultLayout: 'main'})); 
 //server.set('view engine', 'handlebars');

server.use(express.static(path.join(__dirname, 'src')));

let auth = function(req, res, next) {
    if(req.session.login && req.session.login == "true")
        next();
    else
    {
        //https://api.ciscospark.com/v1/authorize?response_type=code&client_id=Cf14c66a547d565a58a107141a509e8f4d8a7367e7a9cd9966675387841c41ca9&scope=spark:rooms_read,spark:messages_write&state=youbetcha&redirect_uri=https://requestb.in/zh18zhzh
        const url = `https://api.ciscospark.com/v1/authorize?response_type=code&client_id=` + env.ciscospark["client-id"] + `&scope=` + env.ciscospark.scope + `&redirect_uri=` + env.ciscospark['redirect-uri'] + '/test';
        //console.log(url);
        res.redirect(url);
        //console.log("HELOOOO");
        next();
    }
        
};

server.get('/', function(req,res) {

    if(req.query.code) {
        req.session.login="true"
        console.log(req.query.code);
        res.query = "";

        axios.post('https://' + req.query.state + '.myshopify.com/admin/oauth/access_token', {
            client_id: env.shopify['client-id'],
            client_secret: env.shopify['client-secret'],
            'code': req.query.code
        })
        .then(function (response) {
            console.log(response.data);
            let access_token = response.data.access_token;
            let store_name =req.query.state;

            console.log(store_name);

            let webhookObject = {
                "webhook": {
                    "topic": "orders\/create",
                    "address": "http:\/\/162.243.24.208\/shopify\/webhooks?store_name=" + store_name,
                    "format": "json"
                }
            }

            let axiosHeaders = {
                    headers: {'Authorization': "Bearer " + access_token}
            };

            let webhookAPIUrl = "https://" + store_name + ".myshopify.com/admin/webhooks.json";
            console.log("webhookObject: ", webhookObject);

            axios.post(webhookAPIUrl, webhookObject, axiosHeaders)
            .then(function(response) {
                console.log("\n\n\n\n", response);
            })
            .catch(function(error) {
                console.log(error);
                throw new Error(error);
            });

        })
        .catch(function (error) {
            console.log(error);
            res.send(500);
            return;
        });
    }  

    //res.render('connected-stores');
    res.sendFile(path.join(__dirname, 'index.html')); 
});

server.get('/test', auth, function(req, res) {
    res.send(200);
});

server.post('/test', function(req, res) {
    res.send(200);
})

server.post('/shopify/webhooks', function(req, res) {
    console.log(req.query);
    console.log('hello3');
    console.log(req.body);

    res.sendStatus(200);
});

server.listen(80, function () {
  console.log('Example app listening on port 80...');
});