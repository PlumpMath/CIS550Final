import sys
import os
import MySQLdb

class SearchEngine:
    """ Search engine for keywords searching"""

    MYSQL_HOST = os.environ.get('MYSQL_HOST')
    MYSQL_DB = os.environ.get('MYSQL_DB')
    MYSQL_USER = os.environ.get('MYSQL_USER')
    MYSQL_PASSWORD = os.environ.get('MYSQL_PASSWORD')

    def __init__(self):
        self.nodeIDs_1 = {}
        self.nodeIDs_2 = {}

        #self.db = MySQLdb.connect('datalake550.chyq7der4m33.us-east-1.rds.amazonaws.com',
        #                          'shrekshao',
        #                          '12345678',
        #                          'datalake550')
        self.db = MySQLdb.connect(MYSQL_HOST, MYSQL_USER, MYSQL_PASSWORD, MYSQL_DB)

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


    def GetNodeValue(self, nodeID):
        sql = "select value from vertex2 where node_id = '%s'" % nodeID
        self.cursor.execute(sql)
        data = self.cursor.fetchall()
        if len(data) == 1:
            return data[0][0]
        else:
            return ""


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


        resultPaths = []
        '''
        for startId in self.nodeIDs_1:
            result = self.SearchStartFromNode(startId)
            if result is not None:
                # self.PrintPathInfo(result)
                resultPaths.append(result)

            # else:
                # print "not found", startId

        return resultPaths
        '''
        resultPaths = self.SearchStartFromMultipleNodes()
        return resultPaths


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

    def SearchStartFromMultipleNodes(self):
        resultPaths = []

        hashNode = set()
        queue = list()

        for id in self.nodeIDs_1:
            hashNode.add(id)
            queue.append(self.CreateSearchNode(id, self.GetNodeValue(id), -1))

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

                resultPaths.append(resultPath)

            head += 1

        return resultPaths
