(function(){
    
    
    
    var extractorModule = require('./extractor.js');
    var extractor = new extractorModule.Extractor();
    
    //var uuid = require('node-uuid');
    
    
    
    extractor.extractJsonFromFile("./test-data/de.1.clubs.json", function(json, rootString) {
        extractor.jsonKeyValuePairParser(json, rootString, function(key, value, nodeString, nodeID, parentID, isLeaf) {
            //console.log(nodeString);
            //var nodeID = uuid.v4();
            
            //console.log(nodeID);
            

            
            // if (typeof parentID !== 'undefined') {
            //     console.log(parentID);
            // }
        });
        
        //jkvp(json);
    });
    
    
    
    extractor.addFile('./test-data/de.1.clubs.json');
    
    
})();