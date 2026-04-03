from fastapi import FastAPI
from pydantic import BaseModel
from typing import Optional
import os

app = FastAPI(title="MCP Control Plane", version="1.0.0")

registered_models = {}


class ModelRegistration(BaseModel):
    model_id: str
    model_name: str
    version: str
    endpoint: str
    description: Optional[str] = ""
    tags: Optional[list] = []


@app.get("/health")
def health():
    return {"status": "healthy", "service": "mcp-control-plane"}


@app.post("/models/register")
def register_model(model: ModelRegistration):
    registered_models[model.model_id] = model.dict()
    return {"message": "Model registered", "model_id": model.model_id}


@app.get("/models")
def list_models():
    return {"models": list(registered_models.values())}


@app.get("/models/{model_id}")
def get_model(model_id: str):
    if model_id not in registered_models:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Model not found")
    return registered_models[model_id]


@app.delete("/models/{model_id}")
def deregister_model(model_id: str):
    registered_models.pop(model_id, None)
    return {"message": "Model deregistered", "model_id": model_id}


@app.get("/status")
def control_plane_status():
    return {
        "registered_models": len(registered_models),
        "status": "running",
        "version": "1.0.0"
    }
