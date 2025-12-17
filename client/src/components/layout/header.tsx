import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import type { SystemStatus } from "@shared/schema";

interface HeaderProps {
  systemStatus: SystemStatus;
}

export function Header({ systemStatus }: HeaderProps) {
  const getStatusBadge = () => {
    switch (systemStatus.status) {
      case "processed":
        return (
          <Badge variant="default" className="bg-emerald-600 text-white gap-1.5">
            <CheckCircle className="w-3.5 h-3.5" />
            Processado
          </Badge>
        );
      case "processing":
        return (
          <Badge variant="default" className="bg-amber-500 text-white gap-1.5">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            Em Processamento
          </Badge>
        );
      case "error":
        return (
          <Badge variant="destructive" className="gap-1.5">
            <AlertCircle className="w-3.5 h-3.5" />
            Erro
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className="gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            Aguardando
          </Badge>
        );
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Sem dados";
    const date = new Date(dateString);
    return date.toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  return (
    <header className="h-16 border-b border-border bg-card flex items-center justify-between px-6 sticky top-0 z-50" data-testid="header">
      <div className="flex flex-col gap-0.5">
        <h1 className="text-xl font-bold text-foreground tracking-tight" data-testid="text-brand-name">
          Flex Velozz | ATLAS
        </h1>
        <p className="text-xs text-muted-foreground" data-testid="text-brand-subtitle">
          SLA & Performance Logística — Mercado Livre
        </p>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground" data-testid="text-last-update">
          <Clock className="w-4 h-4" />
          <span>Última atualização:</span>
          <span className="font-medium text-foreground">
            {formatDate(systemStatus.lastUpdate)}
          </span>
        </div>
        <div data-testid="status-system">
          {getStatusBadge()}
        </div>
      </div>
    </header>
  );
}
