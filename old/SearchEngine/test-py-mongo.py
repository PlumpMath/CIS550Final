# mongo3.py

from pymongo import MongoClient

client = MongoClient('mongodb://localhost:27017/')
mydb = client['cis550']

for post in mydb.invertedindexes.find({"keyword": "0-0"}):
    if post.count()==0:
        print 's'
