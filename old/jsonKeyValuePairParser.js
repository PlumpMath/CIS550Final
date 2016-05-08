(function(){
    
    
    
    var extractorModule = require('./extractor.js');
    var extractor = new extractorModule.Extractor();
    
    //var uuid = require('node-uuid');
    
    
    
    extractor.extractJsonFromFile("./test-data/de.1.clubs.json", function(json, rootString) {
        extractor.jsonKeyValuePairParser(json, rootString, function(key, value, nodeString, nodeID, parentID, isLeaf) {
            //console.log(nodeString);
            //var nodeID = uuid.v4();
            
            console.log(nodeID);
            
            if ( isLeaf ) {
                console.log('   leaf - ', key, ': ', value);
                // TODO: insert this node as a record to MySQL
            } else {
                // needs two level to confirm uniqueness on same level?
                console.log(key, ':', key);
                
                // TODO: insert this node as a record to MySQL
            }
        });
        
        //jkvp(json);
    });
})();


