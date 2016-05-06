module.exports = {
//var extractJsonFromFile = extractJsonFromFile || {};
//var Extractor = Extractor || {};

    globalRootID : new Buffer(16),


    readGlobalRootID : function (globalRootIDFilename) {
        var fs = require('fs');
        fs.readFile(globalRootIDFilename, function(err, data) {
            if(!err) {
                module.exports.globalRootID = data;
                console.log(module.exports.globalRootID);
            }
        });
    },

    initDatalake : function (globalRootIDFilename) {
        var uuid = require('node-uuid');
        // insert the global RootID to the vertex table
        uuid.v4(null, module.exports.globalRootID, 0);

        console.log(module.exports.globalRootID);
        // TODO: store global root id in a file somewhere
        
        var fs = require('fs');
        fs.writeFile(globalRootIDFilename, module.exports.globalRootID);
        
        
        // // var id = module.exports.globalRootID;
        
        // temp connection
        // temp test
        var mysql = require('mysql');
        var connection = mysql.createConnection({
            host     : 'datalake550.chyq7der4m33.us-east-1.rds.amazonaws.com',
            user     : 'shrekshao',
            password : '12345678',
            database : 'datalake550'
        });
        connection.connect(function(err) {
            if(!err) {
                var root = {
                    'node_id': module.exports.globalRootID
                    ,'value': 'datalake-root'
                    ,'is_leaf': false
                    ,'file_id': 'root'
                };
                connection.query('INSERT INTO vertex SET ?', root, function(err, result){
                    if(err) {
                        throw err;
                    }                    
                });
                
                connection.end();
            } else {
                throw err;
            }
        });
        
    }
    ,

    insertSQL : function (table, row) {
        
    }
    ,

    deleteSQL : function (table, row) {
        
    }
    ,

    Extractor : function () {
        var fs = require("fs");
        var csv2JsonConverter = require("csvtojson").Converter;
        var converter = new csv2JsonConverter({});
        var xml2JsonParseString = require("xml2js").parseString;
        var uuid = require('node-uuid');
        var path = require('path');
        var mysql = require('mysql');
        var mongoClient = require('mongodb').MongoClient;
        //var express = require('express');
        
        
        
        
        var extractJsonFromFile = function (filename, onload) {
            var formatName = path.extname(filename);
            switch(formatName) {
                case '.csv':
                converter.fromFile(filename, function(err, result) {
                    onload(result, filename);
                });
                break;
                
                case '.json':
                fs.readFile(filename, function(err, data){
                    var json = JSON.parse(data);
                    onload(json, filename);
                });
                break;
                
                case '.xml':
                fs.readFile(filename, function(err, data){
                    xml2JsonParseString(data, function(err, json){
                        onload(json, filename);
                    });
                });
                break;
                default:
                console.log('Unsupported file format');
                break;
            }
        };
        

        
        var jsonKeyValuePairParser = function (json, nodeString, nodeOperationCallback, parentID) {
            //console.log(json);
            var value;
            
            var nodeID = new Buffer(16);
            uuid.v4(null, nodeID, 0);
            //var nodeID = (uuid.v4()).replace('-','');
            
            if (typeof json == 'object') {
                // json object
                nodeOperationCallback(json, nodeString, nodeID, parentID, false);
                for (var key in json) {
                    value = json[key];
                    var nodeStringNew = nodeString + '/' + key;

                    jsonKeyValuePairParser(json[key], nodeStringNew, nodeOperationCallback, nodeID);

                }
            } else {
                // leaf node
                nodeOperationCallback(json, nodeString, nodeID, parentID, true);
            }
            
            
        };
        
        
        // expose as public for test
        this.extractJsonFromFile = extractJsonFromFile;
        this.jsonKeyValuePairParser = jsonKeyValuePairParser;
        
        // TODO: 
        // * add file
        // * add file batch
        // * delete file
        // * delete file batch
        
        this.addFile = function(filename, fileID) {
            // fileID is a char(24) from mongodb
            
            // temp test
            var connection = mysql.createConnection({
                host     : 'datalake550.chyq7der4m33.us-east-1.rds.amazonaws.com',
                user     : 'shrekshao',
                password : '12345678',
                database : 'datalake550'
            });
            
            // var app = express();
            
            connection.connect(function(err) {
                if(!err) {
                    console.log("Database is connected ... nn");  
                    
                    extractJsonFromFile(filename, function(json, rootString) {
                        jsonKeyValuePairParser(json, rootString, function(value, nodeString, nodeID, parentID, isLeaf) {
                            var vertex;
                            if ( !isLeaf ) {
                                // insert this node as a record to MySQL
                                
                                vertex = {
                                    'node_id': nodeID
                                    ,'value': nodeString
                                    ,'is_leaf': false
                                    ,'file_id': fileID
                                };
                                
                            } else {
                                // insert this node as a record to MySQL
                                
                                vertex = {
                                    'node_id': nodeID
                                    ,'value': value
                                    ,'is_leaf': true
                                    ,'file_id': fileID
                                };
                                
                            }
                            
                            
                            connection.query('INSERT INTO vertex SET ?', vertex, function(err, result){
                                //TODO
                                if(err !== null) {
                                    console.log('Inserting: ---log: ', vertex, err, result);
                                } else {
                                    
                                    // insert edge
                                    if (typeof parentID !== 'undefined') {
                                        var edgeNodes = {'parent_id': parentID, 'child_id': nodeID};
                                        //insertQuery = mysql.format(insertQuery, edgeNodes);
                                        connection.query('INSERT INTO edge SET ?', edgeNodes, function(err, result){
                                            //TODO
                                            if(err !== null) {
                                                console.log('Inserting: ---log: ', edgeNodes, err, result);
                                            } 
                                        });
                                        
                                        //var edge = {'parent_id': parentID, 'child_id': nodeID};
                                        
                                        //insertSQL('edge', edge);
                                    }
                                }
                                
                            });
                            
                            //insertSQL('vertex', vertex);
                            
                            //connection.end();
                            
                            
                            
                            // TODO: update
                            // update inverted index on each insert? or timely updated
                            
                        }, module.exports.globalRootID);
                    });  
                } else {
                    throw err;
                    //console.log("Error connecting database ... nn");    
                }
            });
            
            
            // //?
            // app.get("/", function (req, res) {
            //     connection.query('', function(err, result){
                    
            //     });
            //     //connection.end();
            // });
            
            
            
            
            
            
        
            
        };
        
        
        
        this.deleteFile = function (filename) {
            // Select from vertex where file = filename (id?)
            // and delete these records
            
            // TODO
        };
        
        
        
        
        
        
    }

};
//var extractor = new Extractor();
//extractor.extractJsonFromFile("./1-bundesliga.csv", function(json){console.log(json);});
//extractor.extractJsonFromFile("./de.1.clubs.json", function(json){console.log(json);});
//extractor.extractJsonFromFile("./example.xml", function(json){console.dir(json);});