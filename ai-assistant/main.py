from fastapi import FastAPI
from pydantic import BaseModel
from typing import Optional, List
import anthropic
import os

app = FastAPI(title="AI Assistant Service", version="1.0.0")

client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

SYSTEM_PROMPT = """You are an intelligent AI assistant integrated into the MCP platform.
You help users with product queries, recommendations, and general assistance.
Be concise, helpful, and accurate."""


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    messages: List[ChatMessage]
    session_id: Optional[str] = None
    max_tokens: Optional[int] = 1024


@app.get("/health")
def health():
    return {"status": "healthy", "service": "ai-assistant"}


@app.post("/chat")
def chat(req: ChatRequest):
    messages = [{"role": m.role, "content": m.content} for m in req.messages]
    response = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=req.max_tokens,
        system=SYSTEM_PROMPT,
        messages=messages,
    )
    return {
        "response": response.content[0].text,
        "session_id": req.session_id,
        "usage": {
            "input_tokens": response.usage.input_tokens,
            "output_tokens": response.usage.output_tokens,
        }
    }


@app.post("/summarize")
def summarize(text: str, max_tokens: int = 512):
    response = client.messages.create(
        model="claude-haiku-4-5-20251001",
        max_tokens=max_tokens,
        messages=[{"role": "user", "content": f"Summarize the following:\n\n{text}"}],
    )
    return {"summary": response.content[0].text}
