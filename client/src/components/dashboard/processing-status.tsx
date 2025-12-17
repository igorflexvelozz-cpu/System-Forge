import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  CheckCircle,
  AlertCircle,
  Loader2,
  Play,
  RefreshCw,
  Clock
} from "lucide-react";
import type { ProcessingStatus as ProcessingStatusType } from "@shared/schema";

interface ProcessingStatusProps {
  status: ProcessingStatusType;
  onStartProcessing?: () => void;
  onRetry?: () => void;
  canProcess?: boolean;
  testId?: string;
}

export function ProcessingStatus({
  status,
  onStartProcessing,
  onRetry,
  canProcess = false,
  testId
}: ProcessingStatusProps) {
  const getStatusIcon = () => {
    switch (status.status) {
      case "completed":
        return <CheckCircle className="w-8 h-8 text-emerald-600" />;
      case "processing":
        return <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />;
      case "error":
        return <AlertCircle className="w-8 h-8 text-red-500" />;
      default:
        return <Clock className="w-8 h-8 text-muted-foreground" />;
    }
  };

  const getStatusBadge = () => {
    switch (status.status) {
      case "completed":
        return (
          <Badge variant="default" className="bg-emerald-600 text-white">
            Concluído
          </Badge>
        );
      case "processing":
        return (
          <Badge variant="default" className="bg-amber-500 text-white">
            Em Processamento
          </Badge>
        );
      case "error":
        return <Badge variant="destructive">Erro</Badge>;
      default:
        return <Badge variant="secondary">Aguardando</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    });
  };

  return (
    <Card data-testid={testId}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-4">
          <CardTitle className="text-base font-semibold">
            Status do Processamento
          </CardTitle>
          {getStatusBadge()}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-muted rounded-md">{getStatusIcon()}</div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-foreground">
              {status.currentStep || "Aguardando início"}
            </p>
            {status.message && (
              <p className="text-sm text-muted-foreground mt-1">
                {status.message}
              </p>
            )}
            <p className="text-xs text-muted-foreground mt-2">
              Última atualização: {formatDate(status.lastUpdated)}
            </p>
          </div>
        </div>

        {status.status === "processing" && status.progress !== undefined && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progresso</span>
              <span className="font-medium">{status.progress}%</span>
            </div>
            <Progress value={status.progress} className="h-2" />
          </div>
        )}

        <div className="flex items-center gap-2 pt-2">
          {status.status === "idle" && canProcess && onStartProcessing && (
            <Button
              onClick={onStartProcessing}
              className="gap-2"
              data-testid="button-start-processing"
            >
              <Play className="w-4 h-4" />
              Iniciar Processamento
            </Button>
          )}
          {status.status === "error" && onRetry && (
            <Button
              variant="outline"
              onClick={onRetry}
              className="gap-2"
              data-testid="button-retry-processing"
            >
              <RefreshCw className="w-4 h-4" />
              Tentar Novamente
            </Button>
          )}
          {status.status === "completed" && onStartProcessing && (
            <Button
              variant="outline"
              onClick={onStartProcessing}
              className="gap-2"
              data-testid="button-reprocess"
            >
              <RefreshCw className="w-4 h-4" />
              Reprocessar
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
