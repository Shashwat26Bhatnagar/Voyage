from pymongo import MongoClient

client = MongoClient("mongodb://localhost:27017/")
db = client["admin"]
collection = db["audio_clips"]

# Delete docs where 'audio' field does not exist
result = collection.delete_many({"audio": {"$exists": False}})

print(f"Deleted {result.deleted_count} documents without audio field.")
