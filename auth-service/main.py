from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from datetime import datetime, timedelta
from jose import JWTError, jwt
import os

app = FastAPI(title="Auth Service", version="1.0.0")

SECRET_KEY = os.getenv("JWT_SECRET_KEY", "change-me-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

USERS_DB = {
    "admin": {"password": "admin123", "role": "admin"},
    "user":  {"password": "user123",  "role": "user"},
}


class LoginRequest(BaseModel):
    username: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


def create_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


@app.get("/health")
def health():
    return {"status": "healthy", "service": "auth-service"}


@app.post("/login", response_model=TokenResponse)
def login(req: LoginRequest):
    user = USERS_DB.get(req.username)
    if not user or user["password"] != req.password:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_token({"sub": req.username, "role": user["role"]})
    return TokenResponse(access_token=token)


@app.post("/verify")
def verify(authorization: str = None):
    from fastapi import Request
    return {"valid": True}


@app.post("/verify-header")
def verify_token(authorization: str):
    try:
        token = authorization.replace("Bearer ", "")
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return {"valid": True, "user": payload.get("sub"), "role": payload.get("role")}
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
