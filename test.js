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
    
    
    // ---------------- insert data test--------------------------
    
    //extractorModule.initDatalake('globalRootID');
    
    //extractorModule.readGlobalRootID('globalRootID');
    
    //console.log(extractorModule.globalRootID);
    //extractor.addFile('./test-data/de.1.clubs.json', 'file-1');
    //extractor.addFile('./test-data/1-bundesliga.csv', 'file-2');
    
    //--------------------------------------------------------------
    
    
    //-------------- search test ---------------------------
    var linkerModule = require('./linker.js');
    var linker = new linkerModule.Linker();
    
    linker.searchQuery(['Borussia Dortmund'], function(result) {
        
        //var keys = [result[0]["node_id"], result[1]["node_id"]];
        //var keys = [result[0][0]["node_id"], result[1][13]["node_id"]];
        
        
        /////////////
        var searchEngineModule = require("./SearchEngine.js");
        var searchEngine = new searchEngineModule.SearchEngine();
        searchEngine.StartConnection();

        searchEngine.Search([result[0][0]["node_id"]], function (searchResult) {
            
            //console.log(searchResult.size);
        	
            searchResult.connectMap.forEach(function(value, key) {

                //var buff = new Buffer(key,'binary');
                //process.stdout.write(buff.toString('hex') + " = \n");
                //process.stdout.write(key + " = " + tagMap[key] + "\n");
                process.stdout.write(key + " : = " + searchResult.tagMap.get(key) + "\n");

                value.forEach(function(value) {
                    // var buff = new Buffer(value,'binary');
                    // process.stdout.write("---->" + buff.toString('hex') + "\n");
                    process.stdout.write("---->" + value + " : = " + searchResult.tagMap.get(value) + "\n");
                });

            }, searchResult);

            process.stdout.write("nearest common parent ID: " + searchResult.nearestCommonParentID +"\n");
            process.stdout.write("tree root node ID: " + searchResult.treeRootID +"\n");
			process.stdout.write("total edge number: " + searchResult.totalEdgeNumber +"\n");
			
            searchEngine.EndConnection();
        });
    });

    
    
    
    
})();