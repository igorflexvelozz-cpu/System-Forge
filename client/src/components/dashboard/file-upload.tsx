import { useCallback, useState, type DragEvent, type ChangeEvent } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Upload,
  File,
  CheckCircle,
  AlertCircle,
  Loader2,
  X,
  FileSpreadsheet
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { UploadedFile } from "@shared/schema";

interface FileUploadProps {
  title: string;
  description: string;
  fileType: "logmanager" | "gestora";
  acceptedFormats?: string[];
  uploadedFile?: UploadedFile | null;
  onUpload: (file: File) => Promise<void>;
  onRemove?: () => void;
  isUploading?: boolean;
  uploadProgress?: number;
  testId?: string;
}

export function FileUpload({
  title,
  description,
  fileType,
  acceptedFormats = [".xlsx", ".xls", ".csv"],
  uploadedFile,
  onUpload,
  onRemove,
  isUploading = false,
  uploadProgress = 0,
  testId
}: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    async (e: DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) {
        await onUpload(file);
      }
    },
    [onUpload]
  );

  const handleFileSelect = useCallback(
    async (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        await onUpload(file);
      }
      e.target.value = "";
    },
    [onUpload]
  );

  const getStatusBadge = (status: UploadedFile["status"]) => {
    switch (status) {
      case "completed":
        return (
          <Badge variant="default" className="bg-emerald-600 text-white gap-1">
            <CheckCircle className="w-3 h-3" />
            Processado
          </Badge>
        );
      case "processing":
      case "validating":
        return (
          <Badge variant="default" className="bg-amber-500 text-white gap-1">
            <Loader2 className="w-3 h-3 animate-spin" />
            {status === "validating" ? "Validando" : "Processando"}
          </Badge>
        );
      case "error":
        return (
          <Badge variant="destructive" className="gap-1">
            <AlertCircle className="w-3 h-3" />
            Erro
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className="gap-1">
            Pendente
          </Badge>
        );
    }
  };

  return (
    <Card data-testid={testId}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">{description}</p>

        {!uploadedFile ? (
          <div
            className={cn(
              "border-2 border-dashed rounded-md p-8 text-center transition-colors",
              isDragOver
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50",
              isUploading && "pointer-events-none opacity-50"
            )}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <input
              type="file"
              accept={acceptedFormats.join(",")}
              onChange={handleFileSelect}
              className="hidden"
              id={`file-upload-${fileType}`}
              disabled={isUploading}
              data-testid={`input-file-${fileType}`}
            />
            <label
              htmlFor={`file-upload-${fileType}`}
              className="cursor-pointer flex flex-col items-center gap-3"
            >
              {isUploading ? (
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
              ) : (
                <Upload className="w-10 h-10 text-muted-foreground" />
              )}
              <div>
                <p className="font-medium text-foreground">
                  {isUploading
                    ? "Enviando arquivo..."
                    : "Arraste o arquivo ou clique para selecionar"}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Formatos aceitos: {acceptedFormats.join(", ")}
                </p>
              </div>
            </label>
            {isUploading && (
              <div className="mt-4">
                <Progress value={uploadProgress} className="h-2" />
                <p className="text-sm text-muted-foreground mt-2">
                  {uploadProgress}% concluído
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="border rounded-md p-4 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3 min-w-0 flex-1">
                <div className="p-2 bg-muted rounded-md flex-shrink-0">
                  <FileSpreadsheet className="w-6 h-6 text-chart-2" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium truncate" title={uploadedFile.filename}>
                    {uploadedFile.filename}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Enviado em{" "}
                    {new Date(uploadedFile.uploadedAt).toLocaleString("pt-BR")}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {getStatusBadge(uploadedFile.status)}
                {onRemove && uploadedFile.status !== "processing" && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onRemove}
                    data-testid={`button-remove-${fileType}`}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>

            {(uploadedFile.totalRows !== undefined ||
              uploadedFile.validRows !== undefined) && (
              <div className="grid grid-cols-3 gap-4 pt-3 border-t">
                <div>
                  <p className="text-2xl font-bold tabular-nums">
                    {uploadedFile.totalRows?.toLocaleString("pt-BR") ?? "-"}
                  </p>
                  <p className="text-xs text-muted-foreground">Total de linhas</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-emerald-600 tabular-nums">
                    {uploadedFile.validRows?.toLocaleString("pt-BR") ?? "-"}
                  </p>
                  <p className="text-xs text-muted-foreground">Linhas válidas</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-red-500 tabular-nums">
                    {uploadedFile.invalidRows?.toLocaleString("pt-BR") ?? "0"}
                  </p>
                  <p className="text-xs text-muted-foreground">Linhas inválidas</p>
                </div>
              </div>
            )}

            {uploadedFile.columnValidation && (
              <div className="pt-3 border-t">
                <div className="flex items-center gap-2 mb-2">
                  {uploadedFile.columnValidation.valid ? (
                    <>
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                      <span className="text-sm font-medium text-emerald-600">
                        Todas as colunas validadas
                      </span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-4 h-4 text-amber-500" />
                      <span className="text-sm font-medium text-amber-500">
                        Colunas com problemas
                      </span>
                    </>
                  )}
                </div>
                {uploadedFile.columnValidation.missingColumns &&
                  uploadedFile.columnValidation.missingColumns.length > 0 && (
                    <div className="text-sm text-muted-foreground">
                      <span className="font-medium text-red-500">
                        Colunas faltantes:{" "}
                      </span>
                      {uploadedFile.columnValidation.missingColumns.join(", ")}
                    </div>
                  )}
              </div>
            )}

            {uploadedFile.errors && uploadedFile.errors.length > 0 && (
              <div className="pt-3 border-t">
                <p className="text-sm font-medium text-red-500 mb-2">Erros:</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {uploadedFile.errors.slice(0, 5).map((error, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <AlertCircle className="w-3 h-3 text-red-500 mt-0.5 flex-shrink-0" />
                      {error}
                    </li>
                  ))}
                  {uploadedFile.errors.length > 5 && (
                    <li className="text-muted-foreground">
                      ... e mais {uploadedFile.errors.length - 5} erros
                    </li>
                  )}
                </ul>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
