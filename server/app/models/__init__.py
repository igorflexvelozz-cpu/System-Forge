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
    name: str
    value: float

class RankingEntry(BaseModel):
    name: str
    value: int

class OverviewData(BaseModel):
    metrics: SLAMetrics
    slaByPeriod: List[BarChartData]
    topDelayedSellers: List[RankingEntry]
    topCriticalZones: List[RankingEntry]
    topProblematicCeps: List[RankingEntry]