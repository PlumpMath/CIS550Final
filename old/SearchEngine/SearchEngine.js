module.exports = {

	SearchEngine : function()
	{
		const envvar = require('envvar');

		//connections
		var mysql;
		var connection;

		var finishedKeys;
		var numberOfKeys;

		var keys; // search keys
		var connectMap; // tree connect list of node
		var tagMap;	   // node tag map
		var fileMap;  //file id map

		//var containedKeysMap;  // for finding nearest common parent node
		var treeRootID;  	// search result -> tree root id
		var nearestCommonParentID; 

		var callback;
		var totalEdgeNumber;

		this.SearchKeys = SearchKeys;
		this.Init = Init;

		//this.EndConnection = EndConnection;
		//this.StartConnection = StartConnection;

		function StartConnection()
		{
			mysql 		= require('mysql');

			// connection  = mysql.createConnection({
			//     host     : 'datalake550.chyq7der4m33.us-east-1.rds.amazonaws.com',
			//     user     : 'shrekshao',
			//     password : '12345678',
			//     database : 'datalake550'
			// });
			connection  = mysql.createConnection({
			    host     : envvar.string('MYSQL_HOST'),
			    user     : envvar.string('MYSQL_USER'),
			    password : envvar.string('MYSQL_PASSWORD'),
			    database : envvar.string('MYSQL_DB')
			});

			connection.connect();
		}

		function Init(_connection)
		{
			connection = _connection;
		}

		function SearchKeys(_keys, cb)
		{
			keys = _keys;
			finishedKeys = 0;
			numberOfKeys = keys.length;
			connectMap = new Map();
			tagMap = new Map();
			fileMap = new Map();

			//containedKeysMap = new Map();
			nearestCommonParentID = -1;

			if(cb != undefined)
				callback = cb;

			totalEdgeNumber = 0;

			for(var i=0;i<keys.length;i++)
			{
				SearchOneKey(keys[i]);
			}
		}

		function SearchOneKey(root)
		{

			var sql = "select parent_id, value, file_id from vertex where vertex_id = ?";
			connection.query(sql, [root], 
				function(err, rows, fields) {
					if(err) throw err;

					tagMap.set(root, rows[0].value);
					fileMap.set(root, rows[0].file_id);

					// if(containedKeysMap.has(root) == false);
					// 	containedKeysMap.set(root, 1);

					if(rows[0].parent_id == null)
					{
						finishedKeys ++;
						if(numberOfKeys == finishedKeys)
						{
							treeRootID = root;
							
							AfterGetAllEdges();
						}
					}
					else // have parent
					{
						// update contained node number
						// if(containedKeysMap.has(rows[0].parent_id) == false)
						// {
						// 	containedKeysMap.set(rows[0].parent_id, 1);
						// }
						// else
						// {
						// 	var newKeysNumber = containedKeysMap.get(root) + containedKeysMap.get(rows[0].parent_id);
						// 	containedKeysMap.set(rows[0].parent_id, newKeysNumber);
						// }

						// update connect map
						if(connectMap.has(rows[0].parent_id) == false)
						{
							var newSet = new Set();
							newSet.add(root);
							connectMap.set(rows[0].parent_id, newSet);
							totalEdgeNumber ++ ;
						}
						else
						{
							var nodeSet = connectMap.get(rows[0].parent_id);
							if(nodeSet.has(root) == false)
							{
								totalEdgeNumber++;
								nodeSet.add(root);
								connectMap.set(rows[0].parent_id,nodeSet);
							}
						}

						SearchOneKey(rows[0].parent_id);

					}

				});
		}

		function AfterGetAllEdges()
		{

			//process.stdout.write("\n");

			// connectMap.forEach(function(value, key) {

			// 	//var buff = new Buffer(key,'binary');
		 	//	//process.stdout.write(buff.toString('hex') + " = \n");
			// 	//process.stdout.write(key + " = " + tagMap[key] + "\n");
			// 	process.stdout.write(key + " = \n");

			//  value.forEach(function(value) {
			//  	// var buff = new Buffer(value,'binary');
			// 	  	// process.stdout.write("---->" + buff.toString('hex') + "\n");
			// 	  	process.stdout.write("---->" + value + " = " + tagMap[value] + "\n");
			// 	});

			// }, connectMap);

			FindNearestCommonParentID(treeRootID);
			GetEdgeNumber();

			var searchResult = 
				{
				connectMap : connectMap,
				tagMap : tagMap,
				fileMap : fileMap,
				//nearestCommonParentID : nearestCommonParentID,
				treeRootID : treeRootID,
				totalEdgeNumber : totalEdgeNumber
				};

			callback(searchResult);

			//connection.end();
		}

		function FindNearestCommonParentID(root)
		{
			var result = 0;

			for(var i=0;i<keys.length;i++)
				if(keys[i] == root)
				{
					result = 1;
					break;
				}

			var children = connectMap.get(root);
			if(children != undefined)
			{
				children.forEach(function(value){
					result += FindNearestCommonParentID(value);
				});
			}
			else
			{
				//console.log(root , " has no children");
			}

			if(result == keys.length && nearestCommonParentID == -1)
			{
				nearestCommonParentID = root;
			}

			return result;
		}

		function GetEdgeNumber()
		{
			var ncpToRoot = 0;
			var tempNodeID = treeRootID;
			while(tempNodeID != nearestCommonParentID)
			{
				ncpToRoot ++;
				//console.log(tempNodeID);
				tempNodeID = connectMap.get(tempNodeID).values().next().value;
			}
			totalEdgeNumber = totalEdgeNumber - ncpToRoot;
		}

		function EndConnection()
		{
			connection.end();
		}
	},


	Search : function()
	{
		const envvar = require('envvar');

		//connections
		var mysql;
		var connection;

		//
		this.StartConnection = StartConnection;
		this.EndConnection = EndConnection;
		//this.SearchQuery = SearchQuery;
		this.StartSearch = StartSearch;

		function StartConnection()
		{
			mysql 		= require('mysql');

			// connection  = mysql.createConnection({
			//     host     : 'datalake550.chyq7der4m33.us-east-1.rds.amazonaws.com',
			//     user     : 'shrekshao',
			//     password : '12345678',
			//     database : 'datalake550'
			// });
			connection  = mysql.createConnection({
			    host     : envvar.string('MYSQL_HOST'),
			    user     : envvar.string('MYSQL_USER'),
			    password : envvar.string('MYSQL_PASSWORD'),
			    database : envvar.string('MYSQL_DB')
			});

			connection.connect();
		}

		function EndConnection()
		{
			connection.end();
		}

		function PrintSearchResult(result_keys)
		{
			console.log("-------------------------------------------------");
			result_keys.connectMap.forEach(function(value, key) {


            process.stdout.write(key + " : = " + result_keys.tagMap.get(key) + "\n");
            value.forEach(function(value) {
                // var buff = new Buffer(value,'binary');
                // process.stdout.write("---->" + buff.toString('hex') + "\n");
                process.stdout.write("---->" + value + " : = " + result_keys.tagMap.get(value) + "\n");
            });
        	}, result_keys);

       		process.stdout.write("nearest common parent ID: " + result_keys.nearestCommonParentID +"\n");
        	process.stdout.write("tree root node ID: " + result_keys.treeRootID +"\n");
			process.stdout.write("total edge number: " + result_keys.totalEdgeNumber +"\n");
		}

		function SearchQuery(result,cb)
		{
			var rankedResult = new Array();

			for(var i=0;i<result.length;i++)
				{
					//console.log	("single search");
					var searchEngine = new module.exports.SearchEngine();
					searchEngine.Init(connection);

					searchEngine.SearchKeys([result[i]["vertex_id"]], function(result_keys){

						// PrintSearchResult(result_keys);

						rankedResult.push(result_keys);
						if(rankedResult.length == result.length)
						{
							rankedResult.sort(function(a,b){
									return a.totalEdgeNumber - b.totalEdgeNumber;
							});
							cb(rankedResult);
						}

					});
				}

			// if(result.length == 1)
			// {
			// 	for(var i=0;i<result[0].length;i++)
			// 	{
			// 		//console.log	("single search");
			// 		var searchEngine = new module.exports.SearchEngine();
			// 		searchEngine.Init(connection);

			// 		searchEngine.SearchKeys([result[0][i]["vertex_id"]], function(result_keys){

			// 			// PrintSearchResult(result_keys);

			// 			rankedResult.push(result_keys);
			// 			if(rankedResult.length == result[0].length)
			// 			{
			// 				rankedResult.sort(function(a,b){
			// 						return a.totalEdgeNumber - b.totalEdgeNumber;
			// 				});
			// 				cb(rankedResult);
			// 			}

			// 		});
			// 	}
			// }
			// else if(result.length == 2)
			// {
			// 	for(var i=0;i<result[0].length;i++)
			// 		for(var j=0;j<result[1].length;j++)
			// 		{
			// 			//console.log("double search");
			// 			var searchEngine = new module.exports.SearchEngine();
			// 			searchEngine.Init(connection);

			// 			searchEngine.SearchKeys([result[0][i]["vertex_id"],result[1][j]["vertex_id"]], function(result_keys){

			// 				// PrintSearchResult(result_keys);

			// 				rankedResult.push(result_keys);
			// 				if(rankedResult.length == result[0].length * result[1].length)
			// 				{
			// 					rankedResult.sort(function(a,b){
			// 						return a.totalEdgeNumber - b.totalEdgeNumber;
			// 					});
			// 					cb(rankedResult);
			// 				}

			// 			});
			// 		}
			// }
		}

		function StartSearch(result, cb)
		{
			//var rankedResult = new Array();
		
			if(result.length == 1)
			{
				StartConnection();
		        //console.log(result);

		        SearchQuery(result[0], function (searchResult) {
		            
		            //console.log(searchResult);
		            //rankedResult = searchResult;

		            var parsedResult = [];
		            for(var i=0;i<searchResult.length;i++)
		            {
		            	path = [];
		            	var connectMap = searchResult[i]["connectMap"];
		            	var valueMap = searchResult[i]["tagMap"];
		            	var fileMap = searchResult[i]["fileMap"];
		            	var rootID = searchResult[i]["treeRootID"];

		            	while(rootID != undefined)
		            	{
		            		path.push( {"vertex_id" : rootID, 
		            				    "value"     : valueMap.get(rootID),
		            				    "file_id"	: fileMap.get(rootID) } );

		            		var children = connectMap.get(rootID);
		            		//console.log(children);
		            		if(children == undefined)
		            			rootID = undefined;
		            		else
		            		{
		            			children = Array.from(children);
		            			rootID = children[0];
		            		}
		            	}

		            	path.reverse();
		            	parsedResult.push(path);
		            }

		            cb(parsedResult);

		            EndConnection();
		        });
	    	}
	    	else if(result.length == 2)
	    	{
	    		if(result[0].length == 0 || result[1].length == 0)
	    		{
	    			cb([]);
	    		}
	    		else
	    		{
		    		var nodelist = [];
		    		for(var i=0;i<result.length;i++)
			        {
			            var tmp = [];
			            for(var j=0;j<result[i].length;j++)
			            {
			                tmp.push(result[i][j]["vertex_id"]);
			            }
			            nodelist.push(tmp);
			        }
			        CallSearchBidirectionalBFS(nodelist, cb);
		    	}
	    	}
	    	else
	    	{
	    		cb([]);
	    	}

		}

		function CallSearchBidirectionalBFS(nodelist, cb)
		{
		    var pythonShell = require('python-shell');

		    var options = {
		        mode: 'text',
		        args: nodelist
		    };

		    pythonShell.run('./old/SearchEngine/SearchEngineWrapperForNodejs.py', options, function(err, result){
		        if(err) throw err;

		        var obj = JSON.parse(result);
		        //console.log(obj);
		        //var jsonfile = require('jsonfile')
		        //var file = './data.json'
		        //jsonfile.writeFile(file, obj)
		        // console.log(result);
		        //console.log("pass number:", obj.length);
		        var parsedResult = [];

		        for(var i=0;i<obj.length;i++)
		        {
		        	parsedResult.push(obj[i]);
		        }

		        cb(parsedResult);
		    });
		}


	}
};