/***
 * Library  for  route handlers
 */

// Dependencies
var  _tokens = require('./tokens');

var  _order= require('./orders');
var _users = require('./users');
var  _menu = require('./menu');
var helpers = require('./helpers');


// Container for the handlers 
var handlers = {};

//Users
handlers.users = function (data, callback) {

    var acceptableMethods = ['post', 'get', 'put', 'delete'];

    if (acceptableMethods.indexOf(data.method.toLowerCase()) > -1) {

        _users[data.method.toLowerCase()](data, callback);

    } else {
        callback(405);
    }
};

//Tokens
handlers.tokens = function (data, callback) {

    var acceptableMethods = ['post', 'get', 'put', 'delete'];

    if (acceptableMethods.indexOf(data.method.toLowerCase()) > -1) {

        _tokens[data.method.toLowerCase()](data, callback);

    } else {
        callback(true);
    }
};

//Login
handlers.login = function (data, callback) {

    var acceptableMethods = ['post', 'delete'];

    if (acceptableMethods.indexOf(data.method.toLowerCase()) > -1) {

        helpers.login(data, callback);

    } else {
        callback(405);
    }
};

//Logout
handlers.logout = function (data, callback) {

    var acceptableMethods = ['delete'];

    if (acceptableMethods.indexOf(data.method.toLowerCase()) > -1) {

        helpers.logout(data, callback);

    } else {
        callback(405);
    }
};

//Menu
handlers.menu = function (data, callback) {

    var acceptableMethods = ['get'];

    if (acceptableMethods.indexOf(data.method.toLowerCase()) > -1) {

        _menu[data.method.toLowerCase()](data, callback);

    } else {
        callback(405);
    }
};


// Order 
handlers.order = function (data, callback) {

    var acceptableMethods = ['post', 'delete', 'get', 'put'];

    if (acceptableMethods.indexOf(data.method.toLowerCase()) > -1) {

        _order[data.method.toLowerCase()](data, callback);

    } else {
        callback(405);
    }
};


// Checkout
handlers.checkout = function (data, callback) {

    var acceptableMethods = ['post'];

    if (acceptableMethods.indexOf(data.method.toLowerCase()) > -1) {

        _order.checkout(data, callback);
        
    } else {
        callback(405);
    }
};

//not found
handlers.notfound = function (data, callback) {
    callback();
}

// export module
module.exports = handlers;