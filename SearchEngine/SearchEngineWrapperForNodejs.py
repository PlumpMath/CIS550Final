
from SearchEngine_BiBFS import SearchEngine
import sys
import json

# parse input from node.js
argv = str(sys.argv)

# replace useless chars
argv = argv.replace("\'", "")
argv = argv.replace("[", "")
argv = argv.replace("]", "")

# split to list by ", "
argv = list(argv.split(", "))

# get node_is list
nodeList = []
for index in [1,2]:
    nodeList.append(argv[index].split(','))

# call SearchEngine
searchEngine = SearchEngine()
paths = searchEngine.SearchPath(nodeList[0], nodeList[1])
searchEngine.DisconnectDatabase()

# print result as JSON, received by node.js script
print json.dumps(paths)
