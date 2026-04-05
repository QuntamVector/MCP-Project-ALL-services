from fastapi import FastAPI
from pydantic import BaseModel
from typing import Optional, List
from openai import OpenAI
import os
import httpx
import time
import json

app = FastAPI(title="AI Assistant Service", version="1.0.0")

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

CONTROL_PLANE_URL = os.getenv("MCP_CONTROL_PLANE_URL", "http://mcp-control-plane:8008")

# Cache cluster status for 30 seconds to avoid hitting control-plane on every message
_cluster_cache = {"data": None, "ts": 0}
CACHE_TTL = 30


def fetch_cluster_context() -> str:
    now = time.time()
    if _cluster_cache["data"] and (now - _cluster_cache["ts"]) < CACHE_TTL:
        return _cluster_cache["data"]

    try:
        resp = httpx.get(f"{CONTROL_PLANE_URL}/status", timeout=5.0)
        if resp.status_code == 200:
            status = resp.json()
            cluster = status.get("cluster", {})
            pods = status.get("pods", {})
            nodes = status.get("nodes", {})
            metrics = status.get("metrics", {})

            # Build a concise summary for the system prompt
            pod_lines = []
            for p in pods.get("items", []):
                if "error" not in p:
                    pod_lines.append(
                        f"  - {p['service']} | pod: {p['name']} | status: {p['status']} | restarts: {p['restarts']}"
                    )

            node_lines = []
            for n in nodes.get("items", []):
                if "error" not in n:
                    node_lines.append(
                        f"  - {n['name']} | {n['status']} | type: {n['instance']} | zone: {n['zone']}"
                    )

            context = f"""
LIVE CLUSTER DATA (fetched in real-time from control plane):
Cluster: {cluster.get('name')} | region: {cluster.get('region')} | k8s: {cluster.get('version')} | status: {cluster.get('status')}
Namespace: {status.get('namespace')}
Pods ({pods.get('running')}/{pods.get('total')} running):
{chr(10).join(pod_lines) if pod_lines else '  (unavailable)'}
Nodes ({nodes.get('total')} total):
{chr(10).join(node_lines) if node_lines else '  (unavailable)'}
Resource usage: CPU {metrics.get('cpu_used_millicores')}m | Memory {metrics.get('memory_used_mb')}MB
"""
            _cluster_cache["data"] = context
            _cluster_cache["ts"] = now
            return context
    except Exception as e:
        pass

    return "(Cluster data currently unavailable — control plane unreachable)"


def build_system_prompt() -> str:
    cluster_context = fetch_cluster_context()
    return f"""You are an intelligent AI assistant integrated into the MCP platform.
You help users with questions about the running microservices, cluster health, products, recommendations, and general assistance.
Be concise, helpful, and accurate.
Only answer based on the live data below or what the user has told you. Do not invent or assume any details beyond what is provided.

{cluster_context}"""


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
    messages = [{"role": "system", "content": build_system_prompt()}]
    messages += [{"role": m.role, "content": m.content} for m in req.messages]
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        max_tokens=req.max_tokens,
        messages=messages,
    )
    return {
        "response": response.choices[0].message.content,
        "session_id": req.session_id,
        "usage": {
            "input_tokens":  response.usage.prompt_tokens,
            "output_tokens": response.usage.completion_tokens,
        }
    }


@app.post("/summarize")
def summarize(text: str, max_tokens: int = 512):
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        max_tokens=max_tokens,
        messages=[{"role": "user", "content": f"Summarize the following:\n\n{text}"}],
    )
    return {"summary": response.choices[0].message.content}
