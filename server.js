'use-strict';

const bodyParser = require('body-parser');
const express = require(`express`);
const session = require(`express-session`);
const exphbs = require(`express-handlebars`);
const path = require('path');
const fs = require('fs');
const axios = require('axios');

//------------------- Remove Later---------------
const ciscospark_access_token = "MWJhN2Q4N2YtZmNiNS00MDMyLWE1YzAtOTZiMTY4NjY5OGM4ZjQzM2VhNDMtMWMx";

const spark_config = {
    sampleRoomId: "Y2lzY29zcGFyazovL3VzL1JPT00vNDRjYTRlZjAtMzRkZi0xMWU3LWJjNzgtNWIzNDEzMDJjNTM4"
};
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

            db.push({'store_name': store_name, 'access_token': access_token});
            //fs.writeFileSync('./db/connected-stores.json', db);

            console.log(store_name);

            let webhookObject = {
                "webhook": {
                    "topic": "orders\/create",
                    "address": "http:\/\/162.243.24.208\/shopify\/webhooks?store_name=" + store_name,
                    "format": "json"
                }
            }

            let axiosHeaders = {
                    headers: {
                        'Authorization': "Bearer " + access_token,
                        'X-Shopify-Access-Token': access_token
                    }
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
    console.log(req.body.total_price);

    let content = {
        "roomId": spark_config.sampleRoomId,
        "markdown": 'New order created for: $' + req.body.total_price,
    }

    let axiosHeaders = {
            headers: {
                'Authorization': "Bearer " + ciscospark_access_token
            }
    };

    axios.post('https://api.ciscospark.com/v1/messages', content, axiosHeaders)
    .then(function(response) {
        console.log(response);
    })
    .catch(function(error) {
        throw new Error(error);
    });

    res.sendStatus(200);
});

server.listen(80, function () {
  console.log('Example app listening on port 80...');
});