import pymongo
import sys

uri = "mongodb+srv://Shubhamm27p:Sp4522119@cluster0.nlugthd.mongodb.net/?appName=Cluster0"
try:
    client = pymongo.MongoClient(uri, serverSelectionTimeoutMS=5000)
    client.server_info()
    print("MongoDB connection successful!")
except Exception as e:
    print(f"MongoDB connection failed: {e}")
    sys.exit(1)
