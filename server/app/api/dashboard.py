from fastapi import APIRouter, Query
from ..models import SLAGeneralResponse, SLAPeriodResponse, SLASellerResponse, SLAZoneResponse, SLACEPResponse, DelaysGeneralResponse, DelaysDayResponse, DelaysSellerResponse, DelaysZoneResponse, DelaysCEPResponse
from ..repositories import SLARepository, DataRepository
from ..analytics import AnalyticsEngine
from typing import List
import pandas as pd

router = APIRouter()

sla_repo = SLARepository()
data_repo = DataRepository()

@router.get("/sla/general", response_model=SLAGeneralResponse)
async def get_sla_general(job_id: str = Query(...)):
    kpis = await sla_repo.get(f"{job_id}_kpis")
    return SLAGeneralResponse(**kpis)

@router.get("/sla/period", response_model=List[SLAPeriodResponse])
async def get_sla_period(job_id: str = Query(...)):
    data_doc = await data_repo.get(f"{job_id}_data")
    data = data_doc["data"]
    # Assume period is month from data_pedido
    df = pd.DataFrame(data)
    df["period"] = pd.to_datetime(df["data_pedido"]).dt.to_period('M').astype(str)
    results = AnalyticsEngine.calculate_sla_by_group(data, "period")
    return [SLAPeriodResponse(period=r["period"], sla_percentage=r["sla_percentage"]) for r in results]

@router.get("/sla/seller", response_model=List[SLASellerResponse])
async def get_sla_seller(job_id: str = Query(...)):
    data_doc = await data_repo.get(f"{job_id}_data")
    data = data_doc["data"]
    results = AnalyticsEngine.calculate_sla_by_group(data, "Vendedor")
    return [SLASellerResponse(seller=r["Vendedor"], sla_percentage=r["sla_percentage"]) for r in results]

@router.get("/sla/zone", response_model=List[SLAZoneResponse])
async def get_sla_zone(job_id: str = Query(...)):
    data_doc = await data_repo.get(f"{job_id}_data")
    data = data_doc["data"]
    results = AnalyticsEngine.calculate_sla_by_group(data, "Zona")
    return [SLAZoneResponse(zone=r["Zona"], sla_percentage=r["sla_percentage"]) for r in results]

@router.get("/sla/cep", response_model=List[SLACEPResponse])
async def get_sla_cep(job_id: str = Query(...)):
    data_doc = await data_repo.get(f"{job_id}_data")
    data = data_doc["data"]
    results = AnalyticsEngine.calculate_sla_by_group(data, "CEP")
    return [SLACEPResponse(cep=r["CEP"], sla_percentage=r["sla_percentage"]) for r in results]

@router.get("/delays/general", response_model=DelaysGeneralResponse)
async def get_delays_general(job_id: str = Query(...)):
    data_doc = await data_repo.get(f"{job_id}_data")
    data = data_doc["data"]
    delays = AnalyticsEngine.calculate_delays(data)
    return DelaysGeneralResponse(**delays)

@router.get("/delays/day", response_model=List[DelaysDayResponse])
async def get_delays_day(job_id: str = Query(...)):
    data_doc = await data_repo.get(f"{job_id}_data")
    data = data_doc["data"]
    df = pd.DataFrame(data)
    delays_by_day = df[df["sla_calculated"].isin(["Entregue com atraso", "Fora do prazo"])].groupby("data_status_dia").size().reset_index(name="delays")
    return [DelaysDayResponse(date=row["data_status_dia"], delays=row["delays"]) for _, row in delays_by_day.iterrows()]

@router.get("/delays/seller", response_model=List[DelaysSellerResponse])
async def get_delays_seller(job_id: str = Query(...)):
    data_doc = await data_repo.get(f"{job_id}_data")
    data = data_doc["data"]
    df = pd.DataFrame(data)
    delays_by_seller = df[df["sla_calculated"].isin(["Entregue com atraso", "Fora do prazo"])].groupby("Vendedor").size().reset_index(name="delays")
    return [DelaysSellerResponse(seller=row["Vendedor"], delays=row["delays"]) for _, row in delays_by_seller.iterrows()]

@router.get("/delays/zone", response_model=List[DelaysZoneResponse])
async def get_delays_zone(job_id: str = Query(...)):
    data_doc = await data_repo.get(f"{job_id}_data")
    data = data_doc["data"]
    df = pd.DataFrame(data)
    delays_by_zone = df[df["sla_calculated"].isin(["Entregue com atraso", "Fora do prazo"])].groupby("Zona").size().reset_index(name="delays")
    return [DelaysZoneResponse(zone=row["Zona"], delays=row["delays"]) for _, row in delays_by_zone.iterrows()]

@router.get("/delays/cep", response_model=List[DelaysCEPResponse])
async def get_delays_cep(job_id: str = Query(...)):
    data_doc = await data_repo.get(f"{job_id}_data")
    data = data_doc["data"]
    df = pd.DataFrame(data)
    delays_by_cep = df[df["sla_calculated"].isin(["Entregue com atraso", "Fora do prazo"])].groupby("CEP").size().reset_index(name="delays")
    return [DelaysCEPResponse(cep=row["CEP"], delays=row["delays"]) for _, row in delays_by_cep.iterrows()]