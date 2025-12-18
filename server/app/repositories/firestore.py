from ..config.firebase import get_db
from typing import Dict, Any, List, Optional
import json
import asyncio
import warnings

class FirestoreRepository:
    def __init__(self, collection: str):
        self.collection = collection

    async def create(self, doc_id: str, data: Dict[str, Any]) -> Optional[None]:
        try:
            await asyncio.to_thread(get_db().collection(self.collection).document(doc_id).set, data)
        except RuntimeError as e:
            warnings.warn(f"Firestore not available; create('{doc_id}') skipped: {e}")
            return None

    async def get(self, doc_id: str) -> Optional[Dict[str, Any]]:
        try:
            doc = await asyncio.to_thread(get_db().collection(self.collection).document(doc_id).get)
            return doc.to_dict() if doc.exists else None
        except RuntimeError as e:
            warnings.warn(f"Firestore not available; get('{doc_id}') returning None: {e}")
            return None

    async def update(self, doc_id: str, data: Dict[str, Any]) -> Optional[None]:
        try:
            await asyncio.to_thread(get_db().collection(self.collection).document(doc_id).update, data)
        except RuntimeError as e:
            warnings.warn(f"Firestore not available; update('{doc_id}') skipped: {e}")
            return None

    async def delete(self, doc_id: str) -> Optional[None]:
        try:
            await asyncio.to_thread(get_db().collection(self.collection).document(doc_id).delete)
        except RuntimeError as e:
            warnings.warn(f"Firestore not available; delete('{doc_id}') skipped: {e}")
            return None

    async def list_all(self) -> List[Dict[str, Any]]:
        try:
            docs = await asyncio.to_thread(lambda: list(get_db().collection(self.collection).stream()))
            return [{**doc.to_dict(), "id": doc.id} for doc in docs]
        except RuntimeError as e:
            warnings.warn(f"Firestore not available; list_all() returning empty list: {e}")
            return []

    async def query(self, field: str, op: str, value: Any) -> List[Dict[str, Any]]:
        try:
            docs = await asyncio.to_thread(lambda: list(get_db().collection(self.collection).where(field, op, value).stream()))
            return [{**doc.to_dict(), "id": doc.id} for doc in docs]
        except RuntimeError as e:
            warnings.warn(f"Firestore not available; query() returning empty list: {e}")
            return []