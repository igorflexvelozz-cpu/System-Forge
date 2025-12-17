import { randomUUID } from "crypto";
import type {
  UploadedFile,
  ProcessingStatus,
  SystemStatus,
  SlaMetrics,
  SellerMetrics,
  ZoneMetrics,
  CepMetrics,
  DailyMetrics,
  RankingEntry,
  BarChartData,
  LineChartData,
  PackageRecord,
  OverviewData,
  SlaPerformanceData,
  DelaysData,
  SellersData,
  ZonesData,
  RankingsData,
  ConsolidatedData,
  HistoricalData,
  FilterOptions
} from "@shared/schema";

export interface IStorage {
  getSystemStatus(): SystemStatus;
  setSystemStatus(status: SystemStatus): void;
  
  getUploadedFiles(): { logmanager: UploadedFile | null; gestora: UploadedFile | null };
  setUploadedFile(fileType: "logmanager" | "gestora", file: UploadedFile | null): void;
  
  getProcessingStatus(): ProcessingStatus;
  setProcessingStatus(status: ProcessingStatus): void;
  
  getPackageRecords(): PackageRecord[];
  setPackageRecords(records: PackageRecord[]): void;
  
  getOverviewData(): OverviewData | null;
  getSlaPerformanceData(filters?: Record<string, string>): SlaPerformanceData | null;
  getDelaysData(): DelaysData | null;
  getSellersData(): SellersData | null;
  getZonesData(): ZonesData | null;
  getRankingsData(): RankingsData | null;
  getConsolidatedData(page?: number, pageSize?: number): ConsolidatedData | null;
  getHistoricalData(mode?: string): HistoricalData | null;
  getFilterOptions(): FilterOptions;
  
  processData(): Promise<void>;
  hasData(): boolean;
}

function generateDemoData(): PackageRecord[] {
  const vendors = [
    "MELI Store Oficial",
    "MELI Electronics BR",
    "MELI Casa & Jardim",
    "MELI Moda Fashion",
    "MELI Tech Solutions",
    "MELI Sports Center",
    "MELI Kids Store",
    "MELI Auto Parts",
    "MELI Pet Shop",
    "MELI Beauty Store"
  ];

  const zones = ["Zona Norte", "Zona Sul", "Zona Leste", "Zona Oeste", "Centro", "ABC", "Interior SP", "Litoral"];
  const cities = ["São Paulo", "Guarulhos", "Osasco", "Santo André", "Campinas", "Santos", "Sorocaba"];
  const bairros = ["Centro", "Vila Mariana", "Moema", "Pinheiros", "Santana", "Tatuapé", "Mooca"];
  const statuses = ["Entregue", "Em trânsito", "Saiu para entrega", "Pendente"];
  const slaOptions: PackageRecord["sla"][] = ["dentro_prazo", "fora_prazo", "atrasado", "nao_entregue"];

  const records: PackageRecord[] = [];
  const now = new Date();

  for (let i = 0; i < 500; i++) {
    const deliveryDays = Math.floor(Math.random() * 10) - 2;
    const orderDate = new Date(now.getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000);
    const expectedDate = new Date(orderDate.getTime() + 3 * 24 * 60 * 60 * 1000);
    const deliveryDate = new Date(expectedDate.getTime() + deliveryDays * 24 * 60 * 60 * 1000);
    
    const isDelivered = Math.random() > 0.1;
    const delay = isDelivered ? Math.max(0, deliveryDays) : 0;
    
    let sla: PackageRecord["sla"];
    if (!isDelivered) {
      sla = "nao_entregue";
    } else if (delay === 0) {
      sla = "dentro_prazo";
    } else if (delay <= 2) {
      sla = "fora_prazo";
    } else {
      sla = "atrasado";
    }

    const cepPrefix = String(Math.floor(Math.random() * 90) + 10);
    const cepSuffix = String(Math.floor(Math.random() * 900) + 100);
    
    records.push({
      id: randomUUID(),
      pedido: `MLB${String(1000000000 + i).slice(1)}`,
      dataPedido: orderDate.toISOString().split("T")[0],
      vendedor: vendors[Math.floor(Math.random() * vendors.length)],
      zona: zones[Math.floor(Math.random() * zones.length)],
      cep: `${cepPrefix}${cepSuffix}-000`,
      cidade: cities[Math.floor(Math.random() * cities.length)],
      bairro: bairros[Math.floor(Math.random() * bairros.length)],
      statusDoDia: isDelivered ? "Entregue" : statuses[Math.floor(Math.random() * 3)],
      statusDiaGestora: isDelivered ? "Entregue" : "Em andamento",
      previsaoEntrega: expectedDate.toISOString().split("T")[0],
      entrega: isDelivered ? deliveryDate.toISOString().split("T")[0] : undefined,
      sla,
      prazo: 3,
      atraso: delay,
      cliente: `Cliente ${i + 1}`,
      nomeComprador: `Comprador ${i + 1}`,
      conta: `Conta ${Math.floor(Math.random() * 5) + 1}`,
      centroDeCusto: `CC-${String(Math.floor(Math.random() * 10) + 1).padStart(3, "0")}`,
      frete: ["Normal", "Expresso", "Full"][Math.floor(Math.random() * 3)],
      responsabilidade: ["Transportadora", "Seller", "MELI"][Math.floor(Math.random() * 3)],
      etiqueta: `ETQ${String(i + 1).padStart(8, "0")}`,
      pacote: `PCK${String(i + 1).padStart(8, "0")}`,
      logradouro: `Rua ${i + 1}`,
      numero: String(Math.floor(Math.random() * 999) + 1),
      complemento: Math.random() > 0.7 ? `Apto ${Math.floor(Math.random() * 100) + 1}` : undefined,
      source: "merged"
    });
  }

  return records;
}

export class MemStorage implements IStorage {
  private systemStatus: SystemStatus = {
    status: "idle",
    lastUpdate: undefined,
    message: "Sistema aguardando dados"
  };

  private uploadedFiles: { logmanager: UploadedFile | null; gestora: UploadedFile | null } = {
    logmanager: null,
    gestora: null
  };

  private processingStatus: ProcessingStatus = {
    status: "idle",
    lastUpdated: new Date().toISOString()
  };

  private packageRecords: PackageRecord[] = [];
  private isInitialized = false;

  constructor() {
    this.initializeDemoData();
  }

  private initializeDemoData() {
    if (this.isInitialized) return;
    
    this.packageRecords = generateDemoData();
    this.systemStatus = {
      status: "processed",
      lastUpdate: new Date().toISOString(),
      message: "Dados demo carregados"
    };
    this.processingStatus = {
      status: "completed",
      currentStep: "Dados carregados com sucesso",
      progress: 100,
      message: "Processamento concluído",
      lastUpdated: new Date().toISOString()
    };
    this.isInitialized = true;
  }

  getSystemStatus(): SystemStatus {
    return this.systemStatus;
  }

  setSystemStatus(status: SystemStatus): void {
    this.systemStatus = status;
  }

  getUploadedFiles() {
    return this.uploadedFiles;
  }

  setUploadedFile(fileType: "logmanager" | "gestora", file: UploadedFile | null): void {
    this.uploadedFiles[fileType] = file;
  }

  getProcessingStatus(): ProcessingStatus {
    return this.processingStatus;
  }

  setProcessingStatus(status: ProcessingStatus): void {
    this.processingStatus = status;
  }

  getPackageRecords(): PackageRecord[] {
    return this.packageRecords;
  }

  setPackageRecords(records: PackageRecord[]): void {
    this.packageRecords = records;
  }

  hasData(): boolean {
    return this.packageRecords.length > 0;
  }

  getFilterOptions(): FilterOptions {
    const records = this.packageRecords;
    const zones = [...new Set(records.map(r => r.zona).filter(Boolean))] as string[];
    const sellers = [...new Set(records.map(r => r.vendedor).filter(Boolean))] as string[];
    const costCenters = [...new Set(records.map(r => r.centroDeCusto).filter(Boolean))] as string[];
    
    const dates = records.map(r => r.dataPedido).filter(Boolean).sort() as string[];
    
    return {
      zones: zones.sort(),
      sellers: sellers.sort(),
      costCenters: costCenters.sort(),
      dateRange: dates.length > 0 ? { min: dates[0], max: dates[dates.length - 1] } : undefined
    };
  }

  getOverviewData(): OverviewData | null {
    if (!this.hasData()) return null;

    const records = this.packageRecords;
    const totalPackages = records.length;
    const withinSla = records.filter(r => r.sla === "dentro_prazo").length;
    const outsideSla = records.filter(r => r.sla !== "dentro_prazo").length;
    const totalDelays = records.filter(r => r.atraso && r.atraso > 0).length;
    const sellers = [...new Set(records.map(r => r.vendedor).filter(Boolean))];
    const zones = [...new Set(records.map(r => r.zona).filter(Boolean))];
    
    const delays = records.map(r => r.atraso || 0).filter(d => d > 0);
    const averageDelay = delays.length > 0 ? delays.reduce((a, b) => a + b, 0) / delays.length : 0;
    const maxDelay = delays.length > 0 ? Math.max(...delays) : 0;

    const metrics: SlaMetrics = {
      totalPackages,
      withinSla,
      outsideSla,
      withinSlaPercentage: totalPackages > 0 ? (withinSla / totalPackages) * 100 : 0,
      outsideSlaPercentage: totalPackages > 0 ? (outsideSla / totalPackages) * 100 : 0,
      totalDelays,
      totalSellers: sellers.length,
      totalZones: zones.length,
      averageDelay,
      maxDelay
    };

    const dateGroups = records.reduce((acc, r) => {
      const date = r.dataPedido || "Unknown";
      if (!acc[date]) acc[date] = { total: 0, withinSla: 0 };
      acc[date].total++;
      if (r.sla === "dentro_prazo") acc[date].withinSla++;
      return acc;
    }, {} as Record<string, { total: number; withinSla: number }>);

    const slaByPeriod: BarChartData[] = Object.entries(dateGroups)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-10)
      .map(([date, data]) => ({
        label: new Date(date).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }),
        value: data.total > 0 ? (data.withinSla / data.total) * 100 : 0
      }));

    const sellerDelays = records.reduce((acc, r) => {
      if (r.vendedor && r.atraso && r.atraso > 0) {
        acc[r.vendedor] = (acc[r.vendedor] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    const topDelayedSellers: RankingEntry[] = Object.entries(sellerDelays)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([name, value], i) => ({
        rank: i + 1,
        name,
        value,
        percentage: totalDelays > 0 ? (value / totalDelays) * 100 : 0
      }));

    const zoneDelays = records.reduce((acc, r) => {
      if (r.zona && r.atraso && r.atraso > 0) {
        acc[r.zona] = (acc[r.zona] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    const topCriticalZones: RankingEntry[] = Object.entries(zoneDelays)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([name, value], i) => ({
        rank: i + 1,
        name,
        value,
        percentage: totalDelays > 0 ? (value / totalDelays) * 100 : 0
      }));

    const cepDelays = records.reduce((acc, r) => {
      if (r.cep && r.atraso && r.atraso > 0) {
        acc[r.cep] = (acc[r.cep] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    const topProblematicCeps: RankingEntry[] = Object.entries(cepDelays)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([name, value], i) => ({
        rank: i + 1,
        name,
        value,
        percentage: totalDelays > 0 ? (value / totalDelays) * 100 : 0
      }));

    return {
      metrics,
      slaByPeriod,
      topDelayedSellers,
      topCriticalZones,
      topProblematicCeps
    };
  }

  getSlaPerformanceData(filters?: Record<string, string>): SlaPerformanceData | null {
    if (!this.hasData()) return null;

    let records = [...this.packageRecords];

    if (filters) {
      if (filters.startDate) {
        records = records.filter(r => r.dataPedido && r.dataPedido >= filters.startDate);
      }
      if (filters.endDate) {
        records = records.filter(r => r.dataPedido && r.dataPedido <= filters.endDate);
      }
      if (filters.zone) {
        records = records.filter(r => r.zona === filters.zone);
      }
      if (filters.seller) {
        records = records.filter(r => r.vendedor === filters.seller);
      }
      if (filters.costCenter) {
        records = records.filter(r => r.centroDeCusto === filters.costCenter);
      }
    }

    const dateGroups = records.reduce((acc, r) => {
      const date = r.dataPedido || "Unknown";
      if (!acc[date]) acc[date] = { total: 0, withinSla: 0 };
      acc[date].total++;
      if (r.sla === "dentro_prazo") acc[date].withinSla++;
      return acc;
    }, {} as Record<string, { total: number; withinSla: number }>);

    const slaTrend: LineChartData[] = Object.entries(dateGroups)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, data]) => ({
        date,
        value: data.total > 0 ? (data.withinSla / data.total) * 100 : 0,
        target: 95
      }));

    return {
      slaTrend,
      records,
      totalRecords: records.length
    };
  }

  getDelaysData(): DelaysData | null {
    if (!this.hasData()) return null;

    const delayRecords = this.packageRecords.filter(r => r.atraso && r.atraso > 0);
    const delays = delayRecords.map(r => r.atraso || 0);

    const metrics = {
      totalDelays: delayRecords.length,
      averageDelay: delays.length > 0 ? delays.reduce((a, b) => a + b, 0) / delays.length : 0,
      maxDelay: delays.length > 0 ? Math.max(...delays) : 0
    };

    const dayGroups = delayRecords.reduce((acc, r) => {
      const date = r.dataPedido || "Unknown";
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const delaysByDay: BarChartData[] = Object.entries(dayGroups)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-10)
      .map(([date, value]) => ({
        label: new Date(date).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }),
        value
      }));

    const zoneGroups = delayRecords.reduce((acc, r) => {
      if (r.zona) acc[r.zona] = (acc[r.zona] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const delaysByZone: BarChartData[] = Object.entries(zoneGroups)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 8)
      .map(([label, value]) => ({ label, value }));

    const cepGroups = delayRecords.reduce((acc, r) => {
      if (r.cep) acc[r.cep] = (acc[r.cep] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const delaysByCep: BarChartData[] = Object.entries(cepGroups)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 8)
      .map(([label, value]) => ({ label, value }));

    const sellerGroups = delayRecords.reduce((acc, r) => {
      if (r.vendedor) acc[r.vendedor] = (acc[r.vendedor] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const delaysBySeller: BarChartData[] = Object.entries(sellerGroups)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 8)
      .map(([label, value]) => ({ label, value }));

    return {
      metrics,
      delaysByDay,
      delaysByZone,
      delaysByCep,
      delaysBySeller
    };
  }

  getSellersData(): SellersData | null {
    if (!this.hasData()) return null;

    const sellerStats = this.packageRecords.reduce((acc, r) => {
      if (!r.vendedor) return acc;
      if (!acc[r.vendedor]) {
        acc[r.vendedor] = { total: 0, withinSla: 0, delays: 0, totalDelay: 0 };
      }
      acc[r.vendedor].total++;
      if (r.sla === "dentro_prazo") acc[r.vendedor].withinSla++;
      if (r.atraso && r.atraso > 0) {
        acc[r.vendedor].delays++;
        acc[r.vendedor].totalDelay += r.atraso;
      }
      return acc;
    }, {} as Record<string, { total: number; withinSla: number; delays: number; totalDelay: number }>);

    const sortedSellers = Object.entries(sellerStats)
      .sort(([, a], [, b]) => b.total - a.total);

    const sellers: SellerMetrics[] = sortedSellers.map(([name, stats], i) => ({
      id: randomUUID(),
      name,
      totalPackages: stats.total,
      totalDelays: stats.delays,
      withinSla: stats.withinSla,
      outsideSla: stats.total - stats.withinSla,
      slaPercentage: stats.total > 0 ? (stats.withinSla / stats.total) * 100 : 0,
      averageDelay: stats.delays > 0 ? stats.totalDelay / stats.delays : 0,
      rank: i + 1
    }));

    const volumeChart: BarChartData[] = sellers.slice(0, 10).map(s => ({
      label: s.name,
      value: s.totalPackages
    }));

    const delaysChart: BarChartData[] = [...sellers]
      .sort((a, b) => b.totalDelays - a.totalDelays)
      .slice(0, 10)
      .map(s => ({
        label: s.name,
        value: s.totalDelays
      }));

    const slaChart: BarChartData[] = sellers.slice(0, 10).map(s => ({
      label: s.name,
      value: s.slaPercentage
    }));

    return {
      sellers,
      volumeChart,
      delaysChart,
      slaChart
    };
  }

  getZonesData(): ZonesData | null {
    if (!this.hasData()) return null;

    const zoneStats = this.packageRecords.reduce((acc, r) => {
      if (!r.zona) return acc;
      if (!acc[r.zona]) {
        acc[r.zona] = { total: 0, withinSla: 0, delays: 0, totalDelay: 0 };
      }
      acc[r.zona].total++;
      if (r.sla === "dentro_prazo") acc[r.zona].withinSla++;
      if (r.atraso && r.atraso > 0) {
        acc[r.zona].delays++;
        acc[r.zona].totalDelay += r.atraso;
      }
      return acc;
    }, {} as Record<string, { total: number; withinSla: number; delays: number; totalDelay: number }>);

    const zones: ZoneMetrics[] = Object.entries(zoneStats).map(([zone, stats]) => ({
      id: randomUUID(),
      zone,
      totalPackages: stats.total,
      totalDelays: stats.delays,
      withinSla: stats.withinSla,
      outsideSla: stats.total - stats.withinSla,
      slaPercentage: stats.total > 0 ? (stats.withinSla / stats.total) * 100 : 0,
      averageDelay: stats.delays > 0 ? stats.totalDelay / stats.delays : 0
    }));

    const cepStats = this.packageRecords.reduce((acc, r) => {
      if (!r.cep) return acc;
      if (!acc[r.cep]) {
        acc[r.cep] = { total: 0, withinSla: 0, delays: 0, totalDelay: 0 };
      }
      acc[r.cep].total++;
      if (r.sla === "dentro_prazo") acc[r.cep].withinSla++;
      if (r.atraso && r.atraso > 0) {
        acc[r.cep].delays++;
        acc[r.cep].totalDelay += r.atraso;
      }
      return acc;
    }, {} as Record<string, { total: number; withinSla: number; delays: number; totalDelay: number }>);

    const ceps: CepMetrics[] = Object.entries(cepStats)
      .sort(([, a], [, b]) => b.delays - a.delays)
      .slice(0, 50)
      .map(([cep, stats]) => ({
        id: randomUUID(),
        cep,
        totalPackages: stats.total,
        totalDelays: stats.delays,
        withinSla: stats.withinSla,
        outsideSla: stats.total - stats.withinSla,
        slaPercentage: stats.total > 0 ? (stats.withinSla / stats.total) * 100 : 0,
        averageDelay: stats.delays > 0 ? stats.totalDelay / stats.delays : 0
      }));

    const zoneDelaysChart: BarChartData[] = zones
      .sort((a, b) => b.totalDelays - a.totalDelays)
      .slice(0, 8)
      .map(z => ({ label: z.zone, value: z.totalDelays }));

    const cepDelaysChart: BarChartData[] = ceps
      .slice(0, 8)
      .map(c => ({ label: c.cep, value: c.totalDelays }));

    return {
      zones,
      ceps,
      zoneDelaysChart,
      cepDelaysChart
    };
  }

  getRankingsData(): RankingsData | null {
    if (!this.hasData()) return null;

    const sellerDelays = this.packageRecords.reduce((acc, r) => {
      if (r.vendedor && r.atraso && r.atraso > 0) {
        acc[r.vendedor] = (acc[r.vendedor] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    const sellersByDelays: RankingEntry[] = Object.entries(sellerDelays)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 15)
      .map(([name, value], i) => ({
        rank: i + 1,
        name,
        value
      }));

    const zoneDelays = this.packageRecords.reduce((acc, r) => {
      if (r.zona && r.atraso && r.atraso > 0) {
        acc[r.zona] = (acc[r.zona] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    const zonesByDelays: RankingEntry[] = Object.entries(zoneDelays)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([name, value], i) => ({
        rank: i + 1,
        name,
        value
      }));

    const sellerVolumes = this.packageRecords.reduce((acc, r) => {
      if (r.vendedor) {
        acc[r.vendedor] = (acc[r.vendedor] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    const sellersByVolume: RankingEntry[] = Object.entries(sellerVolumes)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 15)
      .map(([name, value], i) => ({
        rank: i + 1,
        name,
        value
      }));

    return {
      sellersByDelays,
      zonesByDelays,
      sellersByVolume
    };
  }

  getConsolidatedData(page = 1, pageSize = 50): ConsolidatedData | null {
    if (!this.hasData()) return null;

    const totalRecords = this.packageRecords.length;
    const totalPages = Math.ceil(totalRecords / pageSize);
    const startIndex = (page - 1) * pageSize;
    const records = this.packageRecords.slice(startIndex, startIndex + pageSize);

    return {
      records,
      totalRecords,
      page,
      pageSize,
      totalPages
    };
  }

  getHistoricalData(mode = "week"): HistoricalData | null {
    if (!this.hasData()) return null;

    const records = this.packageRecords;
    
    const dateGroups = records.reduce((acc, r) => {
      const date = r.dataPedido || "Unknown";
      if (!acc[date]) acc[date] = { total: 0, withinSla: 0, delays: 0 };
      acc[date].total++;
      if (r.sla === "dentro_prazo") acc[date].withinSla++;
      if (r.atraso && r.atraso > 0) acc[date].delays++;
      return acc;
    }, {} as Record<string, { total: number; withinSla: number; delays: number }>);

    const sortedDates = Object.keys(dateGroups).sort();
    const midpoint = Math.floor(sortedDates.length / 2);
    
    const previousPeriodDates = sortedDates.slice(0, midpoint);
    const currentPeriodDates = sortedDates.slice(midpoint);

    const calculatePeriodMetrics = (dates: string[]) => {
      let total = 0, withinSla = 0, delays = 0;
      dates.forEach(d => {
        const data = dateGroups[d];
        total += data.total;
        withinSla += data.withinSla;
        delays += data.delays;
      });
      return {
        totalPackages: total,
        withinSla,
        outsideSla: total - withinSla,
        withinSlaPercentage: total > 0 ? (withinSla / total) * 100 : 0,
        outsideSlaPercentage: total > 0 ? ((total - withinSla) / total) * 100 : 0,
        totalDelays: delays,
        totalSellers: 0,
        totalZones: 0,
        averageDelay: 0,
        maxDelay: 0
      };
    };

    const previous = calculatePeriodMetrics(previousPeriodDates);
    const current = calculatePeriodMetrics(currentPeriodDates);
    const percentageChange = previous.withinSlaPercentage > 0 
      ? ((current.withinSlaPercentage - previous.withinSlaPercentage) / previous.withinSlaPercentage) * 100
      : 0;

    const slaEvolution: LineChartData[] = Object.entries(dateGroups)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, data]) => ({
        date,
        value: data.total > 0 ? (data.withinSla / data.total) * 100 : 0,
        target: 95
      }));

    const delayTrend: LineChartData[] = Object.entries(dateGroups)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, data]) => ({
        date,
        value: data.delays
      }));

    const sellerStats = records.reduce((acc, r) => {
      if (!r.vendedor) return acc;
      const date = r.dataPedido || "Unknown";
      if (!acc[r.vendedor]) acc[r.vendedor] = {};
      if (!acc[r.vendedor][date]) acc[r.vendedor][date] = { total: 0, withinSla: 0 };
      acc[r.vendedor][date].total++;
      if (r.sla === "dentro_prazo") acc[r.vendedor][date].withinSla++;
      return acc;
    }, {} as Record<string, Record<string, { total: number; withinSla: number }>>);

    const sellerPerformance = Object.entries(sellerStats)
      .slice(0, 10)
      .map(([seller, dates]) => ({
        seller,
        periods: Object.entries(dates)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([period, data]) => ({
            period,
            slaPercentage: data.total > 0 ? (data.withinSla / data.total) * 100 : 0
          }))
      }));

    return {
      slaEvolution,
      delayTrend,
      periodComparison: {
        current,
        previous,
        percentageChange
      },
      sellerPerformance
    };
  }

  async processData(): Promise<void> {
    this.setProcessingStatus({
      status: "processing",
      currentStep: "Iniciando processamento...",
      progress: 0,
      lastUpdated: new Date().toISOString()
    });

    await new Promise(r => setTimeout(r, 500));

    this.setProcessingStatus({
      status: "processing",
      currentStep: "Validando dados...",
      progress: 25,
      lastUpdated: new Date().toISOString()
    });

    await new Promise(r => setTimeout(r, 500));

    this.setProcessingStatus({
      status: "processing",
      currentStep: "Mesclando planilhas...",
      progress: 50,
      lastUpdated: new Date().toISOString()
    });

    await new Promise(r => setTimeout(r, 500));

    this.setProcessingStatus({
      status: "processing",
      currentStep: "Calculando SLA...",
      progress: 75,
      lastUpdated: new Date().toISOString()
    });

    await new Promise(r => setTimeout(r, 500));

    this.packageRecords = generateDemoData();

    this.setProcessingStatus({
      status: "completed",
      currentStep: "Processamento concluído",
      progress: 100,
      message: `${this.packageRecords.length} registros processados`,
      lastUpdated: new Date().toISOString()
    });

    this.setSystemStatus({
      status: "processed",
      lastUpdate: new Date().toISOString(),
      message: "Dados processados com sucesso"
    });
  }
}

export const storage = new MemStorage();
