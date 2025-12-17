from fastapi import APIRouter
from .upload import router as upload_router
from .process import router as process_router
from .dashboard import router as dashboard_router
from .rankings import router as rankings_router
from .consolidated import router as consolidated_router
from .history import router as history_router

router = APIRouter()

router.include_router(upload_router, prefix="/upload", tags=["Upload"])
router.include_router(process_router, prefix="/process", tags=["Process"])
router.include_router(dashboard_router, prefix="/dashboard", tags=["Dashboard"])
router.include_router(rankings_router, prefix="/rankings", tags=["Rankings"])
router.include_router(consolidated_router, prefix="/consolidated", tags=["Consolidated"])
router.include_router(history_router, prefix="/history", tags=["History"])