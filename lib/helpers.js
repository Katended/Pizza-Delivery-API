/**
 * Library  for various common tasks
 */

// Dependencies
var crypto = require('crypto');
var config = require('./config');
var https = require('https');
var handlers = require('./handlers');
var querystring = require('querystring');



// Container for helpers
var helpers = {};

// validate email
helpers.validateEmail = function (email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

// create a HASH256 hash
helpers.hash = function (str) {

    if (typeof (str) == 'string' && str.length > 0) {

        var hash = crypto.createHmac('sha256', config.hashingSecret).update(str).digest('hex');

        return hash;

    } else {
        return false;
    }

}

//Parse a Json string to an obect in all cases, without throwing
helpers.parseJsonToObject = function (str) {


    try {

        var obj = JSON.parse(str);
        return obj;

    } catch (e) {

        return {};
    }

}

// create a string of random alpha-numeric characters of a given length
helpers.createRandomString = function (strLength) {

    strLength = typeof (strLength) == 'number' && strLength > 0 ? strLength : false;

    if (strLength) {

        // Define all possible characters
        var possibleCharacters = 'abcdefghijklmnopqrstvuvwx1234567890';

        var str = '';

        for (i = 1; i <= strLength; i++) {

            // get random character from string
            var randomCharacter = possibleCharacters.charAt(Math.floor(Math.random() * possibleCharacters.length));

            str += randomCharacter;

        }

        return str;
    } else {
        return false;
    }

}



 // Charge customer 
 helpers.chargeCard = function(amount, cardToken, description, callback){

    // Validate params
    amount = typeof(amount) == 'number' && Number.isInteger(amount) && amount >= 50 ? amount : false;
    cardToken = typeof(cardToken) == 'string' && cardToken.indexOf('tok_') == 0 ? cardToken : false;

    if(amount) {

        if(cardToken){

            

            // Configure the request payload
            var payload = {
                'amount' : amount,
                'currency' : config.stripe.currency,
                'source': 'tok_visa',                           
                'description': description
            };

            // Stringify the payload
            var stringPayload = querystring.stringify(payload);

            // create the request object
            var requestDetails = {
                protocol : 'https:',
                hostname : 'api.stripe.com',
                method : 'POST',
                path : '/v1/charges',             
                headers : {
                    'Accept': 'application/json',                
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Content-Length': Buffer.byteLength(stringPayload)},
                authorization:`Bearer ${config.stripe.authKey}` 
                      
            };

            // Instantiate the request object
            var req = https.request(requestDetails, function(res){

               
                // Callback success code if the request went through
                if([200,201].indexOf(res.statusCode)>-1){
                    callback(false,res.statusCode);
                } else {
                    callback('Status code returned was ' +res.statusCode, JSON.stringify(res.headers));
                }

            });

            // Bind to the error event so it doesn't get thrown
            req.on('error', function(e){
                callback(e);
            });

            // Add the payload
            req.write(stringPayload);

            // End the request
            req.end();
        } else {
            callback('Wrong card token');
        }
    } else {
        callback('Wrong amount');
    }
};

// Send email
helpers.sendMail = function(sender, receiver, subj, message, callback){

    // Validate params
    sender = typeof(sender) == 'string' && helpers.validateEmail(sender) ? sender : false;
    receiver = typeof(receiver) == 'string' && helpers.validateEmail(receiver) ? receiver : false;
    subj = typeof(subj) == 'string' && subj.length <= 78 ? subj : false;
    message = typeof(message) == 'string' && message.length > 0 ? message : false;
    if(sender && receiver && subj && message) {
        
        // Configure the request payload
        var payload = {
            from : sender,
            to : receiver,
            subject: subj,
            text: message

        };
        // Stringify the payload
        var stringPayload = querystring.stringify(payload);

        // Configure the request details
        var requestDetails = {
            protocol : 'https:',
            hostname : 'api.mailgun.net',
            method : 'POST',
            path : '/v3/sandbox628420a8b6e540d59f3f15de6feb50c0.mailgun.org/messages',
            headers : {
                'Content-Type' : 'application/x-www-form-urlencoded',
                authorization: 'Basic ' + Buffer.from(('api:'+ config.mailgun.authKey)).toString('base64')
            }
        };

        // Instantiate the request object
        var req = https.request(requestDetails, function(res){
            
            // grab the status of the sent message
            var status = res.statusCode;
            // Callback successfully if the request went through
            if(status == 200 || status == 201){
                callback(false);
            } else {
                callback('Status code returned was ' +status, JSON.stringify(res.headers));
            }
        });

        // Bind to the error event so it doesn't get thrown
        req.on('error', function(e){
            callback(e);
        });

        // Add the payload
        req.write(stringPayload);

        // End the request
        req.end();
    } else {
        callback('Error: Missing required field')
    }
};

//Login
helpers.login = function (data, callback) {

    _tokens.post(data, function (err, tokenObject) {

        if (!err) {
            callback(200,{'Success':'User is logged on as ' + tokenObject.email});
        } else {
            callback(500, err);
        }

    });

}

//logout
helpers.logout= function (data, callback) {

    _tokens.delete(data, function (err) {

        if (!err) {
            callback(200);
        } else {
            callback(400, err);
        }

    });

}

// export module
module.exports = helpers;