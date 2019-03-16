/***
 * Library for storing and editing data in the files
 * 
 */

 // Dependencies
 var fs = require('fs');
 var path = require('path');
 var helpers  = require('./helpers');

 // Container for the module (to be exported)
var lib ={};

// Base directory of the data folder 
lib.baseDir = path.join(__dirname,'/../.data/');


// Write data to a file
lib.create = function(dir,file,data,callback){

    // Open the file for writing
    fs.open(lib.baseDir+dir+'/'+file+'.json','wx',function(err,fileDescriptor){

        if(!err && fileDescriptor){

            // convert data to string
            var stringData = JSON.stringify(data);

            // write to file file and close it
            fs.writeFile(fileDescriptor,stringData,function(err){
            if(!err){
                
                fs.close(fileDescriptor,function(err){

                    if(!err){
                        callback(false); 
                    }else{
                        callback('Error closing new file');
                    }

                })
            }else{

            }
        });

        }else{
            callback('Could not create new file, it may already exist')
        }

    });

};

// read data from a file
lib.read = function (dir,file,callback){

    fs.readFile(lib.baseDir+dir+'/'+file+'.json','utf8',function(err,data){

        if(!err && data){
            var parsedData = helpers.parseJsonToObject(data);
            callback(err,parsedData);
        }else{
            callback(false,data);
            
        }
   
    });

}

// update data inside a file
lib.update= function (dir,file,data,callback){

    // open the file for writing
    fs.open(lib.baseDir+dir+'/'+file+'.json','r+',function(err,fileDescriptor){

        if(!err && fileDescriptor ){

            var stringData = JSON.stringify(data);

            // truncate this file
            fs.ftruncate(fileDescriptor,function(err){
                if(!err){

                    // write to file and close it
                    fs.writeFile(fileDescriptor,stringData,function(err){
                        if(!err){
                            fs.close(fileDescriptor,function(err){

                                if(!err){
                                    callback(false);
                                }else{
                                    callback('Error closing file');
                                }
                            });
                           
                        }else{
                            callback('Error writting tot an existing file');
                        }
                    });
                }else{
                    callback('Eror truncating file');
                }
            });

        }else{
            console.log('could not open this file for updating, it may not exist yet')
        }

    });
}

lib.delete = function(dir,file,callback){

    fs.unlink(lib.baseDir+dir+'/'+file+'.json',function(err){

        if(!err){
            callback(false);
        }else{
            callback('500',{'Error':'Error delete a file'});
        }

    })

}

// list all the items in the directory
lib.list =function(dir,callback){

    fs.readdir(lib.baseDir+dir+'/',function(err,Data){


        if(!err){
            
            var trimmedFileNames = [];
            Data.forEach(function(fileName){
                trimmedFileNames.push(fileName.replace('.json',''));
            });

            callback(false,trimmedFileNames);
        }else{

            callback(err,data);

        }
    });


}


// menu
lib.menu = {
    '1':{'item': 'CAPRESE (Mushrooms,Spinach)',
        'price': '20'
    },
   '2':{
        'item': 'VISTA (MInce, Chilli Sauce,Onions)',
        'price': '30'
    },
    '3':{
        'item': 'GERONI',
        'price': '50'
    },
    '4':{
        'item': 'TIRI (Fela Cheese)',
        'price': '40'
    },
    '5':{
        'item': 'REGINA (Mushrooms)',
        'price': '30'
    }
}

 // Export the module
 module.exports = lib;
