import firebase_admin
from firebase_admin import credentials, firestore
import os
import warnings

# Initialize Firebase (lazy - do not raise on import to allow local dev without credentials)
cred_path = os.getenv("FIREBASE_CREDENTIALS_PATH", "serviceAccountKey.json")
if os.path.exists(cred_path):
    cred = credentials.Certificate(cred_path)
    firebase_admin.initialize_app(cred)
    db = firestore.client()
else:
    # Do not warn at import time to avoid noisy startup logs; Firestore will raise only when used.
    db = None


def get_db():
    if db is None:
        raise RuntimeError("Firebase not configured. Set FIREBASE_CREDENTIALS_PATH or place serviceAccountKey.json to enable Firestore.")
    return db