from fastapi import APIRouter, Query, HTTPException
from ..models import SLAGeneralResponse, SLAPeriodResponse, SLASellerResponse, SLAZoneResponse, SLACEPResponse, DelaysGeneralResponse, DelaysDayResponse, DelaysSellerResponse, DelaysZoneResponse, DelaysCEPResponse, OverviewData, SLAMetrics, BarChartData, RankingEntry
from ..repositories import SLARepository, DataRepository, ProcessRepository
from ..analytics import AnalyticsEngine
from typing import List
import pandas as pd

router = APIRouter()

sla_repo = SLARepository()
data_repo = DataRepository()
process_repo = ProcessRepository()

@router.get("/sla/general", response_model=SLAGeneralResponse)
async def get_sla_general(job_id: str = Query(...)):
    kpis = await sla_repo.get(f"{job_id}_kpis")
    if not kpis:
        raise HTTPException(status_code=503, detail="Data backend unavailable")
    return SLAGeneralResponse(**kpis)

@router.get("/sla/period", response_model=List[SLAPeriodResponse])
async def get_sla_period(job_id: str = Query(...)):
    data_doc = await data_repo.get(f"{job_id}_data")
    if not data_doc:
        raise HTTPException(status_code=503, detail="Data backend unavailable")
    data = data_doc["data"]
    # Assume period is month from data_pedido
    df = pd.DataFrame(data)
    df["period"] = pd.to_datetime(df["data_pedido"]).dt.to_period('M').astype(str)
    results = AnalyticsEngine.calculate_sla_by_group(data, "period")
    return [SLAPeriodResponse(period=r["period"], sla_percentage=r["sla_percentage"]) for r in results]

@router.get("/sla/seller", response_model=List[SLASellerResponse])
async def get_sla_seller(job_id: str = Query(...)):
    data_doc = await data_repo.get(f"{job_id}_data")
    if not data_doc:
        raise HTTPException(status_code=503, detail="Data backend unavailable")
    data = data_doc["data"]
    results = AnalyticsEngine.calculate_sla_by_group(data, "Vendedor")
    return [SLASellerResponse(seller=r["Vendedor"], sla_percentage=r["sla_percentage"]) for r in results]

@router.get("/sla/zone", response_model=List[SLAZoneResponse])
async def get_sla_zone(job_id: str = Query(...)):
    data_doc = await data_repo.get(f"{job_id}_data")
    if not data_doc:
        raise HTTPException(status_code=503, detail="Data backend unavailable")
    data = data_doc["data"]
    results = AnalyticsEngine.calculate_sla_by_group(data, "Zona")
    return [SLAZoneResponse(zone=r["Zona"], sla_percentage=r["sla_percentage"]) for r in results]

@router.get("/sla/cep", response_model=List[SLACEPResponse])
async def get_sla_cep(job_id: str = Query(...)):
    data_doc = await data_repo.get(f"{job_id}_data")
    if not data_doc:
        raise HTTPException(status_code=503, detail="Data backend unavailable")
    data = data_doc["data"]
    results = AnalyticsEngine.calculate_sla_by_group(data, "CEP")
    return [SLACEPResponse(cep=r["CEP"], sla_percentage=r["sla_percentage"]) for r in results]

@router.get("/delays/general", response_model=DelaysGeneralResponse)
async def get_delays_general(job_id: str = Query(...)):
    data_doc = await data_repo.get(f"{job_id}_data")
    if not data_doc:
        raise HTTPException(status_code=503, detail="Data backend unavailable")
    data = data_doc["data"]
    delays = AnalyticsEngine.calculate_delays(data)
    return DelaysGeneralResponse(**delays)

@router.get("/delays/day", response_model=List[DelaysDayResponse])
async def get_delays_day(job_id: str = Query(...)):
    data_doc = await data_repo.get(f"{job_id}_data")
    if not data_doc:
        raise HTTPException(status_code=503, detail="Data backend unavailable")
    data = data_doc["data"]
    df = pd.DataFrame(data)
    delays_by_day = df[df["sla_calculated"].isin(["Entregue com atraso", "Fora do prazo"])].groupby("data_status_dia").size().reset_index(name="delays")
    return [DelaysDayResponse(date=row["data_status_dia"], delays=row["delays"]) for _, row in delays_by_day.iterrows()]

@router.get("/delays/seller", response_model=List[DelaysSellerResponse])
async def get_delays_seller(job_id: str = Query(...)):
    data_doc = await data_repo.get(f"{job_id}_data")
    if not data_doc:
        raise HTTPException(status_code=503, detail="Data backend unavailable")
    data = data_doc["data"]
    df = pd.DataFrame(data)
    delays_by_seller = df[df["sla_calculated"].isin(["Entregue com atraso", "Fora do prazo"])].groupby("Vendedor").size().reset_index(name="delays")
    return [DelaysSellerResponse(seller=row["Vendedor"], delays=row["delays"]) for _, row in delays_by_seller.iterrows()]

@router.get("/delays/zone", response_model=List[DelaysZoneResponse])
async def get_delays_zone(job_id: str = Query(...)):
    data_doc = await data_repo.get(f"{job_id}_data")
    if not data_doc:
        raise HTTPException(status_code=503, detail="Data backend unavailable")
    data = data_doc["data"]
    df = pd.DataFrame(data)
    delays_by_zone = df[df["sla_calculated"].isin(["Entregue com atraso", "Fora do prazo"])].groupby("Zona").size().reset_index(name="delays")
    return [DelaysZoneResponse(zone=row["Zona"], delays=row["delays"]) for _, row in delays_by_zone.iterrows()]

@router.get("/delays/cep", response_model=List[DelaysCEPResponse])
async def get_delays_cep(job_id: str = Query(...)):
    data_doc = await data_repo.get(f"{job_id}_data")
    if not data_doc:
        raise HTTPException(status_code=503, detail="Data backend unavailable")
    data = data_doc["data"]
    df = pd.DataFrame(data)
    delays_by_cep = df[df["sla_calculated"].isin(["Entregue com atraso", "Fora do prazo"])].groupby("CEP").size().reset_index(name="delays")
    return [DelaysCEPResponse(cep=row["CEP"], delays=row["delays"]) for _, row in delays_by_cep.iterrows()]

@router.get("/overview", response_model=OverviewData)
async def get_overview():
    # Get the latest completed process
    processes = await process_repo.list_all()
    if not processes:
        raise HTTPException(status_code=404, detail="No processed data available")
    
    latest_process = max(processes, key=lambda p: p.get("lastUpdated", ""))
    if latest_process["status"] != "completed":
        raise HTTPException(status_code=404, detail="No completed data available")
    
    job_id = latest_process["id"]
    
    # Get data
    data_doc = await data_repo.get(f"{job_id}_data")
    data = data_doc["data"]
    df = pd.DataFrame(data)
    
    # Calculate metrics
    total_packages = len(df)
    within_sla = len(df[df["sla_calculated"] == "Dentro do prazo"])
    outside_sla = total_packages - within_sla
    within_sla_percentage = (within_sla / total_packages * 100) if total_packages > 0 else 0
    outside_sla_percentage = 100 - within_sla_percentage
    total_delays = len(df[df["sla_calculated"].isin(["Entregue com atraso", "Fora do prazo"])])
    total_sellers = df["Vendedor"].nunique()
    total_zones = df["Zona"].nunique()
    
    metrics = SLAMetrics(
        totalPackages=total_packages,
        withinSla=within_sla,
        outsideSla=outside_sla,
        withinSlaPercentage=within_sla_percentage,
        outsideSlaPercentage=outside_sla_percentage,
        totalDelays=total_delays,
        totalSellers=total_sellers,
        totalZones=total_zones
    )
    
    # SLA by period (assuming month)
    df["period"] = pd.to_datetime(df["data_pedido"], errors='coerce').dt.to_period('M').astype(str)
    sla_by_period = df.groupby("period").agg(
        total=('sla_calculated', 'count'),
        on_time=('sla_calculated', lambda x: (x == "Dentro do prazo").sum())
    ).reset_index()
    sla_by_period["value"] = (sla_by_period["on_time"] / sla_by_period["total"] * 100).round(1)
    sla_by_period_list = [BarChartData(name=row["period"], value=row["value"]) for _, row in sla_by_period.iterrows()]
    
    # Top delayed sellers
    seller_delays = df[df["sla_calculated"].isin(["Entregue com atraso", "Fora do prazo"])].groupby("Vendedor").size().reset_index(name="delays")
    top_delayed_sellers = seller_delays.nlargest(5, "delays")
    top_delayed_sellers_list = [RankingEntry(name=row["Vendedor"], value=int(row["delays"])) for _, row in top_delayed_sellers.iterrows()]
    
    # Top critical zones
    zone_delays = df[df["sla_calculated"].isin(["Entregue com atraso", "Fora do prazo"])].groupby("Zona").size().reset_index(name="delays")
    top_critical_zones = zone_delays.nlargest(5, "delays")
    top_critical_zones_list = [RankingEntry(name=row["Zona"], value=int(row["delays"])) for _, row in top_critical_zones.iterrows()]
    
    # Top problematic CEPs
    cep_delays = df[df["sla_calculated"].isin(["Entregue com atraso", "Fora do prazo"])].groupby("CEP").size().reset_index(name="delays")
    top_problematic_ceps = cep_delays.nlargest(5, "delays")
    top_problematic_ceps_list = [RankingEntry(name=row["CEP"], value=int(row["delays"])) for _, row in top_problematic_ceps.iterrows()]
    
    return OverviewData(
        metrics=metrics,
        slaByPeriod=sla_by_period_list,
        topDelayedSellers=top_delayed_sellers_list,
        topCriticalZones=top_critical_zones_list,
        topProblematicCeps=top_problematic_ceps_list
    )