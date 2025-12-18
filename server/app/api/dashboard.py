from fastapi import APIRouter, HTTPException
from ..models import (
    OverviewData,
    SLAMetrics,
    BarChartData,
    RankingEntry,
    DelaysData,
    SellersData,
    ZonesData,
    SellerMetrics,
    ZoneMetrics,
    CepMetrics,
    SlaPerformanceData,
    PackageRecord,
    HistoricalData,
    FilterOptions,
)
from ..repositories import DataRepository, ProcessRepository, SLARepository, RankingsRepository
from ..analytics import AnalyticsEngine
from typing import List, Dict, Any
import pandas as pd

router = APIRouter()

data_repo = DataRepository()
process_repo = ProcessRepository()
sla_repo = SLARepository()
rankings_repo = RankingsRepository()


async def _get_latest_completed_job() -> str:
    """Return the job_id of the latest completed process or raise 404."""
    processes = await process_repo.list_all()
    if not processes:
        raise HTTPException(status_code=404, detail="No processed data available")

    latest_process = max(processes, key=lambda p: p.get("lastUpdated", ""))
    if latest_process.get("status") != "completed":
        raise HTTPException(status_code=404, detail="No completed data available")

    return latest_process["id"]


def _load_dataframe(data: List[Dict[str, Any]]) -> pd.DataFrame:
    df = pd.DataFrame(data)
    if df.empty:
        raise HTTPException(status_code=404, detail="No processed data available")
    return df


@router.get("/overview", response_model=OverviewData)
async def get_overview():
    job_id = await _get_latest_completed_job()

    data_doc = await data_repo.get(f"{job_id}_data")
    if not data_doc:
        raise HTTPException(status_code=503, detail="Data backend unavailable")

    data = data_doc["data"]
    df = _load_dataframe(data)
    
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
    sla_by_period_list = [
        BarChartData(label=row["period"], value=float(row["value"]))
        for _, row in sla_by_period.iterrows()
    ]
    
    # Top delayed sellers
    seller_delays = (
        df[df["sla_calculated"].isin(["Entregue com atraso", "Fora do prazo"])]
        .groupby("Vendedor")
        .size()
        .reset_index(name="delays")
    )
    top_delayed_sellers = seller_delays.nlargest(5, "delays")
    top_delayed_sellers_list = [
        RankingEntry(name=row["Vendedor"], value=int(row["delays"]))
        for _, row in top_delayed_sellers.iterrows()
    ]
    
    # Top critical zones
    zone_delays = (
        df[df["sla_calculated"].isin(["Entregue com atraso", "Fora do prazo"])]
        .groupby("Zona")
        .size()
        .reset_index(name="delays")
    )
    top_critical_zones = zone_delays.nlargest(5, "delays")
    top_critical_zones_list = [
        RankingEntry(name=row["Zona"], value=int(row["delays"]))
        for _, row in top_critical_zones.iterrows()
    ]

    # Top problematic CEPs
    cep_delays = (
        df[df["sla_calculated"].isin(["Entregue com atraso", "Fora do prazo"])]
        .groupby("CEP")
        .size()
        .reset_index(name="delays")
    )
    top_problematic_ceps = cep_delays.nlargest(5, "delays")
    top_problematic_ceps_list = [
        RankingEntry(name=row["CEP"], value=int(row["delays"]))
        for _, row in top_problematic_ceps.iterrows()
    ]
    
    return OverviewData(
        metrics=metrics,
        slaByPeriod=sla_by_period_list,
        topDelayedSellers=top_delayed_sellers_list,
        topCriticalZones=top_critical_zones_list,
        topProblematicCeps=top_problematic_ceps_list,
    )


@router.get("/delays", response_model=DelaysData)
async def get_delays():
    """Aggregated delays view used by the frontend dashboard."""
    job_id = await _get_latest_completed_job()

    data_doc = await data_repo.get(f"{job_id}_data")
    if not data_doc:
        raise HTTPException(status_code=503, detail="Data backend unavailable")

    data = data_doc["data"]
    df = _load_dataframe(data)

    delayed = df[df["sla_calculated"].isin(["Entregue com atraso", "Fora do prazo"])]

    total_delays = int(len(delayed))
    average_delay = float(pd.to_numeric(delayed.get("Atraso"), errors="coerce").fillna(0).mean() or 0)
    max_delay = int(pd.to_numeric(delayed.get("Atraso"), errors="coerce").fillna(0).max() or 0)

    # Delays by day
    delays_by_day_df = (
        delayed.groupby("data_status_dia")
        .size()
        .reset_index(name="delays")
        .sort_values("data_status_dia")
    )
    delays_by_day = [
        BarChartData(label=str(row["data_status_dia"]), value=int(row["delays"]))
        for _, row in delays_by_day_df.iterrows()
    ]

    # Delays by zone
    delays_by_zone_df = (
        delayed.groupby("Zona")
        .size()
        .reset_index(name="delays")
        .sort_values("delays", ascending=False)
    )
    delays_by_zone = [
        BarChartData(label=str(row["Zona"]), value=int(row["delays"]))
        for _, row in delays_by_zone_df.iterrows()
    ]

    # Delays by CEP
    delays_by_cep_df = (
        delayed.groupby("CEP")
        .size()
        .reset_index(name="delays")
        .sort_values("delays", ascending=False)
    )
    delays_by_cep = [
        BarChartData(label=str(row["CEP"]), value=int(row["delays"]))
        for _, row in delays_by_cep_df.iterrows()
    ]

    # Delays by seller
    delays_by_seller_df = (
        delayed.groupby("Vendedor")
        .size()
        .reset_index(name="delays")
        .sort_values("delays", ascending=False)
    )
    delays_by_seller = [
        BarChartData(label=str(row["Vendedor"]), value=int(row["delays"]))
        for _, row in delays_by_seller_df.iterrows()
    ]

    return DelaysData(
        metrics={
            "totalDelays": total_delays,
            "averageDelay": average_delay,
            "maxDelay": max_delay,
        },
        delaysByDay=delays_by_day,
        delaysByZone=delays_by_zone,
        delaysByCep=delays_by_cep,
        delaysBySeller=delays_by_seller,
    )


@router.get("/sellers", response_model=SellersData)
async def get_sellers():
    """Seller-level performance metrics and charts."""
    job_id = await _get_latest_completed_job()

    data_doc = await data_repo.get(f"{job_id}_data")
    if not data_doc:
        raise HTTPException(status_code=503, detail="Data backend unavailable")

    data = data_doc["data"]
    df = _load_dataframe(data)

    # Base aggregations by seller
    grouped = df.groupby("Vendedor")

    total_packages = grouped.size().rename("total_packages")
    delays = grouped.apply(
        lambda g: g["sla_calculated"].isin(["Entregue com atraso", "Fora do prazo"]).sum()
    ).rename("total_delays")
    within_sla = grouped.apply(lambda g: (g["sla_calculated"] == "Dentro do prazo").sum()).rename(
        "within_sla"
    )

    outside_sla = (total_packages - within_sla).rename("outside_sla")

    avg_delay = grouped.apply(
        lambda g: pd.to_numeric(g.get("Atraso"), errors="coerce").fillna(0).mean()
    ).rename("average_delay")

    sellers_df = (
        pd.concat([total_packages, delays, within_sla, outside_sla, avg_delay], axis=1)
        .reset_index()
        .rename(columns={"Vendedor": "name"})
    )

    sellers_df["sla_percentage"] = (
        sellers_df["within_sla"] / sellers_df["total_packages"] * 100
    ).fillna(0)

    sellers_df = sellers_df.sort_values("sla_percentage", ascending=False)
    sellers_df["rank"] = range(1, len(sellers_df) + 1)

    seller_metrics: List[SellerMetrics] = []
    for _, row in sellers_df.iterrows():
        seller_metrics.append(
            SellerMetrics(
                id=str(row["name"]),
                name=str(row["name"]),
                totalPackages=int(row["total_packages"]),
                totalDelays=int(row["total_delays"]),
                withinSla=int(row["within_sla"]),
                outsideSla=int(row["outside_sla"]),
                slaPercentage=float(row["sla_percentage"]),
                averageDelay=float(row["average_delay"] or 0),
                rank=int(row["rank"]),
            )
        )

    # Charts
    top_for_charts = sellers_df.head(20)

    volume_chart = [
        BarChartData(label=str(row["name"]), value=int(row["total_packages"]))
        for _, row in top_for_charts.iterrows()
    ]
    delays_chart = [
        BarChartData(label=str(row["name"]), value=int(row["total_delays"]))
        for _, row in top_for_charts.iterrows()
    ]
    sla_chart = [
        BarChartData(label=str(row["name"]), value=float(row["sla_percentage"]))
        for _, row in top_for_charts.iterrows()
    ]

    return SellersData(
        sellers=seller_metrics,
        volumeChart=volume_chart,
        delaysChart=delays_chart,
        slaChart=sla_chart,
    )


@router.get("/zones", response_model=ZonesData)
async def get_zones():
    """Zone and CEP level performance metrics."""
    job_id = await _get_latest_completed_job()

    data_doc = await data_repo.get(f"{job_id}_data")
    if not data_doc:
        raise HTTPException(status_code=503, detail="Data backend unavailable")

    data = data_doc["data"]
    df = _load_dataframe(data)

    # Zone metrics
    zone_group = df.groupby("Zona")

    zone_total = zone_group.size().rename("total_packages")
    zone_delays = zone_group.apply(
        lambda g: g["sla_calculated"].isin(["Entregue com atraso", "Fora do prazo"]).sum()
    ).rename("total_delays")
    zone_within = zone_group.apply(
        lambda g: (g["sla_calculated"] == "Dentro do prazo").sum()
    ).rename("within_sla")
    zone_outside = (zone_total - zone_within).rename("outside_sla")
    zone_avg_delay = zone_group.apply(
        lambda g: pd.to_numeric(g.get("Atraso"), errors="coerce").fillna(0).mean()
    ).rename("average_delay")

    zone_df = (
        pd.concat([zone_total, zone_delays, zone_within, zone_outside, zone_avg_delay], axis=1)
        .reset_index()
        .rename(columns={"Zona": "zone"})
    )
    zone_df["sla_percentage"] = (
        zone_df["within_sla"] / zone_df["total_packages"] * 100
    ).fillna(0)

    zones: List[ZoneMetrics] = []
    for _, row in zone_df.iterrows():
        zones.append(
            ZoneMetrics(
                id=str(row["zone"]),
                zone=str(row["zone"]),
                totalPackages=int(row["total_packages"]),
                totalDelays=int(row["total_delays"]),
                withinSla=int(row["within_sla"]),
                outsideSla=int(row["outside_sla"]),
                slaPercentage=float(row["sla_percentage"]),
                averageDelay=float(row["average_delay"] or 0),
            )
        )

    # CEP metrics
    cep_group = df.groupby("CEP")

    cep_total = cep_group.size().rename("total_packages")
    cep_delays = cep_group.apply(
        lambda g: g["sla_calculated"].isin(["Entregue com atraso", "Fora do prazo"]).sum()
    ).rename("total_delays")
    cep_within = cep_group.apply(
        lambda g: (g["sla_calculated"] == "Dentro do prazo").sum()
    ).rename("within_sla")
    cep_outside = (cep_total - cep_within).rename("outside_sla")
    cep_avg_delay = cep_group.apply(
        lambda g: pd.to_numeric(g.get("Atraso"), errors="coerce").fillna(0).mean()
    ).rename("average_delay")

    cep_df = (
        pd.concat([cep_total, cep_delays, cep_within, cep_outside, cep_avg_delay], axis=1)
        .reset_index()
        .rename(columns={"CEP": "cep"})
    )
    cep_df["sla_percentage"] = (cep_df["within_sla"] / cep_df["total_packages"] * 100).fillna(0)

    ceps: List[CepMetrics] = []
    for _, row in cep_df.iterrows():
        ceps.append(
            CepMetrics(
                id=str(row["cep"]),
                cep=str(row["cep"]),
                totalPackages=int(row["total_packages"]),
                totalDelays=int(row["total_delays"]),
                withinSla=int(row["within_sla"]),
                outsideSla=int(row["outside_sla"]),
                slaPercentage=float(row["sla_percentage"]),
                averageDelay=float(row["average_delay"] or 0),
            )
        )

    # Charts based on delays
    zone_delays_chart = [
        BarChartData(label=str(row["zone"]), value=int(row["total_delays"]))
        for _, row in zone_df.sort_values("total_delays", ascending=False).iterrows()
    ]
    cep_delays_chart = [
        BarChartData(label=str(row["cep"]), value=int(row["total_delays"]))
        for _, row in cep_df.sort_values("total_delays", ascending=False).iterrows()
    ]

    return ZonesData(
        zones=zones,
        ceps=ceps,
        zoneDelaysChart=zone_delays_chart,
        cepDelaysChart=cep_delays_chart,
    )


@router.get("/rankings", response_model="RankingsData")
async def get_rankings_dashboard():
    """
    Rankings view used by the frontend dashboard.
    Uses the precomputed rankings document produced during processing.
    """
    job_id = await _get_latest_completed_job()

    rankings = await rankings_repo.get(f"{job_id}_rankings")
    if not rankings:
        raise HTTPException(status_code=503, detail="Data backend unavailable")

    sellers_most_delays = rankings.get("sellers_most_delays", [])
    zones_most_delays = rankings.get("zones_most_delays", [])
    sellers_highest_volume = rankings.get("sellers_highest_volume", [])

    from ..models import RankingsData as RankingsDataModel

    def to_ranking_entries(items, name_key: str, value_key: str) -> List[RankingEntry]:
        entries: List[RankingEntry] = []
        for idx, item in enumerate(items, start=1):
            entries.append(
                RankingEntry(
                    rank=idx,
                    name=str(item.get(name_key)),
                    value=int(item.get(value_key, 0)),
                    percentage=float(item.get("sla_percentage", 0)),
                )
            )
        return entries

    sellers_by_delays = to_ranking_entries(sellers_most_delays, "Vendedor", "delays")
    zones_by_delays = to_ranking_entries(zones_most_delays, "Zona", "delays")
    sellers_by_volume = to_ranking_entries(sellers_highest_volume, "Vendedor", "volume")

    return RankingsDataModel(
        sellersByDelays=sellers_by_delays,
        zonesByDelays=zones_by_delays,
        sellersByVolume=sellers_by_volume,
    )


@router.get("/sla-performance", response_model=SlaPerformanceData)
async def get_sla_performance(
    startDate: str | None = None,
    endDate: str | None = None,
    zone: str | None = None,
    seller: str | None = None,
    costCenter: str | None = None,
):
    """Detailed SLA performance data with optional filters."""
    job_id = await _get_latest_completed_job()

    data_doc = await data_repo.get(f"{job_id}_data")
    if not data_doc:
        raise HTTPException(status_code=503, detail="Data backend unavailable")

    data = data_doc["data"]
    df = _load_dataframe(data)

    # Apply filters
    if startDate:
        df = df[df["data_pedido"] >= startDate]
    if endDate:
        df = df[df["data_pedido"] <= endDate]
    if zone:
        df = df[df["Zona"].str.contains(zone, case=False, na=False)]
    if seller:
        df = df[df["Vendedor"].str.contains(seller, case=False, na=False)]
    if costCenter:
        df = df[df.get("Centro de custo", "").astype(str).str.contains(costCenter, case=False, na=False)]

    # Trend by date
    trend_df = (
        df.groupby("data_pedido")
        .agg(
            total=("sla_calculated", "count"),
            on_time=("sla_calculated", lambda x: (x == "Dentro do prazo").sum()),
        )
        .reset_index()
        .sort_values("data_pedido")
    )
    trend_df["value"] = (trend_df["on_time"] / trend_df["total"] * 100).round(2)

    from ..models import LineChartData

    sla_trend = [
        LineChartData(date=str(row["data_pedido"]), value=float(row["value"]))
        for _, row in trend_df.iterrows()
    ]

    # Records mapped to PackageRecord schema
    records: List[PackageRecord] = []
    for _, row in df.iterrows():
        record = PackageRecord(
            id=str(row.get("Pedido") or row.get("pedido_marketplace")),
            dataPedido=row.get("data_pedido"),
            pedido=str(row.get("Pedido") or ""),
            statusDoDia=row.get("Status do Dia"),
            beepDoDia=row.get("Beep do Dia"),
            cliente=row.get("Cliente"),
            conta=row.get("Conta"),
            zona=row.get("Zona"),
            responsabilidade=row.get("Responsabilidade"),
            bipagem=row.get("Bipagem"),
            criacao=row.get("criacao"),
            deveriaSerEntregue=row.get("deveria_ser_entregue"),
            pacote=row.get("pacote"),
            etiqueta=row.get("etiqueta"),
            pedidoMarketplace=str(row.get("pedido_marketplace") or ""),
            frete=row.get("Frete"),
            vendedor=row.get("Vendedor"),
            centroDeCusto=row.get("Centro de custo"),
            statusDiaGestora=row.get("status_dia"),
            nomeComprador=row.get("Nome Comprador"),
            cep=row.get("CEP"),
            logradouro=row.get("Logradouro"),
            numero=row.get("Número"),
            bairro=row.get("Bairro"),
            cidade=row.get("Cidade"),
            complemento=row.get("Complemento"),
            dataStatusDia=row.get("data_status_dia"),
            previsaoEntrega=row.get("PREVISÃO DE ENTREGA"),
            entrega=row.get("ENTREGA"),
            sla=None,
            prazo=None,
            atraso=None,
            source="merged",
        )
        records.append(record)

    return SlaPerformanceData(
        slaTrend=sla_trend,
        records=records,
        totalRecords=len(records),
    )


@router.get("/historical", response_model=HistoricalData)
async def get_historical(comparisonMode: str = "week"):
    """
    Simple historical comparison between the last two completed processes.
    This is enough to drive the frontend Historical page.
    """
    processes = await process_repo.list_all()
    completed = [p for p in processes if p.get("status") == "completed"]
    if not completed:
        raise HTTPException(status_code=404, detail="No completed data available")

    completed = sorted(completed, key=lambda p: p.get("lastUpdated", ""))
    current = completed[-1]
    previous = completed[-2] if len(completed) > 1 else current

    async def _load_kpis(job_id: str) -> Dict[str, Any]:
        kpis = await sla_repo.get(f"{job_id}_kpis")
        if not kpis:
            raise HTTPException(status_code=503, detail="Data backend unavailable")
        return kpis

    current_kpis = await _load_kpis(current["id"])
    previous_kpis = await _load_kpis(previous["id"])

    # Build SLA evolution and delay trend from current job
    data_doc = await data_repo.get(f"{current['id']}_data")
    if not data_doc:
        raise HTTPException(status_code=503, detail="Data backend unavailable")

    df = _load_dataframe(data_doc["data"])

    # SLA evolution
    sla_evolution_df = (
        df.groupby("data_pedido")
        .agg(
            total=("sla_calculated", "count"),
            on_time=("sla_calculated", lambda x: (x == "Dentro do prazo").sum()),
        )
        .reset_index()
        .sort_values("data_pedido")
    )
    sla_evolution_df["value"] = (sla_evolution_df["on_time"] / sla_evolution_df["total"] * 100).round(
        2
    )

    from ..models import LineChartData

    sla_evolution = [
        LineChartData(date=str(row["data_pedido"]), value=float(row["value"]))
        for _, row in sla_evolution_df.iterrows()
    ]

    # Delay trend
    delayed = df[df["sla_calculated"].isin(["Entregue com atraso", "Fora do prazo"])]
    delay_trend_df = (
        delayed.groupby("data_status_dia")
        .size()
        .reset_index(name="value")
        .sort_values("data_status_dia")
    )
    delay_trend = [
        LineChartData(date=str(row["data_status_dia"]), value=float(row["value"]))
        for _, row in delay_trend_df.iterrows()
    ]

    # Period comparison mapped to shared schema
    from ..models import SLAMetrics as BackendSlaMetrics

    def _to_shared_sla_metrics(kpis: Dict[str, Any]) -> BackendSlaMetrics:
        total = int(kpis.get("total_orders", 0))
        on_time = int(kpis.get("on_time", 0))
        late = int(kpis.get("late", 0))
        within_pct = float(kpis.get("sla_percentage", 0))
        outside_pct = 100.0 - within_pct
        return BackendSlaMetrics(
            totalPackages=total,
            withinSla=on_time,
            outsideSla=late,
            withinSlaPercentage=within_pct,
            outsideSlaPercentage=outside_pct,
            totalDelays=late,
            totalSellers=0,
            totalZones=0,
        )

    current_metrics = _to_shared_sla_metrics(current_kpis)
    previous_metrics = _to_shared_sla_metrics(previous_kpis)

    percentage_change = current_metrics.withinSlaPercentage - previous_metrics.withinSlaPercentage

    # Seller performance (very simplified: latest SLA per seller)
    seller_group = df.groupby("Vendedor")
    seller_perf = []
    for seller, g in seller_group:
        total = len(g)
        on_time = (g["sla_calculated"] == "Dentro do prazo").sum()
        sla_pct = (on_time / total * 100) if total > 0 else 0
        seller_perf.append(
            {
                "seller": str(seller),
                "periods": [
                    {
                        "period": "current",
                        "slaPercentage": sla_pct,
                    }
                ],
            }
        )

    from ..models import HistoricalData as HistoricalDataModel

    return HistoricalDataModel(
        slaEvolution=sla_evolution,
        delayTrend=delay_trend,
        periodComparison={
            "current": current_metrics,
            "previous": previous_metrics,
            "percentageChange": percentage_change,
        },
        sellerPerformance=seller_perf,
    )


@router.get("/filters", response_model=FilterOptions)
async def get_filters():
    """
    Filter options for the SLA performance page.
    Extracts distinct zones, sellers and cost centers plus min/max date range.
    """
    job_id = await _get_latest_completed_job()

    data_doc = await data_repo.get(f"{job_id}_data")
    if not data_doc:
        raise HTTPException(status_code=503, detail="Data backend unavailable")

    df = _load_dataframe(data_doc["data"])

    zones = sorted(set(df.get("Zona", []).dropna().astype(str)))
    sellers = sorted(set(df.get("Vendedor", []).dropna().astype(str)))
    cost_centers = sorted(set(df.get("Centro de custo", []).dropna().astype(str)))

    date_series = pd.to_datetime(df.get("data_pedido"), errors="coerce")
    if date_series.notna().any():
        min_date = date_series.min().strftime("%Y-%m-%d")
        max_date = date_series.max().strftime("%Y-%m-%d")
        date_range = {"min": min_date, "max": max_date}
    else:
        date_range = None

    return FilterOptions(
        zones=zones,
        sellers=sellers,
        costCenters=cost_centers,
        dateRange=date_range,
    )