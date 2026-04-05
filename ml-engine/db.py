import os
from pymongo import MongoClient
from dotenv import load_dotenv

# Load .env from the backend directory to share the MONGO_URI
backend_env_path = os.path.join(os.path.dirname(__file__), "..", "backend", ".env")
load_dotenv(dotenv_path=backend_env_path)

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/jobgenesis")

client = MongoClient(MONGO_URI)
try:
    db = client.get_default_database()
except Exception:
    db = client.get_database("test")
skills_collection = db.skills
