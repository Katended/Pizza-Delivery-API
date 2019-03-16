/***
 * Library  for configutation variable
 */


// container for the environments
var environments ={};

// staging (default) envinronment
environments.staging ={
    'httpPort':3000,
    'httpsPort':3001,
    'envName':'staging',
    'currency':'USD',
    'hashingSecret':'thisIsASecret',
    'stripe': {
        'authKey': 'sk_test_uNT3DBi1KWCEXZxkjah0ILea',
        'currency': 'usd'
	},
	'mailgun':{
		'authKey': 'c72f00b3bbb009f32464c4957d7aaafe-acb0b40c-25b7a9d1',
		'senderMail': 'postmaster@sandbox628420a8b6e540d59f3f15de6feb50c0.mailgun'
	}
    
};

// production environment
environments.production ={
    'httpPort':5000,
    'httpsPort':5001,
    'currency':'USD',
    'envName':'production',
    'hashingSecret':'thisIsASecrettoo',
    'stripe': {
        'authKey': '',
        'currency': 'usd'
	},
	'mailgun':{
		'authKey': ''
	}
    
};

// determine which environment was passed as a command-line aurgement
var currentEnvironment =typeof(process.env.NODE_ENV)=='string'?process.env.NODE_ENV.toLowerCase:'';

//  check that the current environment is one of the environments defined in the environment 

var environmentToExport = typeof(environments[currentEnvironment])=='object'?environments[currentEnvironment]:environments.staging

module.exports = environmentToExport;