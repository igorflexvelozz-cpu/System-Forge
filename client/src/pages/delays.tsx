import { useQuery } from "@tanstack/react-query";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { BarChart } from "@/components/dashboard/bar-chart";
import { EmptyState } from "@/components/dashboard/empty-state";
import {
  KpiCardSkeleton,
  ChartSkeleton
} from "@/components/dashboard/loading-skeleton";
import { AlertTriangle, Clock, TrendingUp, Upload } from "lucide-react";
import { useLocation } from "wouter";
import type { DelaysData } from "@shared/schema";

export default function Delays() {
  const [, setLocation] = useLocation();

  const { data, isLoading, error } = useQuery<DelaysData>({
    queryKey: ["/api/dashboard/delays"]
  });

  if (isLoading) {
    return (
      <div className="p-8 space-y-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-foreground">Atrasos & Exceções</h1>
          <p className="text-sm text-muted-foreground">
            Análise detalhada de atrasos e exceções
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <KpiCardSkeleton />
          <KpiCardSkeleton />
          <KpiCardSkeleton />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ChartSkeleton height={300} />
          <ChartSkeleton height={300} />
          <ChartSkeleton height={300} />
          <ChartSkeleton height={300} />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 space-y-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-foreground">Atrasos & Exceções</h1>
          <p className="text-sm text-muted-foreground">
            Análise detalhada de atrasos e exceções
          </p>
        </div>
        <EmptyState
          title="Nenhum dado disponível"
          description="Faça upload das planilhas para visualizar os dados de atrasos."
          action={{
            label: "Fazer Upload",
            onClick: () => setLocation("/upload"),
            icon: Upload
          }}
          testId="empty-state-delays"
        />
      </div>
    );
  }

  const { metrics, delaysByDay, delaysByZone, delaysByCep, delaysBySeller } = data;

  return (
    <div className="p-8 space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-foreground" data-testid="text-page-title">
          Atrasos & Exceções
        </h1>
        <p className="text-sm text-muted-foreground">
          Análise detalhada de atrasos e exceções
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <KpiCard
          title="Total de Atrasos"
          value={metrics.totalDelays.toLocaleString("pt-BR")}
          icon={AlertTriangle}
          variant="danger"
          testId="kpi-total-delays"
        />
        <KpiCard
          title="Média de Atraso"
          value={`${metrics.averageDelay.toFixed(1)} dias`}
          icon={Clock}
          variant="warning"
          testId="kpi-average-delay"
        />
        <KpiCard
          title="Maior Atraso"
          value={`${metrics.maxDelay} dias`}
          icon={TrendingUp}
          variant="danger"
          testId="kpi-max-delay"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <BarChart
          title="Atrasos por Dia"
          data={delaysByDay}
          height={300}
          color="hsl(var(--destructive))"
          valueFormatter={(v) => v.toLocaleString("pt-BR")}
          testId="chart-delays-by-day"
        />

        <BarChart
          title="Atrasos por Zona"
          data={delaysByZone}
          height={300}
          color="hsl(var(--chart-4))"
          valueFormatter={(v) => v.toLocaleString("pt-BR")}
          testId="chart-delays-by-zone"
        />

        <BarChart
          title="Atrasos por CEP"
          data={delaysByCep}
          height={300}
          color="hsl(var(--chart-5))"
          valueFormatter={(v) => v.toLocaleString("pt-BR")}
          testId="chart-delays-by-cep"
        />

        <BarChart
          title="Atrasos por Vendedor"
          data={delaysBySeller}
          height={300}
          color="hsl(var(--chart-1))"
          valueFormatter={(v) => v.toLocaleString("pt-BR")}
          testId="chart-delays-by-seller"
        />
      </div>
    </div>
  );
}
