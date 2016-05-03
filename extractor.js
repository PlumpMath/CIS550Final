module.exports = {
//var extractJsonFromFile = extractJsonFromFile || {};
//var Extractor = Extractor || {};

    

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
        var express = require('express');
        
        
        
        
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
            
            for (var key in json) {
                value = json[key];
                var nodeStringNew = nodeString + '.' + key;
                var nodeID = uuid.v4();     //tmp
                if (typeof value == 'object' && value !== null) {
                    // json object
                    nodeOperationCallback(key, value, nodeStringNew, nodeID, parentID, false);
                    jsonKeyValuePairParser(json[key], nodeStringNew, nodeOperationCallback, nodeID);

                } else {
                    // leaf node
                    
                    nodeOperationCallback(key, value, nodeStringNew, nodeID, parentID, true);
                    
                }
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
        
        this.addFile = function(filename) {
            // var connection = mysql.createConnection({
            //     host     : 'localhost',
            //     user     : 'me',
            //     password : 'secret',
            //     database : 'my_db'
            // });
            
            // var app = express();
            
            // connection.connect(function(err) {
            //     if(!err) {
            //         console.log("Database is connected ... nn");    
            //     } else {
            //         console.log("Error connecting database ... nn");    
            //     }
            // });
            
            
            // //?
            // app.get("/", function (req, res) {
            //     connection.query('', function(err, result){
                    
            //     });
            //     //connection.end();
            // });
            
            
            extractJsonFromFile(filename, function(json, rootString) {
                extractor.jsonKeyValuePairParser(json, rootString, function(key, value, nodeString, nodeID, parentID, isLeaf) {
                    var vertex;
                    if ( isLeaf ) {
                        // insert this node as a record to MySQL
                        
                        vertex = {
                            'node_id': nodeID
                            ,'value': nodeString
                            ,'is_leaf': false
                            ,'file': filename   //? get file id?
                        };
                        
                    } else {
                        // insert this node as a record to MySQL
                        
                        vertex = {
                            'node_id': nodeID
                            ,'value': value
                            ,'is_leaf': true
                            ,'file': filename
                        };
                    }
                    
                    
                    // connection.query('INSERT INTO vertex SET ?', vertex, function(err, result){
                    //     //TODO
                    // });
                    insertSQL('vertex', vertex);
                    
                    // Tinsert edge
                    if (typeof parentID !== 'undefined') {
                        // var edgeNodes = [parentID, nodeID];
                        // var insertQuery = 'INSERT INTO edge (node1,node2) VALUE (??,??);';
                        // insertQuery = mysql.format(insertQuery, edgeNodes);
                        // connection.query(insertQuery, function(err, result){
                        //     //TODO
                        // });
                        
                        var edge = {'parent_id': parentID, 'node_id': nodeID};
                        insertSQL('edge', edge);
                    }
                    
                    // TODO: update
                    // update inverted index on each insert? or timely updated
                    
                });
            });
            
            
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