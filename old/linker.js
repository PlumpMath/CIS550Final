var Promise = require('bluebird');

//var Vertex = require('../app/models/Vertex.js');
const mongoose = require('mongoose');
const User = mongoose.model('User')
const File = mongoose.model('File')
const InvertedIndex = mongoose.model('InvertedIndex')
const MySQL = require('../app/models/MySQL');

module.exports = {
    
    
    Linker : function() { 
        var mysql = require('mysql');
        
        // temp
        function getNodeArrayByKeyword(word, onLoaded) {
            // TODO: look up in NoSQL DB inverted index and get a json array of node_id
            
            //var nodes;
            
            // TODO
            
            
            // // temp test version:
            // // without an inverted index
            // // select by use sql to search
            // var connection = mysql.createConnection({
            //     host     : 'datalake550.chyq7der4m33.us-east-1.rds.amazonaws.com',
            //     user     : 'shrekshao',
            //     password : '12345678',
            //     database : 'datalake550'
            // });

            // connection.connect(function(err) {
            //     if(!err) {
            //         var root = {
            //             'vertex_id': module.exports.globalRootID
            //             ,'parent_id': null
            //             ,'value': 'datalake-root'
            //             ,'is_leaf': false
            //             ,'file_id': 'root'
            //         };
                    
            //         var q = 'SELECT vertex_id FROM vertex WHERE is_leaf=TRUE AND value=' + connection.escape(word);
                    
            //         connection.query(q, function(err, result){
            //             if(err) {
            //                 throw err;
            //             } else {
            //                 onLoaded(result);
            //             }
            //             connection.end();               
            //         });
                    
                    
            //     } else {
            //         throw err;
            //     }
            // });

            //console.log(word);
            InvertedIndex.findOne({'keyword': word}, 'vertex_ids', function(err, doc){
                console.log(doc);
                if(err) throw err;

                if(doc) {
                    onLoaded(doc['vertex_ids']);
                } else {
                    onLoaded([]);
                }
            });

            

        }
        
        function searchQuery(wordsArray, callback) {
            
            // TODO: get a list of node for each of the key word
            var n = wordsArray.length;
            var cur = 0;
            
            var nodeIDs = [];
            
            function checkFinish(result) {
                cur += 1;
                nodeIDs.push(result);
                if(cur >= n) {
                    callback(nodeIDs);
                }
            }
            
            for(word in wordsArray) {
                // get the node json array 
                
                // getNodeArrayByKeyword(word, function(nodeIDs) {
                //     // Send it to Route finder
                // });
                
                getNodeArrayByKeyword(wordsArray[word], checkFinish);
            }
            
        }
        
        
        this.getNodeArrayByKeyword = getNodeArrayByKeyword;
        this.searchQuery = searchQuery;
        
        
        // // test
        // getNodeArrayByKeyword('Borussia Dortmund', function(node_ids) {
        //     console.log(node_ids[0]['node_id']);
        // });
    
    }
    
};
