module.exports = {

	SearchEngine : function()
	{
		var mysql 		= require('mysql');

		var connection  = mysql.createConnection({
		    host     : 'datalake550.chyq7der4m33.us-east-1.rds.amazonaws.com',
		    user     : 'shrekshao',
		    password : '12345678',
		    database : 'datalake550'
		});

		connection.connect();

		var finishedKeys;
		var numberOfKeys;

		var keys; // search keys
		var connectMap; // tree connect list of node
		var tagMap;	   // node tag map

		//var containedKeysMap;  // for finding nearest common parent node
		var treeRootID;  	// search result -> tree root id
		var nearestCommonParentID; 

		var callback;


		this.Search = SearchKeys;
		this.EndConnection = EndConnection;

		function SearchKeys(_keys, cb)
		{
			keys = _keys;
			finishedKeys = 0;
			numberOfKeys = keys.length;
			connectMap = new Map();
			tagMap = new Map();
			//containedKeysMap = new Map();
			nearestCommonParentID = -1;

			callback = cb;

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
						}
						else
						{
							var nodeSet = connectMap.get(rows[0].parent_id);
							nodeSet.add(root);
							connectMap.set(rows[0].parent_id,nodeSet);
						}

						// if(nearestCommonParentID == -1 && containedKeysMap.get(rows[0].parent_id) == numberOfKeys)
						// {
						// 	nearestCommonParentID = rows[0].parent_id;
						// }

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

			var searchResult = 
				{
				connectMap : connectMap,
				tagMap : tagMap,
				nearestCommonParentID : nearestCommonParentID,
				treeRootID : treeRootID
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

		function EndConnection()
		{
			connection.end();
		}
	}
};