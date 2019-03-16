# PIZZA-DELIVERY API

## User Operations

### Create a user
```
method                      : post
path                        : /users
query params                : none
payload:    firtsname*      : string
            lastname*       : string           
            email*          : formatted string
            address*        : string
            password*       : string
            tosAgreement*   : boolean
returns: status object, error object
```
### Find existing user
```
method                      : get
path                        : /users
query params                : email*
payload                     : none
header                      : token*
returns                     : status object, user data object/error object
```
### Update user info
```
method                      : put
path                        : /users
query params                : none
payload:    firtsName       : string
            lastName        : string
            email*          : formatted string
            address         : string
            password        : password
header                      : token*
returns                     : status object
```
### Delete existing user
```
method                      : delete
path                        : /users
query params                : none
payload                     : none
header                      : token*
header                      : email*
returns                     : status object
```

## Token Operations

### Create new token
```
method                      : post
path                        : /tokens
query params                : none
payload:    email*          : formatted string
            password*       : string
returns                     : status object
```

### Find existing token
```
method                      : get
path                        : /tokens
query params                : id*
payload                     : none
returns                     : status object, token data object/error object
```

### Extend token expiration
```
method                      : put
path                        : /tokens
query params                : none   
payload:    id*             : string			
            extend*         : boolean 
returns                     : status object
```

### Delete token
```
method                      : delete
path                        : /tokens
query params                : id*:string
payload                     : none
returns                     : status object
```

## Shopping operation

### Get menu items
```
method                      : get
path                        : /menu
query params                : none
payload                     : none
header                      : token* ,email*
returns                     : menu object or status object
```

### Put the choosen items to the cart
```
method                      : post
path                        : /cart
query params                : none
payload: items*             : array of objects [{id:XXX, quantity:XXX}]
header                      : token*,*Email
returns                     : Cart Object or status object
```

### Get the items from the cart
```
method                      : get
path                        : /cart
query params                : id*
payload                     : none
header                      : token*
returns                     :  Cart object or status object
```

### Update the items in the basket
```
method                      : put
path                        : /cart
query params                : id*
payload                     : items
header                      : token* email*
returns                     : status object
```

### Delete order from the basket
```
method                      : delete
path                        : /cart
query params                : itemid*
payload                     : none
header                      : token* cartId*
returns                     : status object
```
### Checkout (confirm and pay the order, send email)
```
method                      : post
path                        : /checkout
query params                : cardToken*
payload                     : none
header                      : token*
returns                     : status object
```

## Formats

Order format should be an array of objects with id's and amounts: 
```
[
    {"id":"XXX","qty":"XXX"}
    ...
]
```

Menu format is an object with the following format:
```
{
    "<id>":    {
                "iten":"XXXXX",           
                "price":"XXX"
            },
...
}
```
## Status codes

200     - Success
50X,40X - Errors

```
A user can have only one order.
