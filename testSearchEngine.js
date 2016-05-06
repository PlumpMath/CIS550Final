var searchEngineModule = require("./SearchEngine.js");
var searchEngine = new searchEngineModule.SearchEngine();

function test1()
{
	var keys = new Array();
	keys.push(8);
	keys.push(4);
	keys.push(7);
	// keys.push(4);

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
