from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime

# Upload models
class UploadResponse(BaseModel):
    job_id: str
    message: str

# Process models
class ProcessStartRequest(BaseModel):
    mother_file_id: str
    loose_file_id: str

class ProcessStatusResponse(BaseModel):
    job_id: str
    status: str  # pending, processing, completed, failed
    progress: Optional[float]
    message: Optional[str]

class LogEntry(BaseModel):
    timestamp: datetime
    level: str
    message: str

class LogsResponse(BaseModel):
    job_id: str
    logs: List[LogEntry]

# SLA models
class SLAGeneralResponse(BaseModel):
    total_orders: int
    on_time: int
    late: int
    sla_percentage: float

class SLAPeriodResponse(BaseModel):
    period: str
    sla_percentage: float

class SLASellerResponse(BaseModel):
    seller: str
    sla_percentage: float

class SLAZoneResponse(BaseModel):
    zone: str
    sla_percentage: float

class SLACEPResponse(BaseModel):
    cep: str
    sla_percentage: float

# Delays models
class DelaysGeneralResponse(BaseModel):
    total_delays: int
    average_delay_days: float

class DelaysDayResponse(BaseModel):
    date: str
    delays: int

class DelaysSellerResponse(BaseModel):
    seller: str
    delays: int

class DelaysZoneResponse(BaseModel):
    zone: str
    delays: int

class DelaysCEPResponse(BaseModel):
    cep: str
    delays: int

# Rankings models
class RankingItem(BaseModel):
    name: str
    volume: int
    delays: int
    sla_percentage: float

class RankingsResponse(BaseModel):
    sellers_most_delays: List[RankingItem]
    zones_most_delays: List[RankingItem]
    sellers_highest_volume: List[RankingItem]

# Consolidated models
class ConsolidatedRecord(BaseModel):
    # Define based on merged data
    pedido: Optional[str]
    data_pedido: Optional[str]
    status_dia: Optional[str]
    beep_dia: Optional[str]
    cliente: Optional[str]
    conta: Optional[str]
    zona: Optional[str]
    responsabilidade: Optional[str]
    bipagem: Optional[str]
    criacao: Optional[str]
    deveria_ser_entregue: Optional[str]
    pacote: Optional[str]
    etiqueta: Optional[str]
    pedido_marketplace: Optional[str]
    frete: Optional[str]
    vendedor: Optional[str]
    centro_custo: Optional[str]
    nome_comprador: Optional[str]
    cep: Optional[str]
    logradouro: Optional[str]
    numero: Optional[str]
    bairro: Optional[str]
    cidade: Optional[str]
    complemento: Optional[str]
    data_status_dia: Optional[str]
    previsao_entrega: Optional[str]
    entrega: Optional[str]
    sla: Optional[str]
    prazo: Optional[str]
    atraso: Optional[str]
    # Add more if needed

class ConsolidatedResponse(BaseModel):
    records: List[ConsolidatedRecord]
    total: int
    page: int
    page_size: int

# History models
class HistoryComparisonResponse(BaseModel):
    period1: str
    period2: str
    sla_period1: float
    sla_period2: float
    difference: float

class HistoryEvolutionResponse(BaseModel):
    date: str
    sla_percentage: float

class HistoryTrendsResponse(BaseModel):
    trend: str  # e.g., "increasing", "decreasing"
    description: str

# Overview models
class SLAMetrics(BaseModel):
    totalPackages: int
    withinSla: int
    outsideSla: int
    withinSlaPercentage: float
    outsideSlaPercentage: float
    totalDelays: int
    totalSellers: int
    totalZones: int

class BarChartData(BaseModel):
    # Label is used as the X-axis category in the frontend
    label: str
    value: float
    color: Optional[str] = None

class RankingEntry(BaseModel):
    rank: Optional[int] = None
    name: str
    value: int
    percentage: Optional[float] = None
    secondaryValue: Optional[float] = None

class OverviewData(BaseModel):
    metrics: SLAMetrics
    slaByPeriod: List[BarChartData]
    topDelayedSellers: List[RankingEntry]
    topCriticalZones: List[RankingEntry]
    topProblematicCeps: List[RankingEntry]


# ============================================
# Shared dashboard models (mirror of shared/schema.ts)
# ============================================


class LineChartData(BaseModel):
    date: str
    value: float
    target: Optional[float] = None


class PackageRecord(BaseModel):
    id: str
    dataPedido: Optional[str] = None
    pedido: str
    statusDoDia: Optional[str] = None
    beepDoDia: Optional[str] = None
    cliente: Optional[str] = None
    conta: Optional[str] = None
    zona: Optional[str] = None
    responsabilidade: Optional[str] = None
    bipagem: Optional[str] = None
    criacao: Optional[str] = None
    deveriaSerEntregue: Optional[str] = None
    pacote: Optional[str] = None
    etiqueta: Optional[str] = None
    pedidoMarketplace: Optional[str] = None
    frete: Optional[str] = None
    vendedor: Optional[str] = None
    centroDeCusto: Optional[str] = None
    statusDiaGestora: Optional[str] = None
    nomeComprador: Optional[str] = None
    cep: Optional[str] = None
    logradouro: Optional[str] = None
    numero: Optional[str] = None
    bairro: Optional[str] = None
    cidade: Optional[str] = None
    complemento: Optional[str] = None
    dataStatusDia: Optional[str] = None
    previsaoEntrega: Optional[str] = None
    entrega: Optional[str] = None
    sla: Optional[str] = None
    prazo: Optional[float] = None
    atraso: Optional[float] = None
    source: Optional[str] = None


# SLA metrics with delay stats (used in HistoricalData)
class ExtendedSLAMetrics(SLAMetrics):
    averageDelay: Optional[float] = None
    maxDelay: Optional[float] = None


class SellerMetrics(BaseModel):
    id: str
    name: str
    totalPackages: int
    totalDelays: int
    withinSla: int
    outsideSla: int
    slaPercentage: float
    averageDelay: float
    rank: int


class ZoneMetrics(BaseModel):
    id: str
    zone: str
    totalPackages: int
    totalDelays: int
    withinSla: int
    outsideSla: int
    slaPercentage: float
    averageDelay: float


class CepMetrics(BaseModel):
    id: str
    cep: str
    totalPackages: int
    totalDelays: int
    withinSla: int
    outsideSla: int
    slaPercentage: float
    averageDelay: float


class DelaysMetrics(BaseModel):
    totalDelays: int
    averageDelay: float
    maxDelay: int


class DelaysData(BaseModel):
    metrics: DelaysMetrics
    delaysByDay: List[BarChartData]
    delaysByZone: List[BarChartData]
    delaysByCep: List[BarChartData]
    delaysBySeller: List[BarChartData]


class SellersData(BaseModel):
    sellers: List[SellerMetrics]
    volumeChart: List[BarChartData]
    delaysChart: List[BarChartData]
    slaChart: List[BarChartData]


class ZonesData(BaseModel):
    zones: List[ZoneMetrics]
    ceps: List[CepMetrics]
    zoneDelaysChart: List[BarChartData]
    cepDelaysChart: List[BarChartData]


class RankingsData(BaseModel):
    sellersByDelays: List[RankingEntry]
    zonesByDelays: List[RankingEntry]
    sellersByVolume: List[RankingEntry]


class SlaPerformanceData(BaseModel):
    slaTrend: List[LineChartData]
    records: List[PackageRecord]
    totalRecords: int


class HistoricalPeriodComparison(BaseModel):
    current: SLAMetrics
    previous: SLAMetrics
    percentageChange: float


class SellerPerformancePeriod(BaseModel):
    period: str
    slaPercentage: float


class SellerPerformanceEntry(BaseModel):
    seller: str
    periods: List[SellerPerformancePeriod]


class HistoricalData(BaseModel):
    slaEvolution: List[LineChartData]
    delayTrend: List[LineChartData]
    periodComparison: HistoricalPeriodComparison
    sellerPerformance: List[SellerPerformanceEntry]


class DateRange(BaseModel):
    min: str
    max: str


class FilterOptions(BaseModel):
    zones: List[str]
    sellers: List[str]
    costCenters: List[str]
    dateRange: Optional[DateRange] = None