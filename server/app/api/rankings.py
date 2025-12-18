from fastapi import APIRouter, Query
from ..models import RankingsResponse
from ..repositories import RankingsRepository

router = APIRouter()

rankings_repo = RankingsRepository()

@router.get("/", response_model=RankingsResponse)
async def get_rankings(job_id: str = Query(...)):
    rankings = await rankings_repo.get(f"{job_id}_rankings")
    if not rankings:
        from fastapi import HTTPException
        raise HTTPException(status_code=503, detail="Data backend unavailable")
    return RankingsResponse(**rankings)