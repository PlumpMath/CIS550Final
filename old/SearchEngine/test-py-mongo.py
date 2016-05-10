# mongo3.py

from pymongo import MongoClient

client = MongoClient('mongodb://localhost:27017/')
mydb = client['cis550']

for post in mydb.invertedindexes.find({"keyword": "0-0"}):
    print post['vertex_ids'][0].decode('utf8')