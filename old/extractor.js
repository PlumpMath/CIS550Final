var fs = require("fs");
var csv2JsonConverter = require("csvtojson").Converter;
var xml2JsonParseString = require("xml2js").parseString;

var uuid = require('node-uuid');
var path = require('path');
var mysql = require('mysql');
// var mongoClient = require('mongodb').MongoClient;

var Promise = require('bluebird');

//var Vertex = require('../app/models/Vertex.js');
const mongoose = require('mongoose');
const User = mongoose.model('User')
const File = mongoose.model('File')
const InvertedIndex = mongoose.model('InvertedIndex')
const MySQL = require('../app/models/MySQL');


module.exports = {
//var extractJsonFromFile = extractJsonFromFile || {};
//var Extractor = Extractor || {};

    //globalRootID : new Buffer(16),
    //globalRootID : '',


    // readGlobalRootID : function (globalRootIDFilename) {
    //     var fs = require('fs');
    //     fs.readFile(globalRootIDFilename, 'utf-8', function(err, data) {
    //         if(!err) {
    //             module.exports.globalRootID = data;
    //             console.log(module.exports.globalRootID);
    //         }
    //     });
    // },

    // initDatalake : function (globalRootIDFilename) {
    //     var uuid = require('node-uuid');
    //     // insert the global RootID to the vertex table
    //     //uuid.v4(null, module.exports.globalRootID, 0);
        
    //     module.exports.globalRootID = uuid.v4();
    //     //console.log(module.exports.globalRootID);
    //     module.exports.globalRootID = module.exports.globalRootID.replace(/-/g,'');

    //     console.log(module.exports.globalRootID);
    //     // TODO: store global root id in a file somewhere
        
    //     var fs = require('fs');
    //     fs.writeFile(globalRootIDFilename, module.exports.globalRootID);
        
        
    //     // // var id = module.exports.globalRootID;
        
    //     // temp connection
    //     // temp test
    //     var mysql = require('mysql');
    //     var connection = mysql.createConnection({
    //         host     : 'datalake550.chyq7der4m33.us-east-1.rds.amazonaws.com',
    //         user     : 'shrekshao',
    //         password : '12345678',
    //         database : 'datalake550'
    //     });
        
    //     connection.connect(function(err) {
    //         if(!err) {
    //             var root = {
    //                 'node_id': module.exports.globalRootID
    //                 ,'parent_id': null
    //                 ,'value': 'datalake-root'
    //                 ,'is_leaf': false
    //                 ,'file_id': 'root'
    //             };
    //             connection.query('INSERT INTO vertex SET ?', root, function(err, result){
    //                 if(err) {
    //                     throw err;
    //                 }                    
    //             });
                
    //             connection.end();
    //         } else {
    //             throw err;
    //         }
    //     });
        
    // }
    // ,

    Extractor : function () {

        var connection;

        function initConnection(conn) {
            connection = conn;
        }
        
         
        
        var extractJsonFromFile = function (url, bucket, fileKey, onload) {

            // // download the file from S3
            // var s3 = new AWS.S3();
            
            // var params = {Bucket: bucket, Key: fileKey};
            // var file = fs.createWriteStream(url);
            // s3.getObject(params).createReadStream.pipe(file);
            
            
            // extract the file content to json
            var formatName = path.extname(url);
            switch(formatName) {
                case '.csv':
                var converter = new csv2JsonConverter({});
                converter.fromFile(url, function(err, result) {
                    onload(result, url);
                });
                break;
                
                case '.json':
                fs.readFile(url, function(err, data){
                    var json = JSON.parse(data);
                    onload(json, url);
                });
                break;
                
                case '.xml':
                fs.readFile(url, function(err, data){
                    xml2JsonParseString(data, function(err, json){
                        onload(json, url);
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
        this.initConnection = initConnection;
        this.extractJsonFromFile = extractJsonFromFile;
        this.jsonKeyValuePairParser = jsonKeyValuePairParser;
        
        // TODO: 
        // * add file
        // * add file batch
        // * delete file
        // * delete file batch
        
        this.addFile = function(url, bucket, fileKey, fileID) {
            
            var mongooseQueries = [];

            extractJsonFromFile(url, bucket, fileKey, function(json, rootString) {

                jsonKeyValuePairParser(json, rootString, function(value, nodeString, nodeID, parentID, isLeaf) {
                    
                    

                    // // insert to Vertices, Edges
                    // MySQL.Vertex.create({
                    //     'vertex_id': nodeID
                    //     //,'parent_id': parentID
                    //     ,'value': isLeaf ? value : nodeString
                    //     ,'is_leaf': isLeaf
                    //     ,'file_id': fileID

                    //     //,Edge: {'vertex_id_1': nodeID, 'vertex_id_2': parentID}
                    // }).then(function(vertex){
                    //     //MySQL.Edge.create({'vertex_id_1': parentID, 'vertex_id_2': nodeID});
                    //     //vertex.addEdge
                    //     //console.log(vertex);
                    //     vertex.setEdge({'vertex_id_2': parentID});
                    // });


                    // // connect all vertex sharing the same keyword (mongoose search)
                    // //var invertedIndex = mongoose.model('InvertedIndex');

                    // var promise = InvertedIndex.findOne({keyword: value}, 'vertex_ids').exec();

                    // promise.then(function(keyword){
                    //     // insert edges to Edges (mysql)
                    //     var edges = [];

                    //     for (i in keyword.vertex_ids) {
                    //         edges.push(Edge.create({'vertex_id_1': keywords.vertex_ids[i], 'vertex_id_2': nodeID}));
                    //     }
                        
                    //     // update the inverted index (mongodb)

                    // }).then(function(keyword){
                    //     keyword.vertex_ids.push(nodeID);
                    // });


                    //invertedIndex.findOneAndUpdate({keyword:value}, {$push: nodeID}, {new: true, upsert:true});

                    

                    //------------------------------------




                    //------old----------------

                    var vertex;
                    
                    vertex = {
                        'vertex_id': nodeID
                        ,'parent_id': parentID
                        ,'value': isLeaf ? value : nodeString
                        ,'is_leaf': isLeaf
                        ,'file_id': fileID
                    };


                    // // update Inverted Index
                    // function updateInvertedIndex(db, leaf, callback) {

                    //     // db.collection('inverted_index').update(
                    //     //     {'_id' : value},
                    //     //     {$push : {'node_ids': nodeID}},
                    //     //     {upsert: true},
                    //     //     function(err, object)
                    //     //     {
                    //     //         if(err) throw err;
                                
                    //     //         callback();
                    //     //     }
                    //     // );
                        
                    // }

                    // // use keyword find all nodeID
                    // function findNodeIDWithKeyword(db, leaf, callback) {
                    //     var cursor = db.collection('inverted_index').find(
                    //         {'keyword' : value}
                    //     );
                        
                    //     cursor.each(function(err, doc){
                    //         if(err) throw err;
                            
                    //         if( doc!=null ) {
                    //             // for each in this array
                    //             // TODO : connect each nodeID in the list with this nodeID
                    //             // insert to edge table
                    //             console.log(doc);
                                
                    //             for(i in doc) {
                    //                 connection.query('INSERT INTO edge SET ?', 
                    //                 {'vertex_id_1': nodeID, 'vertex_id_2': doc[i]},
                    //                 function(err, result){
                    //                     //TODO
                    //                     if(err) throw err;
                    //                 });
                    //             }
                    //         }
                            
                            
                    //         callback(doc);
                    //     });
                    // }
                    
                    
                    connection.query('INSERT INTO vertex SET ?', vertex, function(err, result){
                        //TODO
                        if(err) throw err;


                        
                    });
                    
                    
                    // insert parent-child edge
                        // if (typeof parentID !== 'undefined'
                        //     && parentID != module.exports.globalRootID) {
                        if( parentID ) {
                            //console.log (parentID);

                            var edgeNodes = {'vertex_id_1':  nodeID, 'vertex_id_2': parentID};
                            //insertQuery = mysql.format(insertQuery, edgeNodes);
                            connection.query('INSERT INTO edge SET ?', edgeNodes, function(err, result){
                                //TODO
                                //console.log(result);
                                if(err) throw err;
                            });
                            
                        }

                        if(isLeaf) {
                            // insert edge connecting nodes sharing the same keyword


                            // TODO: don't add trivial keywords like digital


                            // InvertedIndex.findOneAndUpdate({keyword:value}, {$push: {vertex_ids: nodeID}},{upsert:true}, function(err, doc){
                                

                            //     if(doc) {
                            //         //console.log(doc['keyword']);

                            //         for(i in doc['vertex_ids']) {
                            //             //console.log(doc['vertex_ids'][i]);

                            //             connection.query('INSERT INTO edge SET ?', 
                            //             {'vertex_id_1': nodeID, 'vertex_id_2': doc['vertex_ids'][i]},
                            //             function(err, result){
                            //                 //TODO
                            //                 if(err) throw err;
                            //             });
                            //         }
                            //     }

                                
                            // });

                            var query = InvertedIndex.findOneAndUpdate({keyword:value}, {$push: {vertex_ids: nodeID}},{upsert:true}).exec();
                            query.then(function(err, doc) {
                                if(doc) {
                                    //console.log(doc['keyword']);

                                    for(i in doc['vertex_ids']) {
                                        //console.log(doc['vertex_ids'][i]);

                                        connection.query('INSERT INTO edge SET ?', 
                                        {'vertex_id_1': nodeID, 'vertex_id_2': doc['vertex_ids'][i]},
                                        function(err, result){
                                            //TODO
                                            if(err) throw err;
                                        });
                                    }
                                }
                            });
                            mongooseQueries.push(query);






                                // findNodeIDWithKeyword(db, isLeaf, function(nodeIDs){
                                //     updateInvertedIndex(db, isLeaf, function(){});
                                // });
                                
                        }
                    
                    
                    
                    
                }, null);
            });  

            
            
            // //?
            // app.get("/", function (req, res) {
            //     connection.query('', function(err, result){
                    
            //     });
            //     //connection.end();
            // });


            // for(var j = 0; j < mongooseQueries.length-1; j++) {
            //     mongooseQueries[j].then(function(){mongooseQueries[j+1].exec()});
            // }

            Promise.all(mongooseQueries).then(function(){
                console.log('all query done');
            });
            
        };
        
        
        
        // TODO
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