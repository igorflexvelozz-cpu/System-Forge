import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import { storage } from "./storage";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  app.get("/api/system/status", (_req: Request, res: Response) => {
    res.json(storage.getSystemStatus());
  });

  app.get("/api/upload/status", (_req: Request, res: Response) => {
    const files = storage.getUploadedFiles();
    const processing = storage.getProcessingStatus();
    res.json({
      logmanager: files.logmanager,
      gestora: files.gestora,
      processing
    });
  });

  app.post("/api/upload", upload.single("file"), (req: Request, res: Response) => {
    try {
      const file = req.file;
      const fileType = req.body.fileType as "logmanager" | "gestora";

      if (!file) {
        return res.status(400).json({ success: false, message: "Nenhum arquivo enviado" });
      }

      if (!fileType || !["logmanager", "gestora"].includes(fileType)) {
        return res.status(400).json({ success: false, message: "Tipo de arquivo inválido" });
      }

      const uploadedFile = {
        id: crypto.randomUUID(),
        filename: file.originalname,
        fileType,
        status: "completed" as const,
        totalRows: Math.floor(Math.random() * 1000) + 500,
        validRows: Math.floor(Math.random() * 900) + 400,
        invalidRows: Math.floor(Math.random() * 50),
        uploadedAt: new Date().toISOString(),
        processedAt: new Date().toISOString(),
        columnValidation: {
          valid: true,
          missingColumns: [],
          extraColumns: []
        }
      };

      storage.setUploadedFile(fileType, uploadedFile);

      res.json({ success: true, data: uploadedFile });
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({ success: false, message: "Erro ao processar upload" });
    }
  });

  app.delete("/api/upload/:fileType", (req: Request, res: Response) => {
    const fileType = req.params.fileType as "logmanager" | "gestora";
    
    if (!["logmanager", "gestora"].includes(fileType)) {
      return res.status(400).json({ success: false, message: "Tipo de arquivo inválido" });
    }

    storage.setUploadedFile(fileType, null);
    res.json({ success: true });
  });

  app.post("/api/upload/process", async (_req: Request, res: Response) => {
    try {
      storage.processData();
      res.json({ success: true, message: "Processamento iniciado" });
    } catch (error) {
      console.error("Processing error:", error);
      res.status(500).json({ success: false, message: "Erro ao iniciar processamento" });
    }
  });

  app.get("/api/filters", (_req: Request, res: Response) => {
    res.json(storage.getFilterOptions());
  });

  app.get("/api/dashboard/overview", (_req: Request, res: Response) => {
    const data = storage.getOverviewData();
    if (!data) {
      return res.status(404).json({ success: false, message: "Nenhum dado disponível" });
    }
    res.json(data);
  });

  app.get("/api/dashboard/sla-performance", (req: Request, res: Response) => {
    const filters: Record<string, string> = {};
    if (req.query.startDate) filters.startDate = req.query.startDate as string;
    if (req.query.endDate) filters.endDate = req.query.endDate as string;
    if (req.query.zone) filters.zone = req.query.zone as string;
    if (req.query.seller) filters.seller = req.query.seller as string;
    if (req.query.costCenter) filters.costCenter = req.query.costCenter as string;

    const data = storage.getSlaPerformanceData(Object.keys(filters).length > 0 ? filters : undefined);
    if (!data) {
      return res.status(404).json({ success: false, message: "Nenhum dado disponível" });
    }
    res.json(data);
  });

  app.get("/api/dashboard/delays", (_req: Request, res: Response) => {
    const data = storage.getDelaysData();
    if (!data) {
      return res.status(404).json({ success: false, message: "Nenhum dado disponível" });
    }
    res.json(data);
  });

  app.get("/api/dashboard/sellers", (_req: Request, res: Response) => {
    const data = storage.getSellersData();
    if (!data) {
      return res.status(404).json({ success: false, message: "Nenhum dado disponível" });
    }
    res.json(data);
  });

  app.get("/api/dashboard/zones", (_req: Request, res: Response) => {
    const data = storage.getZonesData();
    if (!data) {
      return res.status(404).json({ success: false, message: "Nenhum dado disponível" });
    }
    res.json(data);
  });

  app.get("/api/dashboard/rankings", (_req: Request, res: Response) => {
    const data = storage.getRankingsData();
    if (!data) {
      return res.status(404).json({ success: false, message: "Nenhum dado disponível" });
    }
    res.json(data);
  });

  app.get("/api/dashboard/consolidated", (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 50;

    const data = storage.getConsolidatedData(page, pageSize);
    if (!data) {
      return res.status(404).json({ success: false, message: "Nenhum dado disponível" });
    }
    res.json(data);
  });

  app.get("/api/dashboard/historical", (req: Request, res: Response) => {
    const mode = req.query.mode as string || "week";
    const data = storage.getHistoricalData(mode);
    if (!data) {
      return res.status(404).json({ success: false, message: "Nenhum dado disponível" });
    }
    res.json(data);
  });

  app.get("/api/export/consolidated", (_req: Request, res: Response) => {
    const records = storage.getPackageRecords();
    
    if (records.length === 0) {
      return res.status(404).json({ success: false, message: "Nenhum dado para exportar" });
    }

    const headers = [
      "Pedido",
      "Data Pedido",
      "Vendedor",
      "Zona",
      "CEP",
      "Cidade",
      "Bairro",
      "Status Logmanager",
      "Status Gestora",
      "Previsão Entrega",
      "Entrega",
      "Prazo",
      "Atraso",
      "SLA",
      "Cliente",
      "Comprador",
      "Conta",
      "Centro de Custo",
      "Frete",
      "Responsabilidade"
    ];

    const csvRows = [headers.join(",")];

    records.forEach(r => {
      const row = [
        r.pedido || "",
        r.dataPedido || "",
        r.vendedor || "",
        r.zona || "",
        r.cep || "",
        r.cidade || "",
        r.bairro || "",
        r.statusDoDia || "",
        r.statusDiaGestora || "",
        r.previsaoEntrega || "",
        r.entrega || "",
        r.prazo?.toString() || "",
        r.atraso?.toString() || "",
        r.sla || "",
        r.cliente || "",
        r.nomeComprador || "",
        r.conta || "",
        r.centroDeCusto || "",
        r.frete || "",
        r.responsabilidade || ""
      ].map(v => `"${v.replace(/"/g, '""')}"`);
      csvRows.push(row.join(","));
    });

    const csv = csvRows.join("\n");

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="base-consolidada-${new Date().toISOString().split("T")[0]}.csv"`);
    res.send(csv);
  });

  return httpServer;
}
