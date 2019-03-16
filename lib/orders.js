/***
 * Library  storing  and editing orders
 */

// Dependencies
var helpers = require('./helpers');
var _tokens = require('./tokens');
var _data = require('./data');
var config = require('./config');

// Container for orders
_order = {};

//  method: post
//  path:   /cart
//  header: token*
//  header: email*
//  payload:  [{id:XXX, qty:XXX}]
//  returns:    err/ cart object
_order.post = function (data, callback) {

    var email = typeof (data.headers.email) == 'string' && helpers.validateEmail(data.headers.email) ? data.headers.email.trim() : false;
    var token = typeof (data.headers.token) == 'string' && data.headers.token.trim().length == 20 ? data.headers.token : false;

    if (token && email) {

        // get user token data
        // _data.read('tokens', token, function (err, tokenData) {
        _tokens.verifyToken(token, email.replace('@', '_'), function (tokenIsValid) {
            // var email = tokenData.email;

            if (tokenIsValid) {

                var orderList = typeof (data.payload) == 'object' && data.payload instanceof Array ? data.payload : false;

                if (orderList) {

                    // check see if use has a shopping cart
                    _data.read('users', email.replace('@', '_'), function (err, userData) {

                        if (!err && userData) {

                            // check if user has  a shopping cart
                            userData.cartid = typeof (userData.cartid) == 'string' && userData.cartid.length > 0 ? userData.cartid : helpers.createRandomString(20);

                            // Create the cart object
                            var cartObject = {
                                'cartid': userData.cartid,
                                'email': email,
                                'created': Date.now(),
                                'orders': orderList
                            };

                            // add user cart
                            _data.create('cart', userData.cartid, cartObject, function (err) {

                                if (!err) {

                                    // update user with cartid
                                    _data.update('users', email.replace('@', '_'), userData, function (err) {

                                        if (!err) {
                                            callback(200, {
                                                'Success': cartObject
                                            });
                                        } else {
                                            callback(500, {
                                                'Error': ' User could not be updated'
                                            });
                                        }

                                    });



                                } else {
                                    callback(500, {
                                        'Error': 'Could not make an order'
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
                    callback(400, {
                        'Error': 'Please make an order'
                    });
                }





            } else {
                callback(500, {
                    'Error': 'Please login'
                });
            }

        });
    } else {
        callback(500, {
            'Error': 'Invalid token or email'
        });
    }

};


// method: get
// path: /cart
// query params: cartid*
// payload: none
// header: token*
// returns:  order object
_order.get = function (data, callback) {

    // Check the cartid is valid
    var cartId = typeof (data.queryStringObject.cartid) == 'string' && data.queryStringObject.cartid.trim().length == 20 ? data.queryStringObject.cartid.trim() : false;

    if (cartId) {

        // Lookup the order
        _data.read('cart', cartId, function (err, cartData) {
            if (!err && cartData) {

                var email = cartData.email;

                // Get the token from the header
                var token = typeof (data.headers.token) == 'string' ? data.headers.token : false;

                // Verify the given token is valid and belongs to the user who created it
                _tokens.verifyToken(token, email, function (tokenIsValid) {

                    if (tokenIsValid) {
                        callback(200, cartData.orders);
                    } else {
                        callback(403,{'Error':'Invalid token'})
                    }

                });

            } else {
                callback(404,{'Error':'Invalid Cart Id'});
            }
        });
    } else {
        callback(400, {
            'Error': 'Missing required field'
        })
    }
};



// method: put
// path: /cart
// query params: id* (cart id)
// payload: items
// header: token* email*
_order.put = function (data, callback) {

    // Check for the required fields
    var cartId = typeof (data.queryStringObject.cartid) == 'string' && data.queryStringObject.cartid.trim().length == 20 ? data.queryStringObject.cartid.trim() : false;

    var orderList = typeof (data.payload) == 'object' && data.payload instanceof Array ? data.payload : false;



    // Check to make sure cartid is valid    
    if (cartId) {

        if (orderList) {

            // Get the token from the header
            var email = typeof (data.headers.email) == 'string' && helpers.validateEmail(data.headers.email) ? data.headers.email.trim() : false;
            var token = typeof (data.headers.token) == 'string' && data.headers.token.trim().length == 20 ? data.headers.token : false;

            // validate headers
            if (email && token) {

                // Verify the given token is valid and belongs to the user who created the check
                _tokens.verifyToken(token, email, function (tokenIsValid) {

                    if (tokenIsValid) {

                        // Lookup the shopping cart
                        _data.read('cart', cartId, function (err, cartData) {

                            if (!err && cartData) {

                                cartData.orders = orderList;

                                // update the cart/order
                                _data.update('cart', cartId, cartData, function (err) {
                                    if (!err) {
                                        callback(200, {
                                            'Succes': 'Order updated'
                                        });
                                    } else {
                                        callback(500, {
                                            'Error': 'Could not update the order'
                                        });
                                    }
                                });

                            } else {

                                callback(500, {
                                    'Error': 'Could not update the order'
                                });
                            }

                        });


                    } else {
                        callback(403, {
                            'Error': 'Invalid token'
                        });
                    }
                });

            } else {
                callback(400, {
                    'Error': 'Missing required fields'
                });
            }




        } else {
            callback(400, {
                'Error': 'No order specified'
            });
        }
    } else {
        callback(400, {
            'Error': 'Missing required fields'
        });
    }
};

// method: delete
// path: /cart
// query params: itemid *
// payload: none
// header: token* cartId*
_order.delete = function (data, callback) {

    var itemId = typeof (data.queryStringObject.itemid) == 'string' && data.queryStringObject.itemid > 0 ? data.queryStringObject.itemid : false;
    var cartId = typeof (data.headers.cartid) == 'string' && data.headers.cartid.trim().length == 20 ? data.headers.cartid : false;

    // Check the id is valid
    if (itemId && cartId) {

      
        // Lookup the cart/orders
        _data.read('cart', cartId, function (err, cartData) {

            if (!err && cartData) {

              
                var token = typeof (data.headers.token) == 'string' && data.headers.token.trim().length == 20 ? data.headers.token : false;
    
                
                // Verify the given token is valid for the phone number
                _tokens.verifyToken(token, cartData.email, function (tokenIsValid) {
                    if (tokenIsValid) {

                        // Loop through the cart and remove specified item
                        cartData.orders.forEach(function (item, index) {

                            if (item.id==itemId) {
                                // Delete the item
                                cartData.orders.splice(index, 1);
                            }

                        });


                        _data.update('cart', cartId, cartData, function (err) {
                            if (!err) {
                                callback(200,{'Success':'Item removed from cart'});
                            } else {
                                callback(500, {
                                    'Error': 'Could not delete the order data'
                                });
                            }
                        });


                    } else {
                        callback(403, {
                            'Error': 'Invalod token data'
                        });
                    }
                });

            } else {
                callback(400, {
                    'Error': 'The specified order ID does not exist'
                });
            }
        });
        
    } else {
        callback(400, {
            'Error': 'Missing required field'
        });
    }
};


// method: post
// path: /checkout
// query params: cardToken*
// payload: none
// header: token*
// returns: code, error object
_order.checkout = function (data, callback) {

    // Check if card token passed
    var cardToken = typeof (data.queryStringObject.cardToken) == 'string' && data.queryStringObject.cardToken.indexOf('tok_') == 0 ? data.queryStringObject.cardToken : false;

    if (cardToken) {

        // validate headers
        var email = typeof (data.headers.email) == 'string' && helpers.validateEmail(data.headers.email) ? data.headers.email.trim() : false;
        var token = typeof (data.headers.token) == 'string' && data.headers.token.trim().length == 20 ? data.headers.token : false;


        // Verify the given token is valid for the email
        _tokens.verifyToken(token, email, function (tokenIsValid) {

            if (tokenIsValid) {


                // Lookup the user
                _data.read('users', email.replace('@', '_'), function (err, userData) {

                    if (!err && userData) {

                        // Check if the user has an order
                        if (userData.cartid) {

                            // get the user's order
                            _data.read('cart', userData.cartid, function (err, cartData) {

                                if (!err && cartData) {

                                    // calculate the order total amount
                                    var totalAmount = 0;

                                    // Loop through customer order 
                                    // calculate total payment
                                    var message = '';
                                    var menu =_data.menu;

                                   for (var i = 0; i < cartData.orders.length; i++) {
                                     
                                        totalAmount += menu[cartData.orders[i].id].price * cartData.orders[i].qty;
                                        message += menu[cartData.orders[i].id].item + ' - ' + config.currency + ' ' + menu[cartData.orders[i].id].price / 100 + ' x ' + cartData.orders[i].qty + ' pieces\n'
                                    }

                                    // charge the card
                                    helpers.chargeCard(totalAmount, cardToken, 'Pizza order charge', function (err) {
                                        if (!err) {

                                            // send email
                                            message = 'Your order has been paid. \nThank you for choosing us! \n\nYour order details: \n' + message + '\tTotal amount: $' + totalAmount / 100;

                                            helpers.sendMail(config.mailgun.senderMail, userData.email, 'Pizza order', message, function (err) {
                                                if (!err) {
                                                    callback(200);
                                                } else {
                                                    callback(err);
                                                }
                                            });

                                        } else {

                                            callback(err);

                                        }
                                    });

                                } else {
                                    callback(400, {
                                        'Error': 'Could not find the order'
                                    });
                                }
                            });
                        } else {
                            callback(400, {
                                'Error': 'The user does not have an order'
                            });
                        }
                    } else {
                        callback(400, {
                            'Error': 'Could not find the specified user'
                        });
                    }
                });
            } else {
                callback(403, {
                    'Error': 'Missing required token in header or token is invalid'
                });
            }
        });
    } else {
        callback(400, {
            'Error': 'Missing card token'
        });
    };
};

module.exports = _order;