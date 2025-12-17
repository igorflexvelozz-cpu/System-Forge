from ..config.firebase import db
from typing import Dict, Any, List
import json
import asyncio

class FirestoreRepository:
    def __init__(self, collection: str):
        self.collection = collection

    async def create(self, doc_id: str, data: Dict[str, Any]):
        await asyncio.to_thread(db.collection(self.collection).document(doc_id).set, data)

    async def get(self, doc_id: str) -> Dict[str, Any]:
        doc = await asyncio.to_thread(db.collection(self.collection).document(doc_id).get)
        return doc.to_dict() if doc.exists else None

    async def update(self, doc_id: str, data: Dict[str, Any]):
        await asyncio.to_thread(db.collection(self.collection).document(doc_id).update, data)

    async def delete(self, doc_id: str):
        await asyncio.to_thread(db.collection(self.collection).document(doc_id).delete)

    async def list_all(self) -> List[Dict[str, Any]]:
        docs = await asyncio.to_thread(lambda: list(db.collection(self.collection).stream()))
        return [{**doc.to_dict(), "id": doc.id} for doc in docs]

    async def query(self, field: str, op: str, value: Any) -> List[Dict[str, Any]]:
        docs = await asyncio.to_thread(lambda: list(db.collection(self.collection).where(field, op, value).stream()))
        return [{**doc.to_dict(), "id": doc.id} for doc in docs]