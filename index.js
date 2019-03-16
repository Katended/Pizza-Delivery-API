/*Primary file for API
*/
//Dependecies
var server = require('./lib/server');

// declare the app
var app = {};

// Initialise the app
app.init = function(){

    // start the server
    server.init();
}

app.init();

module.exports = app;
