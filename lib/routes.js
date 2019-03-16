/***
 * Library  for routes
 */


// Dependencies
var  handlers = require('./handlers');

// Define a request router
var  router = {
    'users': handlers.users,
    'tokens': handlers.tokens,
    'login': handlers.login,
    'logout': handlers.logout,
    'menu': handlers.menu,
    'order': handlers.order,
    'checkout': handlers.checkout
};

module.exports = router;