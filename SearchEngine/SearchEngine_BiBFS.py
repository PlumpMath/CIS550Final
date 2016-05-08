import sys
import MySQLdb

class SearchEngine:
    """ Search engine for keywords searching"""
    # connect map temp
    connectMap = {"1": {"2", "3"},
                  "2": {"1"},
                  "3": {"1", "4"},
                  "4": {"3", "7", "10"},
                  "5": {"6", "7", "13"},
                  "6": {"5"},
                  "7": {"5", "4", "10"},
                  "8": {"9", "10", "11"},
                  "9": {"8"},
                  "10": {"8", "7", "4"},
                  "11": {"8", "12"},
                  "12": {"11", "13"},
                  "13": {"5", "12"}}

    valueMap =   {"1": "file1",
                  "2": "B",
                  "3": "team2",
                  "4": "A",
                  "5": "file2",
                  "6": "E",
                  "7": "A",
                  "8": "file3",
                  "9": "D",
                  "10": "A",
                  "11": "season",
                  "12": "C",
                  "13": "C"}

    def __init__(self):
        self.nodeIDs_1 = {}
        self.nodeIDs_2 = {}

        self.db = MySQLdb.connect('datalake550.chyq7der4m33.us-east-1.rds.amazonaws.com',
                                  'shrekshao',
                                  '12345678',
                                  'datalake550')
        self.cursor = self.db.cursor()
        # print "connect with database"

    def DisconnectDatabase(self):
        self.db.close()
        # print "close database connection"

    def GetExpansionList(self, root):

        expansionList = set()
        sql = "select node_id_1 from edge2 where node_id_2 = '%s'" % root
        self.cursor.execute(sql)
        data = self.cursor.fetchall()
        for row in data:
            expansionList.add(row[0])

        sql = "select node_id_2 from edge2 where node_id_1 = '%s'" % root
        self.cursor.execute(sql)
        data = self.cursor.fetchall()
        for row in data:
            expansionList.add(row[0])

        return expansionList

        # return self.connectMap[root]

    def GetNodeValue(self, nodeID):
        sql = "select value from vertex2 where node_id = '%s'" % nodeID
        self.cursor.execute(sql)
        data = self.cursor.fetchall()
        if len(data) == 1:
            return data[0][0]
        else:
            return self.valueMap[nodeID]


    def PrintPathInfo(self, p):
        print "========================================="
        for node in p:
            print "id:", node["id"], " value:", node["value"]
        print ""

    def SearchPath(self, nodeIDs_1, nodeIDs_2):

        if len(nodeIDs_1) > len(nodeIDs_2):
            self.nodeIDs_1 = nodeIDs_1
            self.nodeIDs_2 = nodeIDs_2
        else:
            self.nodeIDs_1 = nodeIDs_2
            self.nodeIDs_2 = nodeIDs_1

        # return self.SearchStartFromNode('ff240a1cef4f40e3bcc1c5e85cd15657')

        # '''
        resultPaths = []
        for startId in self.nodeIDs_1:
            result = self.SearchStartFromNode(startId)
            if result is not None:
                # self.PrintPathInfo(result)
                resultPaths.append(result)

            # else:
                # print "not found", startId

        return resultPaths
        # '''


    def CreateSearchNode(self, nodeId, nodeValue, prev):
        return {"id": nodeId, "value": nodeValue, "prev": prev}

    def CreatePathNode(self, nodeId, nodeValue):
        return {"id": nodeId, "value": nodeValue}


    def SearchStartFromNode(self, root):
        hashNode = set()
        for id in self.nodeIDs_1:
            hashNode.add(id)

        queue = list()
        queue.append(self.CreateSearchNode(root, self.GetNodeValue(root), -1))

        head = 0

        while head < len(queue):
            expansionList = self.GetExpansionList(queue[head]["id"])
            for newID in expansionList:
                if newID not in hashNode:
                    hashNode.add(newID)
                    queue.append(self.CreateSearchNode(newID, self.GetNodeValue(newID), head))

            if queue[head]["id"] in self.nodeIDs_2:
                resultPath = []
                tmp = head

                while tmp != -1:
                    resultPath.append(self.CreatePathNode(queue[tmp]["id"], queue[tmp]["value"]))
                    tmp = queue[tmp]["prev"]

                resultPath.reverse()
                return resultPath

            head += 1

        return None