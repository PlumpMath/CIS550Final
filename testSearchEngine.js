TestSearchKeyword();

function TestArraySort()
{
	var tmp = new Array();
	tmp.push({key:11,attr:"XXX"});
	tmp.push({key:1,attr:"qq"});
	tmp.push({key:4,attr:"d"});
	tmp.push({key:6,attr:"c"});

	tmp.sort(function(a,b){
		if(a.key < b.key)
			return -1;
		if(a.key > b.key)
			return 1;
		return 0;
	});

	tmp.forEach(function(value){
		console.log(value.key +"->"+value.attr);
	});
}

function TestSearchKeyword()
{
    var extractorModule = require('./extractor.js');
    var extractor = new extractorModule.Extractor();

    //-------------- search test ---------------------------
    var linkerModule = require('./linker.js');
    var linker = new linkerModule.Linker();
    
    linker.searchQuery(['Borussia Dortmund','Hannover 96'], function(result) {
        
        //var keys = [result[0]["node_id"], result[1]["node_id"]];
        //var keys = [result[0][0]["node_id"], result[1][13]["node_id"]];
        
        
        /////////////
        var searchModule = require("./SearchEngine.js");
        var search = new searchModule.Search();
        search.StartConnection();

        search.SearchQuery(result, function (searchResult) {
            
            process.stdout.write("=================================\nFinal Length:" + searchResult.length +"\n");
        	
   //          searchResult.connectMap.forEach(function(value, key) {

   //              //var buff = new Buffer(key,'binary');
   //              //process.stdout.write(buff.toString('hex') + " = \n");
   //              //process.stdout.write(key + " = " + tagMap[key] + "\n");
   //              process.stdout.write(key + " : = " + searchResult.tagMap.get(key) + "\n");

   //              value.forEach(function(value) {
   //                  // var buff = new Buffer(value,'binary');
   //                  // process.stdout.write("---->" + buff.toString('hex') + "\n");
   //                  process.stdout.write("---->" + value + " : = " + searchResult.tagMap.get(value) + "\n");
   //              });

   //          }, searchResult);

   //          process.stdout.write("nearest common parent ID: " + searchResult.nearestCommonParentID +"\n");
   //          process.stdout.write("tree root node ID: " + searchResult.treeRootID +"\n");
			// process.stdout.write("total edge number: " + searchResult.totalEdgeNumber +"\n");
			
            search.EndConnection();
        });
    });

}

function TestSearchEngine()
{
	var keys = new Array();
	keys.push(8);
	keys.push(4);
	keys.push(7);
	// keys.push(4);

	var searchEngineModule = require("./SearchEngine.js");
	var searchEngine = new searchEngineModule.SearchEngine();

	searchEngine.Search(keys,function (searchResult) {
		

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

		searchEngine.EndConnection();
	});

}

