from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware import Middleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from .api import router

app = FastAPI(
    title="Flex Velozz | ATLAS Backend",
    version="1.0.0",
    middleware=[
        Middleware(
            CORSMiddleware,
            allow_origins=["*"],
            allow_credentials=True,
            allow_methods=["*"],
            allow_headers=["*"],
            expose_headers=["Content-Disposition"]
        )
    ]
)

app.router.default_max_request_body_size = 200 * 1024 * 1024  # 200MB

exception_handler = app.exception_handler

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=422,
        content={"detail": exc.errors(), "body": exc.body},
    )

app.include_router(router)

@app.get("/")
async def root():
    return {"message": "Flex Velozz | ATLAS Backend"}

@app.get("/system/status")
async def get_system_status():
    from .repositories import ProcessRepository
    process_repo = ProcessRepository()
    processes = await process_repo.list_all()
    if processes:
        latest = processes[-1]
        return {
            "status": latest.get("status", "idle"),
            "lastUpdate": latest.get("lastUpdated"),
            "message": latest.get("message")
        }
    else:
        return {
            "status": "idle",
            "lastUpdate": None,
            "message": "Sistema aguardando dados"
        }

@app.get("/health")
async def health():
    """Simple health check for readiness: checks Firestore configuration and returns status."""
    from .config.firebase import get_db
    try:
        # get_db will raise RuntimeError if not configured
        get_db()
        firebase_ok = True
    except RuntimeError:
        firebase_ok = False

    return {"ok": True, "firebase_configured": firebase_ok}