/***
 * Library  for the server
 */

// Dependencies
var config = require('./config');
var http = require('http');
var https = require('https');
var url = require('url')
var StringDecoder = require('string_decoder').StringDecoder
var fs = require('fs');
//var _data = require('./data');
var handlers = require('./handlers');
var helpers = require('./helpers');
var path = require('path');
var router = require('./routes');
var users = require('./users');


// Instantiate the server module object
var server = {};


// create HTTP server
server.httpServer = http.createServer(function (req, res) {
    server.unifiedServer(req, res);
});



// create HTTPs server
server.httpsServerOptions = {
    'key': fs.readFileSync(path.join(__dirname + '/../https/bin/key.pem')),
    'cert': fs.readFileSync(path.join(__dirname + '/../https/bin/cert.pem'))
}

server.httpsServer = https.createServer(server.httpsServerOptions, function (req, res) {
    server.unifiedServer(req, res);
});


// unified server logic
// this is called for every http/htpps request 
server.unifiedServer = function (req, res) {

    // get the URL and parse it, and parse it
    var parsedUrl = url.parse(req.url, true);

    console.log('Browser connected on port ' + config.httpport);

    // Get the path
    var path = parsedUrl.pathname;
    var trimmedPath = path.replace(/^\/+|\/+$/g, '');

    var queryStringObject = parsedUrl.query;


    // get the method
    var method = req.method.toUpperCase();

    // get the headers and as object
    var headers = req.headers;

    // get payload if any
    var decoder = new StringDecoder('utf-8');

    var buffer = '';

    req.on('data', function (data) {
        buffer += decoder.write(data);
    });

    req.on('end', function (data) {
        buffer += decoder.end();

        // choose the handler this request goes to
        var chosenHandler = typeof (router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : handlers.notfound;

        var data = {
            'trimmedPath': trimmedPath,
            'queryStringObject': queryStringObject,
            'method': method,
            'headers': headers,
            'payload': helpers.parseJsonToObject(buffer)
        };

        // call chosen handler
        chosenHandler(data, function (statusCode, payload) {

            // use the status code called back by the handler or default to 200 
            statusCode = typeof (statusCode) == 'number' ? statusCode : 200;


            // use the payload called back by the handler or default to empty object
            payload = typeof (payload) == 'object' ? payload : {};

            // convert payload to string
            var payloadString = JSON.stringify(payload);

            // return the response
            res.writeHead(statusCode);

            res.end(payloadString);

            console.log('The response is ', statusCode, payloadString);
        });

    });

};

server.init = function () {

    // start HTTP  server
    server.httpServer.listen(config.httpPort, function () {
        console.log('\x1b[35m%s\x1b[0m', 'The HTTP server is started and listening to port ' + config.httpPort + ' in ' + config.envName + ' mode');

    })

    // start HTTPS server
    server.httpsServer.listen(config.httpsPort, function () {

        console.log('\x1b[36m%s\x1b[0m', 'The HTTPS server is started and listening to port ' + config.httpsPort + ' in ' + config.envName + ' mode');

    })

}

module.exports = server;