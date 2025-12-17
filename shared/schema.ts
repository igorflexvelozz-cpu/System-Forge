import { z } from "zod";

// ============================================
// UPLOAD & FILE PROCESSING TYPES
// ============================================

export const fileUploadStatusSchema = z.enum([
  "pending",
  "validating",
  "processing",
  "completed",
  "error"
]);

export type FileUploadStatus = z.infer<typeof fileUploadStatusSchema>;

export const uploadedFileSchema = z.object({
  id: z.string(),
  filename: z.string(),
  fileType: z.enum(["logmanager", "gestora"]),
  status: fileUploadStatusSchema,
  totalRows: z.number().optional(),
  validRows: z.number().optional(),
  invalidRows: z.number().optional(),
  uploadedAt: z.string(),
  processedAt: z.string().optional(),
  errors: z.array(z.string()).optional(),
  columnValidation: z.object({
    valid: z.boolean(),
    missingColumns: z.array(z.string()).optional(),
    extraColumns: z.array(z.string()).optional()
  }).optional()
});

export type UploadedFile = z.infer<typeof uploadedFileSchema>;

export const processingStatusSchema = z.object({
  status: z.enum(["idle", "processing", "completed", "error"]),
  currentStep: z.string().optional(),
  progress: z.number().optional(),
  message: z.string().optional(),
  lastUpdated: z.string()
});

export type ProcessingStatus = z.infer<typeof processingStatusSchema>;

// ============================================
// SYSTEM STATUS
// ============================================

export const systemStatusSchema = z.object({
  status: z.enum(["processed", "processing", "error", "idle"]),
  lastUpdate: z.string().optional(),
  message: z.string().optional()
});

export type SystemStatus = z.infer<typeof systemStatusSchema>;

// ============================================
// PACKAGE / DELIVERY RECORD
// ============================================

export const packageRecordSchema = z.object({
  id: z.string(),
  dataPedido: z.string().optional(),
  pedido: z.string(),
  statusDoDia: z.string().optional(),
  beepDoDia: z.string().optional(),
  cliente: z.string().optional(),
  conta: z.string().optional(),
  zona: z.string().optional(),
  responsabilidade: z.string().optional(),
  bipagem: z.string().optional(),
  criacao: z.string().optional(),
  deveriaSerEntregue: z.string().optional(),
  pacote: z.string().optional(),
  etiqueta: z.string().optional(),
  pedidoMarketplace: z.string().optional(),
  frete: z.string().optional(),
  vendedor: z.string().optional(),
  centroDeCusto: z.string().optional(),
  statusDiaGestora: z.string().optional(),
  nomeComprador: z.string().optional(),
  cep: z.string().optional(),
  logradouro: z.string().optional(),
  numero: z.string().optional(),
  bairro: z.string().optional(),
  cidade: z.string().optional(),
  complemento: z.string().optional(),
  dataStatusDia: z.string().optional(),
  previsaoEntrega: z.string().optional(),
  entrega: z.string().optional(),
  sla: z.enum(["dentro_prazo", "fora_prazo", "atrasado", "nao_entregue"]).optional(),
  prazo: z.number().optional(),
  atraso: z.number().optional(),
  source: z.enum(["logmanager", "gestora", "merged"]).optional()
});

export type PackageRecord = z.infer<typeof packageRecordSchema>;

// ============================================
// SLA METRICS
// ============================================

export const slaMetricsSchema = z.object({
  totalPackages: z.number(),
  withinSla: z.number(),
  outsideSla: z.number(),
  withinSlaPercentage: z.number(),
  outsideSlaPercentage: z.number(),
  totalDelays: z.number(),
  totalSellers: z.number(),
  totalZones: z.number(),
  averageDelay: z.number(),
  maxDelay: z.number()
});

export type SlaMetrics = z.infer<typeof slaMetricsSchema>;

// ============================================
// SELLER METRICS
// ============================================

export const sellerMetricsSchema = z.object({
  id: z.string(),
  name: z.string(),
  totalPackages: z.number(),
  totalDelays: z.number(),
  withinSla: z.number(),
  outsideSla: z.number(),
  slaPercentage: z.number(),
  averageDelay: z.number(),
  rank: z.number()
});

export type SellerMetrics = z.infer<typeof sellerMetricsSchema>;

// ============================================
// ZONE METRICS
// ============================================

export const zoneMetricsSchema = z.object({
  id: z.string(),
  zone: z.string(),
  totalPackages: z.number(),
  totalDelays: z.number(),
  withinSla: z.number(),
  outsideSla: z.number(),
  slaPercentage: z.number(),
  averageDelay: z.number()
});

export type ZoneMetrics = z.infer<typeof zoneMetricsSchema>;

// ============================================
// CEP METRICS
// ============================================

export const cepMetricsSchema = z.object({
  id: z.string(),
  cep: z.string(),
  totalPackages: z.number(),
  totalDelays: z.number(),
  withinSla: z.number(),
  outsideSla: z.number(),
  slaPercentage: z.number(),
  averageDelay: z.number()
});

export type CepMetrics = z.infer<typeof cepMetricsSchema>;

// ============================================
// DAILY METRICS
// ============================================

export const dailyMetricsSchema = z.object({
  date: z.string(),
  totalPackages: z.number(),
  withinSla: z.number(),
  outsideSla: z.number(),
  slaPercentage: z.number(),
  totalDelays: z.number(),
  averageDelay: z.number()
});

export type DailyMetrics = z.infer<typeof dailyMetricsSchema>;

// ============================================
// RANKING ENTRY
// ============================================

export const rankingEntrySchema = z.object({
  rank: z.number(),
  name: z.string(),
  value: z.number(),
  percentage: z.number().optional(),
  secondaryValue: z.number().optional()
});

export type RankingEntry = z.infer<typeof rankingEntrySchema>;

// ============================================
// CHART DATA
// ============================================

export const barChartDataSchema = z.object({
  label: z.string(),
  value: z.number(),
  color: z.string().optional()
});

export type BarChartData = z.infer<typeof barChartDataSchema>;

export const lineChartDataSchema = z.object({
  date: z.string(),
  value: z.number(),
  target: z.number().optional()
});

export type LineChartData = z.infer<typeof lineChartDataSchema>;

// ============================================
// DASHBOARD DATA
// ============================================

export const overviewDataSchema = z.object({
  metrics: slaMetricsSchema,
  slaByPeriod: z.array(barChartDataSchema),
  topDelayedSellers: z.array(rankingEntrySchema),
  topCriticalZones: z.array(rankingEntrySchema),
  topProblematicCeps: z.array(rankingEntrySchema)
});

export type OverviewData = z.infer<typeof overviewDataSchema>;

export const slaPerformanceDataSchema = z.object({
  slaTrend: z.array(lineChartDataSchema),
  records: z.array(packageRecordSchema),
  totalRecords: z.number()
});

export type SlaPerformanceData = z.infer<typeof slaPerformanceDataSchema>;

export const delaysDataSchema = z.object({
  metrics: z.object({
    totalDelays: z.number(),
    averageDelay: z.number(),
    maxDelay: z.number()
  }),
  delaysByDay: z.array(barChartDataSchema),
  delaysByZone: z.array(barChartDataSchema),
  delaysByCep: z.array(barChartDataSchema),
  delaysBySeller: z.array(barChartDataSchema)
});

export type DelaysData = z.infer<typeof delaysDataSchema>;

export const sellersDataSchema = z.object({
  sellers: z.array(sellerMetricsSchema),
  volumeChart: z.array(barChartDataSchema),
  delaysChart: z.array(barChartDataSchema),
  slaChart: z.array(barChartDataSchema)
});

export type SellersData = z.infer<typeof sellersDataSchema>;

export const zonesDataSchema = z.object({
  zones: z.array(zoneMetricsSchema),
  ceps: z.array(cepMetricsSchema),
  zoneDelaysChart: z.array(barChartDataSchema),
  cepDelaysChart: z.array(barChartDataSchema)
});

export type ZonesData = z.infer<typeof zonesDataSchema>;

export const rankingsDataSchema = z.object({
  sellersByDelays: z.array(rankingEntrySchema),
  zonesByDelays: z.array(rankingEntrySchema),
  sellersByVolume: z.array(rankingEntrySchema)
});

export type RankingsData = z.infer<typeof rankingsDataSchema>;

export const consolidatedDataSchema = z.object({
  records: z.array(packageRecordSchema),
  totalRecords: z.number(),
  page: z.number(),
  pageSize: z.number(),
  totalPages: z.number()
});

export type ConsolidatedData = z.infer<typeof consolidatedDataSchema>;

export const historicalDataSchema = z.object({
  slaEvolution: z.array(lineChartDataSchema),
  delayTrend: z.array(lineChartDataSchema),
  periodComparison: z.object({
    current: slaMetricsSchema,
    previous: slaMetricsSchema,
    percentageChange: z.number()
  }),
  sellerPerformance: z.array(z.object({
    seller: z.string(),
    periods: z.array(z.object({
      period: z.string(),
      slaPercentage: z.number()
    }))
  }))
});

export type HistoricalData = z.infer<typeof historicalDataSchema>;

// ============================================
// FILTER OPTIONS
// ============================================

export const filterOptionsSchema = z.object({
  zones: z.array(z.string()),
  sellers: z.array(z.string()),
  costCenters: z.array(z.string()),
  dateRange: z.object({
    min: z.string(),
    max: z.string()
  }).optional()
});

export type FilterOptions = z.infer<typeof filterOptionsSchema>;

// ============================================
// API RESPONSE TYPES
// ============================================

export const apiResponseSchema = <T extends z.ZodType>(dataSchema: T) =>
  z.object({
    success: z.boolean(),
    data: dataSchema.optional(),
    error: z.string().optional(),
    message: z.string().optional()
  });

export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
};
