# -*- coding: utf-8 -*-
import sys
import os
import MySQLdb
from pymongo import MongoClient

class SearchEngine:
    """ Search engine for keywords searching"""

    MYSQL_HOST = os.environ.get('MYSQL_HOST')
    MYSQL_DB = os.environ.get('MYSQL_DB')
    MYSQL_USER = os.environ.get('MYSQL_USER')
    MYSQL_PASSWORD = os.environ.get('MYSQL_PASSWORD')
    MONGO_URL = os.environ.get('MONGO_URL')
    MAX_PASS_NUMBER = 10
    OPT_MAX_PASS_NUMBER = True

    def __init__(self):
        self.nodeIDs_1 = {}
        self.nodeIDs_2 = {}

        #self.db = MySQLdb.connect('datalake550.chyq7der4m33.us-east-1.rds.amazonaws.com',
        #                          'shrekshao',
        #                          '12345678',
        #                          'datalake550')
        #call("cis550", shell=True , env=dict(ENV='~/.bash_profile'))
        self.db = MySQLdb.connect(self.MYSQL_HOST, self.MYSQL_USER, self.MYSQL_PASSWORD, self.MYSQL_DB, charset='utf8')

        self.cursor = self.db.cursor()

        self.client = MongoClient(self.MONGO_URL)
        self.mongodb = self.client['cis550']
        # print "connect with database"

    def DisconnectDatabase(self):
        self.db.close()
        # print "close database connection"

    def GetExpansionList(self, root):
        expansionList = set()
        sql = "select vertex_id_1 from edge where vertex_id_2 = '%s'" % root
        self.cursor.execute(sql)
        data = self.cursor.fetchall()
        for row in data:
            expansionList.add(row[0])

        sql = "select vertex_id_2 from edge where vertex_id_1 = '%s'" % root
        self.cursor.execute(sql)
        data = self.cursor.fetchall()
        for row in data:
            expansionList.add(row[0])

        # get isLeaf and keyword(value)
        sql = "select is_leaf,value from vertex where vertex_id= '%s'" % root
        self.cursor.execute(sql)
        data = self.cursor.fetchall()
        
        if bool(data[0][0]):
            # is leaf
            value = (data[0][1])#.decode('ascii').encode('utf8')
            for post in self.mongodb.invertedindexes.find({'keyword':value}):
                for vertexID in post['vertex_ids']:
                    expansionList.add(vertexID)

        return expansionList


    def GetNodeValue(self, nodeID):
        sql = "select value from vertex where vertex_id = '%s'" % nodeID
        self.cursor.execute(sql)
        data = self.cursor.fetchall()
        if len(data) == 1:
            return data[0][0]
        else:
            return ""


    def PrintPathInfo(self, p):
        print "========================================="
        for node in p:
            print "vertex_id:", node["vertex_id"], " value:", node["value"]
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
        #resultPaths = self.SearchStartFromMultipleNodes()
        resultPaths = self.SearchBidirectional()
        resultPaths = sorted(resultPaths, key = len)
        return resultPaths


    # def CreateSearchNode(self, nodeId, nodeValue, prev):
    #     return {"vertex_id": nodeId, "value": nodeValue, "prev": prev}

    # def CreatePathNode(self, nodeId, nodeValue):
    #     return {"vertex_id": nodeId, "value": nodeValue}

    def CreateSearchNode(self, nodeId, prev):
        sql = "select value, file_id from vertex where vertex_id = '%s'" % nodeId
        self.cursor.execute(sql)
        data = self.cursor.fetchall()
        
        if len(data) == 1:
            nodeValue = data[0][0]
            nodeFileId = data[0][1]
            return {"vertex_id": nodeId, "value": nodeValue, "file_id": nodeFileId, "prev": prev}
        else:
            return None


    # def CreatePathNode(self, nodeId, nodeValue, nodeFileId):
    #     return {"vertex_id": nodeId, "value": nodeValue, "file_id": nodeFileId}

    def CreatePathNode(self, node):
        return {"vertex_id": node["vertex_id"], "value": node["value"], "file_id": node["file_id"]}


    def SearchStartFromNode(self, root):
        hashNode = set()
        for id in self.nodeIDs_1:
            hashNode.add(id)

        queue = list()
        # queue.append(self.CreateSearchNode(root, self.GetNodeValue(root), -1))
        queue.append(self.CreateSearchNode(root, -1))

        head = 0

        while head < len(queue):
            expansionList = self.GetExpansionList(queue[head]["vertex_id"])
            for newID in expansionList:
                if newID not in hashNode:
                    hashNode.add(newID)
                    # queue.append(self.CreateSearchNode(newID, self.GetNodeValue(newID), head))
                    queue.append(self.CreateSearchNode(newID, head))

            if queue[head]["vertex_id"] in self.nodeIDs_2:
                resultPath = []
                tmp = head

                while tmp != -1:
                    # resultPath.append(self.CreatePathNode(queue[tmp]["vertex_id"], queue[tmp]["value"]))
                    resultPath.append(self.CreatePathNode(queue[tmp]))
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
            # queue.append(self.CreateSearchNode(id, self.GetNodeValue(id), -1))
            queue.append(self.CreateSearchNode(id, -1))

        head = 0
        while head < len(queue):
            expansionList = self.GetExpansionList(queue[head]["vertex_id"])
            for newID in expansionList:
                if newID not in hashNode:
                    hashNode.add(newID)
                    #queue.append(self.CreateSearchNode(newID, self.GetNodeValue(newID), head))
                    queue.append(self.CreateSearchNode(newID, head))

            if queue[head]["vertex_id"] in self.nodeIDs_2:
                resultPath = []
                tmp = head

                while tmp != -1:
                    #resultPath.append(self.CreatePathNode(queue[tmp]["vertex_id"], queue[tmp]["value"]))
                    resultPath.append(self.CreatePathNode(queue[tmp]))
                    tmp = queue[tmp]["prev"]

                resultPath.reverse()

                resultPaths.append(resultPath)
                if self.OPT_MAX_PASS_NUMBER == True and len(resultPaths) >= self.MAX_PASS_NUMBER:
                    return resultPaths

            head += 1

        return resultPaths


    def SearchBidirectional(self):
        resultPaths = []

        hashNode1 = set()
        hashNode2 = set()
        
        queue1 = list()
        queue2 = list()

        nodeInQueueMap1 = {}
        nodeInQueueMap2 = {}

        pathUniqueHash = set()

        # initialize first search
        for id in self.nodeIDs_1:
            hashNode1.add(id)
            nodeInQueueMap1[id] = len(queue1)
            #queue1.append(self.CreateSearchNode(id, self.GetNodeValue(id), -1))
            queue1.append(self.CreateSearchNode(id, -1))

        for id in self.nodeIDs_2:
            hashNode2.add(id)
            nodeInQueueMap2[id] = len(queue2)
            # queue2.append(self.CreateSearchNode(id, self.GetNodeValue(id), -1))
            queue2.append(self.CreateSearchNode(id, -1))

        head1 = 0
        head2 = 0

        while head1 < len(queue1) and head2 < len(queue2):
            # expand search_1
            expansionList1 = self.GetExpansionList(queue1[head1]["vertex_id"])
            for newID in expansionList1:
                if newID in hashNode2 and newID not in hashNode1: # found pass throuhg 1->2
                    resultPath = []

                    tmp = head1
                    while tmp != -1:
                        resultPath.append(self.CreatePathNode(queue1[tmp]))
                        tmp = queue1[tmp]["prev"]

                    resultPath.reverse()
                    
                    tmp = nodeInQueueMap2[newID]
                    while tmp != -1:
                        resultPath.append(self.CreatePathNode(queue2[tmp]))
                        tmp = queue2[tmp]["prev"]

                    if resultPath[0]["vertex_id"] not in pathUniqueHash:
                        pathUniqueHash.add(resultPath[0]["vertex_id"])
                        resultPaths.append(resultPath)

                    if self.OPT_MAX_PASS_NUMBER == True and len(resultPaths) >= self.MAX_PASS_NUMBER:
                        return resultPaths

                else: # not in queue2
                    if newID not in hashNode1: # expand new id 
                        hashNode1.add(newID)
                        nodeInQueueMap1[newID] = len(queue1)
                        # queue1.append(self.CreateSearchNode(newID, self.GetNodeValue(newID), head1))
                        queue1.append(self.CreateSearchNode(newID, head1))
            head1 += 1

            # expand search_2
            expansionList2 = self.GetExpansionList(queue2[head2]["vertex_id"])
            for newID in expansionList2:
                if newID in hashNode1 and newID not in hashNode2: # found pass throuhg 2->1
                    resultPath = []

                    tmp = nodeInQueueMap1[newID]
                    while tmp != -1:
                        resultPath.append(self.CreatePathNode(queue1[tmp]))
                        tmp = queue1[tmp]["prev"]

                    resultPath.reverse()

                    tmp = head2
                    while tmp != -1:
                        resultPath.append(self.CreatePathNode(queue2[tmp]))
                        tmp = queue2[tmp]["prev"]

                    if resultPath[0]["vertex_id"] not in pathUniqueHash:
                        pathUniqueHash.add(resultPath[0]["vertex_id"])
                        resultPaths.append(resultPath)

                    if self.OPT_MAX_PASS_NUMBER == True and len(resultPaths) >= self.MAX_PASS_NUMBER:
                        return resultPaths

                else: # not in queue1
                    if newID not in hashNode2: # expand new id 
                        hashNode2.add(newID)
                        nodeInQueueMap2[newID] = len(queue2)
                        queue2.append(self.CreateSearchNode(newID, head2))
            head2 += 1

        return resultPaths

