import { Switch, Route } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import { Sidebar } from "@/components/layout/sidebar";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle, AlertCircle, Loader2 } from "lucide-react";

import Overview from "@/pages/overview";
import UploadPage from "@/pages/upload";
import SlaPerformance from "@/pages/sla-performance";
import Delays from "@/pages/delays";
import Sellers from "@/pages/sellers";
import Zones from "@/pages/zones";
import Rankings from "@/pages/rankings";
import ConsolidatedBase from "@/pages/consolidated-base";
import Historical from "@/pages/historical";
import NotFound from "@/pages/not-found";

import type { SystemStatus } from "@shared/schema";

function StatusBadge({ status }: { status: SystemStatus["status"] }) {
  switch (status) {
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
}

function formatDate(dateString?: string) {
  if (!dateString) return "Sem dados";
  const date = new Date(dateString);
  return date.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function AppLayout() {
  const { data: systemStatus } = useQuery<SystemStatus>({
    queryKey: ["/api/system/status"],
    refetchInterval: 10000
  });

  const defaultStatus: SystemStatus = {
    status: "idle",
    lastUpdate: undefined,
    message: "Sistema aguardando dados"
  };

  const currentStatus = systemStatus || defaultStatus;

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
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
            <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground" data-testid="text-last-update">
              <Clock className="w-4 h-4" />
              <span className="hidden md:inline">Última atualização:</span>
              <span className="font-medium text-foreground">
                {formatDate(currentStatus.lastUpdate)}
              </span>
            </div>
            <div data-testid="status-system">
              <StatusBadge status={currentStatus.status} />
            </div>
            <ThemeToggle />
          </div>
        </header>
        <main className="flex-1 overflow-auto">
          <Switch>
            <Route path="/" component={Overview} />
            <Route path="/upload" component={UploadPage} />
            <Route path="/sla-performance" component={SlaPerformance} />
            <Route path="/atrasos" component={Delays} />
            <Route path="/vendedores" component={Sellers} />
            <Route path="/zonas" component={Zones} />
            <Route path="/rankings" component={Rankings} />
            <Route path="/base-consolidada" component={ConsolidatedBase} />
            <Route path="/historico" component={Historical} />
            <Route component={NotFound} />
          </Switch>
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="atlas-theme">
        <TooltipProvider>
          <AppLayout />
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
