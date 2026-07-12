import os
import hashlib
import secrets
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from api.assessment import router as assessment_router

app = FastAPI(title="The Open AI Backend")

# Load environment configurations
DEFAULT_HASH = "2e7dc858d0ae28d87de220490c3ab66315f7cbeaec2e3c2004be6ae66f7eab6c"
DEFAULT_SALT = "open_ai_backend_salt_2026"

BB_AGENT_API_KEY_HASH = os.getenv("BB_AGENT_API_KEY_HASH", DEFAULT_HASH)
BB_AGENT_API_KEY_SALT = os.getenv("BB_AGENT_API_KEY_SALT", DEFAULT_SALT)

@app.middleware("http")
async def check_api_key_middleware(request: Request, call_next):
    # Exclude root ("/") from authentication
    if request.url.path == "/":
        return await call_next(request)

    # Exclude Swagger/OpenAPI docs from authentication
    if request.url.path in ("/docs", "/redoc", "/openapi.json"):
        return await call_next(request)

    # Extract API Key from headers (X-API-Key) or query parameters (api_key)
    received_key = request.headers.get("X-API-Key") or request.query_params.get("api_key")

    if not received_key:
        return JSONResponse(
            status_code=401,
            content={"detail": "Unauthorized: Missing API Key"}
        )

    # Verify key using salted SHA-256 hash comparison
    hasher = hashlib.sha256()
    hasher.update((received_key + BB_AGENT_API_KEY_SALT).encode('utf-8'))
    computed_hash = hasher.hexdigest()

    if not secrets.compare_digest(computed_hash, BB_AGENT_API_KEY_HASH):
        return JSONResponse(
            status_code=401,
            content={"detail": "Unauthorized: Invalid API Key"}
        )

    return await call_next(request)

# Enable CORS for frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(assessment_router, prefix="/api")

@app.get("/")
def read_root():
    return {"status": "running", "message": "Welcome to The Open AI Backend API"}

