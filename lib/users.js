/***
 * Library  storing  and editing users
 */


// Dependencies
var _data = require('./data');
var helpers = require('./helpers');

//define handler for users
_users ={}

//  method: post
//  path:   /users
//  payload:  (firstname*, lastname*,email* ,address*,password* ,tosAgreement*)
//  returns:    200 /err object
_users.post = function (data, callback) {

    var firstname = typeof (data.payload.firstname) == 'string' && data.payload.firstname.length > 0 ? data.payload.firstname.trim() : false;
    var lastname = typeof (data.payload.lastname) == 'string' && data.payload.lastname.length > 0 ? data.payload.lastname.trim() : false;
    var email = typeof (data.payload.email) == 'string' && helpers.validateEmail(data.payload.email) ? data.payload.email.trim() : false;
    var address = typeof (data.payload.address) == 'string' && data.payload.address.length > 0 ? data.payload.address.trim() : false;
    var password = typeof (data.payload.password) == 'string' ? data.payload.password.trim() : false;
    var tosAgreement = typeof (data.payload.tosAgreement) == 'boolean' && data.payload.tosAgreement == true ? true : false;

    if (firstname && lastname && email && address && password && tosAgreement) {

        // make sure that the user doesn't exist already
        _data.read('users', email.replace('@', '_'), function (err, data) {

            if (!err) {

                // Hashing the password
                var hashPassword = helpers.hash(password);

                if (hashPassword) {

                    // create user object
                    var userObject = {
                        'firstname': firstname,
                        'lastname': lastname,
                        'email': email,
                        'address': address,
                        'password': hashPassword,
                        'tosAgreement': true
                    };

                    _data.create('users', email.replace('@', '_'), userObject, function (err) {

                        if (!err) {
                            callback(200,{'Success': 'User created'});
                        } else {
                            console.log(err);
                            callback(500, {'Error': ' Could not create the new user'});
                        }

                    });

                } else {
                    callback(500, {
                        'Error': ' Could not hash password'
                    })
                }

            } else {
                callback(500, {
                    'Error': 'Someone is already registered with this email address'
                });
            }


        });

    } else {
        callback(500, {
            'Error': 'One or more require fields is missing or invalid'
        });
    }



}


//  method:     get
//  path:       /users
//  headers:     token*
//  payload:    (email*)
//  returns:    err/ User object/ response code
_users.get = function (data, callback) {

    // check that the email address is valid
    var email = typeof (data.payload.email) == 'string' && data.payload.email.length > 0 && data.payload.email.indexOf('@') > -1 ? data.payload.email.trim() : false;

    if (email) {
        // get token from the headers
        var token = typeof (data.headers.token) == 'string' ? data.headers.token : false;

        // verify that the token is valid for the email address
        _tokens.verifyToken(token, email.replace('@', '_'), function (tokenIsValid) {

            if (tokenIsValid) {
                _data.read('users', email.replace('@', '_'), function (err, userData) {

                    if (!err && data) {

                        // remove the hash password from the user object before returning it
                        delete userData.password;
                        callback(200, userData);

                    } else {
                        callback(401, {
                            'Error': 'Could not find specified email address'
                        });
                    }

                });

            } else {
                callback(403, {
                    'Error': 'Missing required to token or token is invalid'
                });
            }

        });



    } else {
        callback(401, {
            'Error': 'Invalid email address supplied'
        })
    }


}

//  method:     put
//  path:       /users
//  headers:     token*
//  payload:    (firstname*, lastname*,email* ,address*,password*)
//  returns:    err / response code
_users.put = function (data, callback) {

    // check for the required fields 
    var email = typeof (data.payload.email) == 'string' && data.payload.email.length > 0 && data.payload.email.indexOf('@') > -1 ? data.payload.email.trim() : false;
    var firstname = typeof (data.payload.firstname) == 'string' && data.payload.firstname.length > 0 ? data.payload.firstname.trim() : false;
    var lastname = typeof (data.payload.lastname) == 'string' && data.payload.lastname.length > 0 ? data.payload.lastname.trim() : false;
    var address = typeof (data.payload.address) == 'string' && data.payload.address.length > 0 ? data.payload.address.trim() : false;
    var password = typeof (data.payload.password) == 'string' ? data.payload.password.trim() : false;

    // Error if the email is invalid
    if (email) {


        // Error if nothing is sent to update
        if (firstname && lastname && address && password) {

            // get token form the headers
            var token = typeof (data.headers.token) == 'string' ? data.headers.token : false;

            // verify that the token is valid for the phine number
            _tokens.verifyToken(token, email.replace('@', '_'), function (tokenIsValid) {

                if (tokenIsValid) {

                    // lookup user
                    _data.read('users', email.replace('@', '_'), function (err, userData) {

                        if (!err && userData) {

                            if (firstname) {
                                userData.firstname = firstname;
                            }

                            if (lastname) {
                                userData.lastname = lastname;
                            }

                            if (address) {
                                userData.address = address;
                            }

                            if (password) {
                                userData.password = helpers.hash(password);
                            }

                            _data.update('users', email.replace('@', '_'), userData, function (err) {

                                if (!err) {
                                    callback(200,{'Success': 'User updated'});
                                } else {
                                    console.log(err);
                                    callback(500, {
                                        'Error': ' User could not be updated'
                                    });
                                }

                            });


                        } else {
                            callback(403, {
                                'Error': 'Specified user does not exist'
                            })
                        }

                    });

                } else {
                    callback(500, {
                        'Error': 'Missing required token in header, or no token is invalid'
                    })
                }
            });


        } else {
            callback(400, {
                'Error': 'Missing fields to update'
            });
        }

    } else {
        callback(400, {
            'Error': 'Missing required field'
        });
    }


}


//  method:             delete
//  path:               /users
// query string params: id*
//  header:             email* 
//  returns:            err / response code
_users.delete = function (data, callback) {


    // check that the email provided is valid
    var email = typeof (data.headers.email) == 'string' && helpers.validateEmail(data.headers.email) ? data.headers.email.trim() : false;
    var token = typeof (data.headers.token) == 'string' && data.headers.token.trim().length == 20 ? data.headers.token.trim() : false;

    if (email && token) {

       
        // verify that the token is valid for the phine number
        _tokens.verifyToken(token, email.replace('@', '_'), function (tokenIsValid) {

            if (tokenIsValid) {

                _data.read('users', email.replace('@', '_'), function (err, userData) {

                    if (!err && userData) {
                        
                       
                        _data.delete('users', email.replace('@', '_'), function (err) {

                            if (!err) {

                                // delete user tokens
                                _data.delete('tokens', token, function (err) {

                                    if (!err) {
                                        callback(200,{'Success': 'User token(s) deleted'});
                                    }else{
                                        callback(404, {
                                            'Error': 'Could not delete user token(s)'
                                        });
                                    }


                                });

                                callback(200,{'Success': 'User deleted'});

                            } else {
                                callback(500, {
                                    'Error': 'Could not delete the specified user'
                                });
                            }

                        });



                    } else {
                        callback(404, {
                            'Error': 'Could not find specified user'
                        });
                    }

                });
            } else {
                callback(500, {
                    'Error': 'Missing required token in header, or no invalid token'
                })
            }
        });


    } else {
        callback(401, {
            'Error': 'Required field missing'
        })
    }

}

// export module
module.exports = _users;