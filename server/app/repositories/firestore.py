from ..config.firebase import db
from typing import Dict, Any, List
import json

class FirestoreRepository:
    def __init__(self, collection: str):
        self.collection = collection

    async def create(self, doc_id: str, data: Dict[str, Any]):
        doc_ref = db.collection(self.collection).document(doc_id)
        doc_ref.set(data)

    async def get(self, doc_id: str) -> Dict[str, Any]:
        doc_ref = db.collection(self.collection).document(doc_id)
        doc = doc_ref.get()
        return doc.to_dict() if doc.exists else None

    async def update(self, doc_id: str, data: Dict[str, Any]):
        doc_ref = db.collection(self.collection).document(doc_id)
        doc_ref.update(data)

    async def delete(self, doc_id: str):
        doc_ref = db.collection(self.collection).document(doc_id)
        doc_ref.delete()

    async def list_all(self) -> List[Dict[str, Any]]:
        docs = db.collection(self.collection).stream()
        return [{**doc.to_dict(), "id": doc.id} for doc in docs]

    async def query(self, field: str, op: str, value: Any) -> List[Dict[str, Any]]:
        docs = db.collection(self.collection).where(field, op, value).stream()
        return [{**doc.to_dict(), "id": doc.id} for doc in docs]