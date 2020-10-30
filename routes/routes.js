const router = require('express').Router();
const axios = require('axios');
const fs = require('fs');

//construct oauth redirect url using the client_secrets.json file
const CLIENT_SECRET = require('../client_secret.json').web;
const oauthURL = 'https://accounts.google.com/o/oauth2/v2/auth?' + 'client_id=' + CLIENT_SECRET.client_id + '&redirect_uri=' + CLIENT_SECRET.redirect_uris[0] + '&response_type=code&scope=https://www.googleapis.com/auth/gmail.send&access_type=offline';

//redirect to google oauth url
router.get('/', (req, res, next) => {
    res.redirect(oauthURL);
});

//callback for google oauth process to get auth info
router.get('/auth', (req, res, next) => {
    if (req.query.code) {
        console.log(req.query.code);

        const authURL = 'https://oauth2.googleapis.com/token?client_id=' + CLIENT_SECRET.client_id + '&client_secret=' + CLIENT_SECRET.client_secret + '&code=' + req.query.code + '&grant_type=authorization_code&redirect_uri=' + CLIENT_SECRET.redirect_uris[0];

        //get refresh and access tokens
        axios
        .post(authURL)
        .then(response => {
            console.log(response.data);
            return new Promise((resolve, reject) => {
                //write access tokens to a file
                fs.writeFile('user_tokens.json', JSON.stringify(response.data), (err) => {
                    if (err)    reject(err);
                    resolve(response.data);
                });
            });
        })
        .then(response => {
            console.log(response);
            res.status(200).json({
                message: 'Tokens Received'
            });
        })
        .catch(err => {
            console.error(err);
            res.status(500).json(err);
        });

    } else {
        console.log('Access Denied');
        res.status(403).json({
            error: 'Access Denied! Try again at http://localhost:3000/api'
        });
    }
});

//route to send an email
router.post('/send', (req, res, next) => {
    let USER_TOKENS;
    fs.readFile('user_tokens.json', (err, data) => {
        if (err)    throw err;
        USER_TOKENS = JSON.parse(data);
        if (USER_TOKENS.access_token) {
            const config = {
                headers: {
                    Authorization: 'Bearer ' + USER_TOKENS.access_token
                }
            };
    
            const data = 'To: ' + req.body.to + '\nSubject: ' + req.body.subject + '\n\n' + req.body.messageBody;
            console.log(data);
            //convert the entire message to base64
            const email64 = Buffer.from(data).toString('base64');
    
            axios
            .post('https://gmail.googleapis.com/gmail/v1/users/me/messages/send',{
                raw: email64
            }, config, err => {
                if (err)    throw err;
                console.log('POST https://gmail.googleapis.com/');
            })
            .then(response => {
                console.log(response);
                res.status(200).json({
                    status: 'Message Sent'
                });
            })
            .catch(err => {
                console.log(err);
                res.status(500).json({
                    error: err
                });
            });
    
        } else {
            res.status(500).json({
                message: 'Error! Go through the OAuth process first at http://localhost:3000/api'
            });
        }
    });
    
});

module.exports = router;
