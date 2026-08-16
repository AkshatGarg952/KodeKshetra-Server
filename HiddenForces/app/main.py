import logging
import os

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

# Loaded before .routes is imported and before the GOOGLE_API_KEY check below:
# relying on a generator module's own load_dotenv() to run first makes startup
# depend on import order.
load_dotenv()

from .routes import router  # noqa: E402  (import must follow load_dotenv)

logger = logging.getLogger(__name__)

app = FastAPI(title="HiddenForces Test Generator")
INTERNAL_SERVICE_TOKEN = os.getenv("INTERNAL_SERVICE_TOKEN")
if not os.getenv("GOOGLE_API_KEY"):
    raise RuntimeError("Missing GOOGLE_API_KEY")
ALLOWED_ORIGINS = [
    origin.strip()
    for origin in os.getenv("CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173").split(",")
    if origin.strip()
]


@app.middleware("http")
async def require_internal_token(request, call_next):
    if not INTERNAL_SERVICE_TOKEN or request.url.path in {"/", "/health", "/openapi.json", "/docs", "/redoc"}:
        return await call_next(request)

    if request.headers.get("x-internal-token") != INTERNAL_SERVICE_TOKEN:
        return JSONResponse(status_code=401, content={"detail": "Unauthorized service request."})

    return await call_next(request)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(router)
