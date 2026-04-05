from fastapi import FastAPI, Request, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import httpx
import os
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="MCP API Gateway", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

SERVICES = {
    "auth":           os.getenv("AUTH_SERVICE_URL",           "http://auth-service:8001"),
    "model":          os.getenv("MODEL_SERVICE_URL",          "http://model-service:8003"),
    "ai-assistant":   os.getenv("AI_ASSISTANT_URL",           "http://ai-assistant:8004"),
    "recommendation": os.getenv("RECOMMENDATION_ENGINE_URL",  "http://recommendation-engine:8005"),
    "product":        os.getenv("PRODUCT_SERVICE_URL",        "http://product-service:8006"),
    "user":           os.getenv("USER_SERVICE_URL",           "http://user-service:8007"),
    "payment":        os.getenv("PAYMENT_SERVICE_URL",        "http://payment-service:8009"),
    "control-plane":  os.getenv("MCP_CONTROL_PLANE_URL",      "http://mcp-control-plane:8008"),
}

# Routes that do NOT require a JWT token
PUBLIC_ROUTES = {
    ("auth", "login"),
    ("auth", "register"),
    ("auth", "health"),
    ("auth", "refresh"),
}


async def verify_token(request: Request):
    token = request.headers.get("Authorization")
    if not token:
        raise HTTPException(status_code=401, detail="Missing Authorization header")
    async with httpx.AsyncClient(timeout=10.0) as client:
        resp = await client.post(
            f"{SERVICES['auth']}/verify-header",
            params={"authorization": token}
        )
        if resp.status_code != 200:
            raise HTTPException(status_code=401, detail="Invalid token")
    return token


@app.get("/health")
async def health():
    return {"status": "healthy", "service": "mcp-api-gateway"}


@app.api_route("/{service}/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH"])
async def proxy(service: str, path: str, request: Request):
    if service not in SERVICES:
        raise HTTPException(status_code=404, detail=f"Service '{service}' not found")

    # Skip auth for public routes
    if (service, path) not in PUBLIC_ROUTES:
        token = request.headers.get("Authorization")
        if not token:
            raise HTTPException(status_code=401, detail="Missing Authorization header")
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.post(
                f"{SERVICES['auth']}/verify-header",
                params={"authorization": token}
            )
            if resp.status_code != 200:
                raise HTTPException(status_code=401, detail="Invalid token")

    url = f"{SERVICES[service]}/{path}"
    body = await request.body()

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.request(
                method=request.method,
                url=url,
                headers={k: v for k, v in request.headers.items() if k.lower() != "host"},
                content=body,
                params=dict(request.query_params),
            )
    except httpx.ConnectError:
        logger.error(f"Cannot reach {service} at {url}")
        raise HTTPException(status_code=503, detail=f"Service '{service}' is unavailable")
    except httpx.TimeoutException:
        logger.error(f"Timeout reaching {service} at {url}")
        raise HTTPException(status_code=504, detail=f"Service '{service}' timed out")

    logger.info(f"Proxied {request.method} /{service}/{path} -> {resp.status_code}")

    try:
        return resp.json()
    except Exception:
        return JSONResponse(content=resp.text, status_code=resp.status_code)
