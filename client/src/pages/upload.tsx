import { useState, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { FileUpload } from "@/components/dashboard/file-upload";
import { ProcessingStatus } from "@/components/dashboard/processing-status";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle, FileSpreadsheet, Info } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { UploadedFile, ProcessingStatus as ProcessingStatusType } from "@shared/schema";

const REQUIRED_COLUMNS_LOGMANAGER = [
  "Data Pedido",
  "Pedido",
  "Status do Dia",
  "Beep do Dia",
  "Cliente",
  "Conta",
  "Zona",
  "Responsabilidade"
];

const REQUIRED_COLUMNS_GESTORA = [
  "Bipagem",
  "criacao",
  "deveria_ser_entregue",
  "pacote",
  "etiqueta",
  "pedido_marketplace",
  "Frete",
  "Vendedor",
  "Centro de custo",
  "status_dia",
  "Nome Comprador",
  "CEP",
  "PREVISÃO DE ENTREGA",
  "ENTREGA",
  "SLA",
  "Prazo",
  "Atraso"
];

export default function UploadPage() {
  const { toast } = useToast();
  const [logmanagerProgress, setLogmanagerProgress] = useState(0);
  const [gestoraProgress, setGestoraProgress] = useState(0);

  const { data: uploadStatus } = useQuery<{
    logmanager: UploadedFile | null;
    gestora: UploadedFile | null;
    processing: ProcessingStatusType;
  }>({
    queryKey: ["/api/upload/status"],
    refetchInterval: 5000
  });

  const uploadMutation = useMutation({
    mutationFn: async ({
      file,
      fileType
    }: {
      file: File;
      fileType: "logmanager" | "gestora";
    }) => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("fileType", fileType);
      
      const maxRetries = 3;
      let lastError: Error;
      
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 300000); // 5 minutes timeout
        
        try {
          const response = await fetch("/api/upload", {
            method: "POST",
            body: formData,
            signal: controller.signal
          });
          clearTimeout(timeoutId);
          
          if (!response.ok) {
            const errorText = await response.text();
            let errorMessage = "Erro ao fazer upload";
            try {
              const error = JSON.parse(errorText);
              errorMessage = error.message || errorMessage;
            } catch {
              errorMessage = errorText || errorMessage;
            }
            throw new Error(errorMessage);
          }
          
          return response.json();
        } catch (error) {
          clearTimeout(timeoutId);
          lastError = error as Error;
          
          if (error.name === 'AbortError') {
            throw new Error('Upload timed out. File too large or network issue.');
          }
          
          // Retry on network errors, but not on server errors (4xx, 5xx handled above)
          if (attempt < maxRetries && (error.name === 'TypeError' || error.message.includes('fetch'))) {
            // Wait before retry (exponential backoff)
            await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
            continue;
          }
          
          throw error;
        }
      }
      
      throw lastError!;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/upload/status"] });
      toast({
        title: "Upload realizado com sucesso",
        description: `A planilha ${
          variables.fileType === "logmanager" ? "Logmanager" : "Gestora"
        } foi enviada.`
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Erro no upload",
        description: error.message
      });
    }
  });

  const processMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/upload/process");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/upload/status"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      toast({
        title: "Processamento iniciado",
        description: "O processamento das planilhas foi iniciado."
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Erro ao processar",
        description: error.message
      });
    }
  });

  const removeMutation = useMutation({
    mutationFn: async (fileType: "logmanager" | "gestora") => {
      return apiRequest("DELETE", `/api/upload/${fileType}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/upload/status"] });
      toast({
        title: "Arquivo removido",
        description: "O arquivo foi removido com sucesso."
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Erro ao remover",
        description: error.message
      });
    }
  });

  const handleUpload = useCallback(
    async (file: File, fileType: "logmanager" | "gestora") => {
      const setProgress = fileType === "logmanager" ? setLogmanagerProgress : setGestoraProgress;
      
      setProgress(10);
      const interval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 5, 90));
      }, 1000);
      
      try {
        await uploadMutation.mutateAsync({ file, fileType });
      } finally {
        clearInterval(interval);
        setProgress(100);
        setTimeout(() => setProgress(0), 500);
      }
    },
    [uploadMutation]
  );

  const canProcess = !!(uploadStatus?.logmanager?.status === "completed" && 
    uploadStatus?.gestora?.status === "completed");

  return (
    <div className="p-8 space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-foreground" data-testid="text-page-title">
          Upload & Processamento
        </h1>
        <p className="text-sm text-muted-foreground">
          Faça upload das planilhas para processar os dados de SLA
        </p>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>Instruções de Upload</AlertTitle>
        <AlertDescription className="mt-2 space-y-2">
          <p>
            Faça upload das duas planilhas necessárias para o cálculo de SLA:
          </p>
          <ul className="list-disc pl-4 space-y-1 text-sm">
            <li>
              <strong>Planilha Mãe (Logmanager):</strong> Contém os dados base de pedidos
            </li>
            <li>
              <strong>Planilha Avulsa (Gestora):</strong> Contém os dados de entrega e SLA
            </li>
          </ul>
          <p className="text-sm text-muted-foreground">
            Apenas registros do Mercado Livre (MELI) serão processados.
          </p>
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <FileUpload
          title="Planilha Mãe (Logmanager)"
          description="Upload da planilha principal com dados de pedidos do Logmanager."
          fileType="logmanager"
          uploadedFile={uploadStatus?.logmanager}
          onUpload={(file) => handleUpload(file, "logmanager")}
          onRemove={() => removeMutation.mutate("logmanager")}
          isUploading={uploadMutation.isPending && logmanagerProgress > 0}
          uploadProgress={logmanagerProgress}
          testId="upload-logmanager"
        />

        <FileUpload
          title="Planilha Avulsa (Gestora)"
          description="Upload da planilha gestora com dados de entrega e SLA."
          fileType="gestora"
          uploadedFile={uploadStatus?.gestora}
          onUpload={(file) => handleUpload(file, "gestora")}
          onRemove={() => removeMutation.mutate("gestora")}
          isUploading={uploadMutation.isPending && gestoraProgress > 0}
          uploadProgress={gestoraProgress}
          testId="upload-gestora"
        />
      </div>

      <ProcessingStatus
        status={uploadStatus?.processing || {
          status: "idle",
          lastUpdated: new Date().toISOString()
        }}
        onStartProcessing={() => processMutation.mutate()}
        onRetry={() => processMutation.mutate()}
        canProcess={canProcess}
        testId="processing-status"
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between gap-2">
              <CardTitle className="text-base font-semibold">
                Colunas Obrigatórias - Logmanager
              </CardTitle>
              <FileSpreadsheet className="w-5 h-5 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {REQUIRED_COLUMNS_LOGMANAGER.map((col) => (
                <Badge key={col} variant="secondary" className="text-xs">
                  {col}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between gap-2">
              <CardTitle className="text-base font-semibold">
                Colunas Obrigatórias - Gestora
              </CardTitle>
              <FileSpreadsheet className="w-5 h-5 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {REQUIRED_COLUMNS_GESTORA.map((col) => (
                <Badge key={col} variant="secondary" className="text-xs">
                  {col}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {uploadStatus?.processing.status === "error" && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erro no Processamento</AlertTitle>
          <AlertDescription>
            {uploadStatus.processing.message || "Ocorreu um erro durante o processamento das planilhas. Verifique os arquivos e tente novamente."}
          </AlertDescription>
        </Alert>
      )}

      {uploadStatus?.processing.status === "completed" && (
        <Alert>
          <CheckCircle className="h-4 w-4 text-emerald-600" />
          <AlertTitle className="text-emerald-600">Processamento Concluído</AlertTitle>
          <AlertDescription>
            As planilhas foram processadas com sucesso. Acesse as outras seções para visualizar os dados de SLA.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
