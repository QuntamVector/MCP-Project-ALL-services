from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional
import os

app = FastAPI(title="User Service", version="1.0.0")

users_db = {
    "u001": {"id": "u001", "name": "Alice", "email": "alice@example.com", "role": "admin"},
    "u002": {"id": "u002", "name": "Bob",   "email": "bob@example.com",   "role": "user"},
}


class User(BaseModel):
    id: str
    name: str
    email: str
    role: Optional[str] = "user"


class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None


@app.get("/health")
def health():
    return {"status": "healthy", "service": "user-service"}


@app.get("/users")
def list_users():
    return {"users": list(users_db.values()), "total": len(users_db)}


@app.get("/users/{user_id}")
def get_user(user_id: str):
    if user_id not in users_db:
        raise HTTPException(status_code=404, detail="User not found")
    return users_db[user_id]


@app.post("/users")
def create_user(user: User):
    if user.id in users_db:
        raise HTTPException(status_code=400, detail="User already exists")
    users_db[user.id] = user.dict()
    return {"message": "User created", "user": user}


@app.put("/users/{user_id}")
def update_user(user_id: str, update: UserUpdate):
    if user_id not in users_db:
        raise HTTPException(status_code=404, detail="User not found")
    if update.name:
        users_db[user_id]["name"] = update.name
    if update.email:
        users_db[user_id]["email"] = update.email
    return {"message": "User updated", "user": users_db[user_id]}


@app.delete("/users/{user_id}")
def delete_user(user_id: str):
    users_db.pop(user_id, None)
    return {"message": "User deleted"}
