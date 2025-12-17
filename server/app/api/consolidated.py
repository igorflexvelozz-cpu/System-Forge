from fastapi import APIRouter, Query
from ..models import ConsolidatedResponse, ConsolidatedRecord
from ..repositories import DataRepository
from typing import Optional
import pandas as pd

router = APIRouter()

data_repo = DataRepository()

@router.get("/", response_model=ConsolidatedResponse)
async def get_consolidated(
    job_id: str = Query(...),
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=1000),
    sort_by: Optional[str] = Query(None),
    filter_seller: Optional[str] = Query(None),
    filter_zone: Optional[str] = Query(None)
):
    data_doc = await data_repo.get(f"{job_id}_data")
    data = data_doc["data"]
    
    df = pd.DataFrame(data)
    
    # Filters
    if filter_seller:
        df = df[df["Vendedor"].str.contains(filter_seller, case=False, na=False)]
    if filter_zone:
        df = df[df["Zona"].str.contains(filter_zone, case=False, na=False)]
    
    # Sort
    if sort_by and sort_by in df.columns:
        df = df.sort_values(sort_by)
    
    # Pagination
    start = (page - 1) * page_size
    end = start + page_size
    paginated = df.iloc[start:end]
    
    records = [ConsolidatedRecord(**row.to_dict()) for _, row in paginated.iterrows()]
    
    return ConsolidatedResponse(
        records=records,
        total=len(df),
        page=page,
        page_size=page_size
    )