from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .api import router

app = FastAPI(title="Flex Velozz | ATLAS Backend", version="1.0.0")

# CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
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