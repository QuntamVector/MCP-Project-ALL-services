from fastapi import FastAPI
from pydantic import BaseModel
from typing import Optional, List
import anthropic
import os

app = FastAPI(title="Model Service", version="1.0.0")

client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))


class InferenceRequest(BaseModel):
    model_id: str
    prompt: str
    max_tokens: Optional[int] = 1024
    temperature: Optional[float] = 0.7
    system: Optional[str] = "You are a helpful assistant."


class InferenceResponse(BaseModel):
    model_id: str
    response: str
    usage: dict


MODEL_MAP = {
    "claude-sonnet": "claude-sonnet-4-6",
    "claude-opus":   "claude-opus-4-6",
    "claude-haiku":  "claude-haiku-4-5-20251001",
}


@app.get("/health")
def health():
    return {"status": "healthy", "service": "model-service"}


@app.post("/inference", response_model=InferenceResponse)
def run_inference(req: InferenceRequest):
    model = MODEL_MAP.get(req.model_id, req.model_id)
    message = client.messages.create(
        model=model,
        max_tokens=req.max_tokens,
        system=req.system,
        messages=[{"role": "user", "content": req.prompt}]
    )
    return InferenceResponse(
        model_id=req.model_id,
        response=message.content[0].text,
        usage={
            "input_tokens": message.usage.input_tokens,
            "output_tokens": message.usage.output_tokens,
        }
    )


@app.get("/models")
def list_models():
    return {"models": list(MODEL_MAP.keys())}
