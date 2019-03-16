/***
 * Library for the menu
 */

var _data = require('./data');

// Container for menu
_menu ={};


// path: /menu
// method:  get
// query params: none
// payload: none
// header: (email* token*)
// returns: Err/menu object
_menu.get = function (data, callback) {

    var email = typeof (data.headers.email) == 'string' && data.headers.email.length > 0 && data.headers.email.indexOf('@') > -1 ? data.headers.email.trim() : false;
    var token = typeof (data.headers.token) == 'string' ? data.headers.token : false;

    // make sure the email and token are valid
    if (email && token) {

        // verify that the token is valid and belongs to the user who created the check
        _tokens.verifyToken(token, email.replace('@', '_'), function (tokenIsValid) {

            if (tokenIsValid) {

                var menu =_data.menu;

                callback(200, menu);
            } else {
                callback(500, {
                    'Error': 'The specified token does not exist'
                });
            }

        });

    } else {
        callback(500, {
            'Error': 'Email or token is invalid'
        });
    }

};

module.exports = _menu;