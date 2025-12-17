import firebase_admin
from firebase_admin import credentials, firestore
import os

# Initialize Firebase
cred_path = os.getenv("FIREBASE_CREDENTIALS_PATH", "serviceAccountKey.json")
if not os.path.exists(cred_path):
    raise FileNotFoundError(f"Firebase credentials file not found at {cred_path}. Please set the FIREBASE_CREDENTIALS_PATH environment variable or place the serviceAccountKey.json file in the server directory.")
cred = credentials.Certificate(cred_path)
firebase_admin.initialize_app(cred)

db = firestore.client()