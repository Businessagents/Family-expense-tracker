import os
from typing import Any, Dict, Iterable, List

import pytest
from fastapi.testclient import TestClient

os.environ.setdefault("MONGO_URL", "mongodb://localhost:27017")
os.environ.setdefault("DB_NAME", "family_expense_test")
os.environ.setdefault("SECRET_KEY", "test-secret-key")

import sys
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parents[1] / "backend"))

import server as server_module

server = server_module


class FakeCursor:
    def __init__(self, docs: Iterable[Dict[str, Any]]):
        self._docs = list(docs)
        self._limit = None

    def sort(self, field: str, direction: int):
        reverse = direction == -1
        self._docs.sort(key=lambda doc: doc.get(field), reverse=reverse)
        return self

    def limit(self, limit: int):
        self._limit = limit
        return self

    async def to_list(self, length: int):
        docs = self._docs
        if self._limit is not None:
            docs = docs[: self._limit]
        return docs[:length]

    def __aiter__(self):
        self._iter = iter(self._docs)
        return self

    async def __anext__(self):
        try:
            return next(self._iter)
        except StopIteration as exc:
            raise StopAsyncIteration from exc


def matches(doc: Dict[str, Any], query: Dict[str, Any]) -> bool:
    for key, value in query.items():
        doc_value = doc.get(key)
        if isinstance(value, dict):
            if "$in" in value:
                if isinstance(doc_value, list):
                    if not any(item in value["$in"] for item in doc_value):
                        return False
                elif doc_value not in value["$in"]:
                    return False
            if "$gte" in value and (doc_value is None or doc_value < value["$gte"]):
                return False
            if "$lte" in value and (doc_value is None or doc_value > value["$lte"]):
                return False
        else:
            if isinstance(doc_value, list):
                if value not in doc_value:
                    return False
            elif doc_value != value:
                return False
    return True


def apply_projection(doc: Dict[str, Any], projection: Dict[str, int] | None):
    if not projection:
        return doc
    projected = {key: doc[key] for key, include in projection.items() if include and key in doc}
    return projected


class FakeCollection:
    def __init__(self):
        self._docs: List[Dict[str, Any]] = []

    async def find_one(self, query: Dict[str, Any], projection: Dict[str, int] | None = None):
        for doc in self._docs:
            if matches(doc, query):
                return apply_projection(doc, projection)
        return None

    async def insert_one(self, doc: Dict[str, Any]):
        self._docs.append(doc)
        return {"inserted_id": doc.get("id")}

    async def update_one(self, query: Dict[str, Any], update: Dict[str, Any]):
        for doc in self._docs:
            if matches(doc, query):
                for key, value in update.get("$set", {}).items():
                    doc[key] = value
                return {"modified_count": 1}
        return {"modified_count": 0}

    async def delete_one(self, query: Dict[str, Any]):
        before = len(self._docs)
        self._docs = [doc for doc in self._docs if not matches(doc, query)]
        return {"deleted_count": before - len(self._docs)}

    async def delete_many(self, query: Dict[str, Any]):
        return await self.delete_one(query)

    def find(self, query: Dict[str, Any], projection: Dict[str, int] | None = None):
        results = [apply_projection(doc, projection) for doc in self._docs if matches(doc, query)]
        return FakeCursor(results)

    async def count_documents(self, query: Dict[str, Any]):
        return len([doc for doc in self._docs if matches(doc, query)])


class FakeDatabase:
    def __init__(self):
        self.users = FakeCollection()
        self.groups = FakeCollection()
        self.categories = FakeCollection()
        self.expenses = FakeCollection()
        self.settlements = FakeCollection()


@pytest.fixture()
def client(monkeypatch):
    fake_db = FakeDatabase()
    monkeypatch.setattr(server_module, "db", fake_db)
    return TestClient(server.app)


def test_auth_and_expense_flow(client):
    register_response = client.post(
        "/api/auth/register",
        json={"name": "Aarav Shah", "email": "aarav@example.com", "pin": "1234"},
    )
    assert register_response.status_code == 200
    payload = register_response.json()
    token = payload["access_token"]

    categories_response = client.get(
        "/api/categories",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert categories_response.status_code == 200
    category_id = categories_response.json()[0]["id"]

    group_response = client.post(
        "/api/groups",
        headers={"Authorization": f"Bearer {token}"},
        json={"name": "Shah Household", "type": "shared", "mode": "split"},
    )
    assert group_response.status_code == 200
    group_id = group_response.json()["id"]

    expense_response = client.post(
        "/api/expenses",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "amount": 1200,
            "currency": "INR",
            "category_id": category_id,
            "group_id": group_id,
            "description": "Grocery run",
        },
    )
    assert expense_response.status_code == 200

    list_response = client.get(
        f"/api/expenses?group_id={group_id}",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert list_response.status_code == 200
    expenses = list_response.json()
    assert len(expenses) == 1
    assert expenses[0]["description"] == "Grocery run"
