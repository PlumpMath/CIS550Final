module.exports = {
//var extractJsonFromFile = extractJsonFromFile || {};
//var Extractor = Extractor || {};

    //globalRootID : new Buffer(16),
    globalRootID : '',


    readGlobalRootID : function (globalRootIDFilename) {
        var fs = require('fs');
        fs.readFile(globalRootIDFilename, 'utf-8', function(err, data) {
            if(!err) {
                module.exports.globalRootID = data;
                console.log(module.exports.globalRootID);
            }
        });
    },

    initDatalake : function (globalRootIDFilename) {
        var uuid = require('node-uuid');
        // insert the global RootID to the vertex table
        //uuid.v4(null, module.exports.globalRootID, 0);
        
        module.exports.globalRootID = uuid.v4();
        //console.log(module.exports.globalRootID);
        module.exports.globalRootID = module.exports.globalRootID.replace(/-/g,'');

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
                    ,'parent_id': null
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

    // insertSQL : function (table, row) {
        
    // }
    // ,

    // deleteSQL : function (table, row) {
        
    // }
    // ,

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
            
            //var nodeID = new Buffer(16);
            //uuid.v4(null, nodeID, 0);
            var nodeID = (uuid.v4()).replace(/-/g,'');;
            
            if (typeof json == 'object') {
                // json object
                nodeOperationCallback(json, nodeString, nodeID, parentID, false);
                for (var key in json) {
                    value = json[key];
                    //var nodeStringNew = nodeString + '/' + key;
                    var nodeStringNew = key;

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
                            // if ( !isLeaf ) {
                            //     // insert this node as a record to MySQL
                                
                            //     vertex = {
                            //         'node_id': nodeID
                            //         ,'parent_id': parentID
                            //         ,'value': nodeString
                            //         ,'is_leaf': false
                            //         ,'file_id': fileID
                            //     };
                                
                            // } else {
                            //     // insert this node as a record to MySQL
                                
                            //     vertex = {
                            //         'node_id': nodeID
                            //         ,'parent_id': parentID
                            //         ,'value': value
                            //         ,'is_leaf': true
                            //         ,'file_id': fileID
                            //     };
                                
                            //     // TODO: update invertex index in mongodb
                            // }
                            
                            
                            vertex = {
                                'node_id': nodeID
                                ,'parent_id': parentID
                                ,'value': isLeaf ? value : nodeString
                                ,'is_leaf': isLeaf
                                ,'file_id': fileID
                            };
                            
                            // update Inverted Index
                            function updateInvertedIndex(db, leaf, callback) {
                                if(!leaf) {
                                    callback();
                                } else {
                                    db.collection('inverted_index').update(
                                        {'_id' : value},
                                        {$push : {'node_ids': nodeID}},
                                        {upsert: true},
                                        function(err, object)
                                        {
                                            if(err) throw err;
                                            
                                            callback();
                                        }
                                    );
                                }
                                
                            };
                            
                            // use keyword find all nodeID
                            function findNodeIDWithKeyword(db, leaf, callback) {
                                if(!leaf) {
                                    callback();
                                } else {
                                    var cursor = db.collection('inverted_index').find(
                                        {'keyword' : value}
                                    );
                                    
                                    cursor.each(function(err, doc){
                                        
                                        if( doc!=null ) {
                                            // for each in this array
                                            // TODO : connect each nodeID in the list with this nodeID
                                            // insert to edge table
                                            for(i in doc) {
                                                connection.query('INSERT INTO edge SET ?', 
                                                {'node_id_1': nodeID, 'node_id_2': doc[i]},
                                                function(err, result){
                                                    //TODO
                                                    if(err) throw err;
                                                });
                                            }
                                        }
                                        
                                        
                                        callback(/* somthing */);
                                    });
                                }
                            }
                            
                            
                            connection.query('INSERT INTO vertex SET ?', vertex, function(err, result){
                                //TODO
                                if(err !== null) {
                                    console.log('Inserting: ---log: ', vertex, err, result);
                                } else {
                                    
                                    // insert parent-child edge
                                    if (typeof parentID !== 'undefined'
                                        && parentID != module.exports.globalRootID) {
                                        var edgeNodes = {'node_id_1': parentID, 'node_id_2': nodeID};
                                        //insertQuery = mysql.format(insertQuery, edgeNodes);
                                        connection.query('INSERT INTO edge SET ?', edgeNodes, function(err, result){
                                            //TODO
                                            if(err) throw err;
                                        });
                                        
                                    }
                                    
                                    
                                }
                                
                            });
                            
                            
                            // insert edge connecting nodes sharing the same keyword
                            mongoClient.connect('mongodb://localhost:27017/datalake', function(err, db) {
                                if(err) throw err;
                                
                                findNodeIDWithKeyword(db, isLeaf, function(nodeIDs){
                                    for (i in nodeIDs) {
                                        //var edge = ;
                                        
                                        connection.query('INSERT INTO edge SET ?', 
                                        {'node_id_1': nodeID, 'node_id_2': nodeIDs[i]},
                                        function(err, result){
                                            //TODO
                                            if(err) throw err;
                                        });
                                    }
                                });
                                
                                updateInvertedIndex(db, isLeaf, function(){});
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
        
        
        
        this.deleteFile = function (filename, file_id) {
            // Select from vertex where file = filename (id?)
            // and delete these records
            
            // TODO
            
            // temp test
            var connection = mysql.createConnection({
                host     : 'datalake550.chyq7der4m33.us-east-1.rds.amazonaws.com',
                user     : 'shrekshao',
                password : '12345678',
                database : 'datalake550'
            });
            
            
            connection.connect(function(err) {
                if(!err) {
                    console.log("Database is connected ... nn");  
                    
                    
                    /*
                    SELECT * FROM vertex WHERE 
                     */
                    
                    var vertices = {file_id : file_id};
                    connection.query('SELECT * FROM vertex WHERE ?', vertices, function(err, rows, fields) {
                        if (err) {
                            throw err;
                        }
                        
                        var deleteEdgeSQL = '';
                        
                        var deleteVertexSQL = '';
                        
                        for (i in rows) {
                            
                            // 1. delete related edge (might fail because foreign key?)
                            
                            // 2. update inverted index in mongodb
                            
                            // 3. delete itself
                            
                            // TODO: build each SQL
                            // append a series of OR nodeID=xxx
                            
                            
                            
                            // var deleteEdgeSQL = 'DELETE FROM vertex WHERE node_id_2=' + connection.escape();
                            // connection.query(deleteEdgeSQL, function(err, res) {
                            //     if(err) throw err;
                                
                            //     conncection
                            // });
                        }
                        
                        connection.query(deleteEdgeSQL, function(err, result) {
                            if(err) throw err;
                            
                            connection.query(deleteVertexSQL, function(err, result){
                                if(err) throw err;
                                
                                connection.end();
                            });
                            
                        })
                    });
                    
                    
                } else {
                    throw err;
                    //console.log("Error connecting database ... nn");    
                }
            });
            
        };
        
        
        
        
        
        
    }

};
//var extractor = new Extractor();
//extractor.extractJsonFromFile("./1-bundesliga.csv", function(json){console.log(json);});
//extractor.extractJsonFromFile("./de.1.clubs.json", function(json){console.log(json);});
//extractor.extractJsonFromFile("./example.xml", function(json){console.dir(json);});