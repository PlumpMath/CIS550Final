module.exports = {

	SearchEngine : function()
	{
		//connections
		var mysql;
		var connection;

		var finishedKeys;
		var numberOfKeys;

		var keys; // search keys
		var connectMap; // tree connect list of node
		var tagMap;	   // node tag map

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

			connection  = mysql.createConnection({
			    host     : 'datalake550.chyq7der4m33.us-east-1.rds.amazonaws.com',
			    user     : 'shrekshao',
			    password : '12345678',
			    database : 'datalake550'
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

			var sql = "select parent_id, value from vertex where node_id = ?";
			connection.query(sql, [root], 
				function(err, rows, fields) {
					if(err) throw err;

					tagMap.set(root, rows[0].value);
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
				nearestCommonParentID : nearestCommonParentID,
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
		//connections
		var mysql;
		var connection;

		//
		this.StartConnection = StartConnection;
		this.EndConnection = EndConnection;
		this.SearchQuery = SearchQuery;

		function StartConnection()
		{
			mysql 		= require('mysql');

			connection  = mysql.createConnection({
			    host     : 'datalake550.chyq7der4m33.us-east-1.rds.amazonaws.com',
			    user     : 'shrekshao',
			    password : '12345678',
			    database : 'datalake550'
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

			if(result.length == 1)
			{
				for(var i=0;i<result[0].length;i++)
				{
					//console.log	("single search");
					var searchEngine = new module.exports.SearchEngine();
					searchEngine.Init(connection);

					searchEngine.SearchKeys([result[0][i]["node_id"]], function(result_keys){

						PrintSearchResult(result_keys);

						rankedResult.push(result_keys);
						if(rankedResult.length == result[0].length)
						{
							rankedResult.sort(function(a,b){
									return a.totalEdgeNumber - b.totalEdgeNumber;
							});
							cb(rankedResult);
						}

					});
				}
			}
			else if(result.length == 2)
			{
				for(var i=0;i<result[0].length;i++)
					for(var j=0;j<result[1].length;j++)
					{
						//console.log("double search");
						var searchEngine = new module.exports.SearchEngine();
						searchEngine.Init(connection);

						searchEngine.SearchKeys([result[0][i]["node_id"],result[1][j]["node_id"]], function(result_keys){

							PrintSearchResult(result_keys);

							rankedResult.push(result_keys);
							if(rankedResult.length == result[0].length * result[1].length)
							{
								rankedResult.sort(function(a,b){
									return a.totalEdgeNumber - b.totalEdgeNumber;
								});
								cb(rankedResult);
							}

						});
					}
			}
		}


	}
};