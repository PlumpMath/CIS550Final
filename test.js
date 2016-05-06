(function(){
    
    
    
    var extractorModule = require('./extractor.js');
    var extractor = new extractorModule.Extractor();
    
    //var uuid = require('node-uuid');
    
    
    
    // extractor.extractJsonFromFile("./test-data/de.1.clubs.json", function(json, rootString) {
    //     extractor.jsonKeyValuePairParser(json, rootString, function(value, nodeString, nodeID, parentID, isLeaf) {
    //         console.log(isLeaf ? value : nodeString );
    //         //var nodeID = uuid.v4();
            
    //         //console.log(nodeID);
            

            
    //         // if (typeof parentID !== 'undefined') {
    //         //     console.log(parentID);
    //         // }
    //     });
        
    //     //jkvp(json);
    // });
    
    
    
    //extractorModule.initDatalake('globalRootID');
    
    extractorModule.readGlobalRootID('globalRootID');
    
    //console.log(extractorModule.globalRootID);
    //extractor.addFile('./test-data/de.1.clubs.json', 'file-1');
    //extractor.addFile('./test-data/1-bundesliga.csv', 'file-2');
    
})();