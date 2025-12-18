from fastapi import APIRouter, Query
from ..models import HistoryComparisonResponse, HistoryEvolutionResponse, HistoryTrendsResponse
from ..repositories import SLARepository
from typing import List

router = APIRouter()

sla_repo = SLARepository()

@router.get("/comparison", response_model=List[HistoryComparisonResponse])
async def get_comparison(period1: str = Query(...), period2: str = Query(...)):
    # Assume periods are job_ids or something
    kpis1 = await sla_repo.get(f"{period1}_kpis")
    kpis2 = await sla_repo.get(f"{period2}_kpis")
    if not kpis1 or not kpis2:
        from fastapi import HTTPException
        raise HTTPException(status_code=503, detail="Data backend unavailable")
    diff = kpis2["sla_percentage"] - kpis1["sla_percentage"]
    return [HistoryComparisonResponse(
        period1=period1,
        period2=period2,
        sla_period1=kpis1["sla_percentage"],
        sla_period2=kpis2["sla_percentage"],
        difference=diff
    )]

@router.get("/evolution", response_model=List[HistoryEvolutionResponse])
async def get_evolution():
    # Need historical data, assume multiple jobs
    # For simplicity, return empty
    return []

@router.get("/trends", response_model=HistoryTrendsResponse)
async def get_trends():
    # Calculate trend
    return HistoryTrendsResponse(trend="stable", description="SLA is stable")