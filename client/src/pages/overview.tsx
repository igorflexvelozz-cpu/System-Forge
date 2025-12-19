import { useQuery } from "@tanstack/react-query";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { BarChart } from "@/components/dashboard/bar-chart";
import { RankingList } from "@/components/dashboard/ranking-list";
import { EmptyState } from "@/components/dashboard/empty-state";
import {
  KpiCardSkeleton,
  ChartSkeleton,
  RankingListSkeleton
} from "@/components/dashboard/loading-skeleton";
import {
  Package,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Users,
  MapPin,
  Upload
} from "lucide-react";
import { useLocation } from "wouter";
import { usePageTracking } from "@/hooks/use-analytics";
import type { OverviewData } from "@shared/schema";

export default function Overview() {
  const [, setLocation] = useLocation();
  usePageTracking("Visão Geral", "/");

  const { data, isLoading, error } = useQuery<OverviewData>({
    queryKey: ["/api/dashboard/overview"]
  });

  if (isLoading) {
    return (
      <div className="p-8 space-y-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-foreground">Visão Geral</h1>
          <p className="text-sm text-muted-foreground">
            Resumo executivo de SLA e performance logística
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <KpiCardSkeleton key={i} />
          ))}
        </div>

        <ChartSkeleton height={350} />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <RankingListSkeleton />
          <RankingListSkeleton />
          <RankingListSkeleton />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 space-y-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-foreground">Visão Geral</h1>
          <p className="text-sm text-muted-foreground">
            Resumo executivo de SLA e performance logística
          </p>
        </div>
        <EmptyState
          title="Nenhum dado disponível"
          description="Faça upload das planilhas para visualizar os dados de SLA e performance."
          action={{
            label: "Fazer Upload",
            onClick: () => setLocation("/upload"),
            icon: Upload
          }}
          testId="empty-state-overview"
        />
      </div>
    );
  }

  const { metrics, slaByPeriod, topDelayedSellers, topCriticalZones, topProblematicCeps } = data;

  return (
    <div className="p-8 space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-foreground" data-testid="text-page-title">
          Visão Geral
        </h1>
        <p className="text-sm text-muted-foreground">
          Resumo executivo de SLA e performance logística
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <KpiCard
          title="Total de Pacotes"
          value={metrics.totalPackages.toLocaleString("pt-BR")}
          icon={Package}
          variant="default"
          testId="kpi-total-packages"
        />
        <KpiCard
          title="SLA Dentro do Prazo"
          value={`${metrics.withinSlaPercentage.toFixed(1)}%`}
          subtitle={`${metrics.withinSla.toLocaleString("pt-BR")} pacotes`}
          icon={CheckCircle}
          variant="success"
          testId="kpi-within-sla"
        />
        <KpiCard
          title="SLA Fora do Prazo"
          value={`${metrics.outsideSlaPercentage.toFixed(1)}%`}
          subtitle={`${metrics.outsideSla.toLocaleString("pt-BR")} pacotes`}
          icon={XCircle}
          variant="danger"
          testId="kpi-outside-sla"
        />
        <KpiCard
          title="Entregas Atrasadas"
          value={metrics.totalDelays.toLocaleString("pt-BR")}
          icon={AlertTriangle}
          variant="warning"
          testId="kpi-total-delays"
        />
        <KpiCard
          title="Total de Vendedores"
          value={metrics.totalSellers.toLocaleString("pt-BR")}
          icon={Users}
          variant="default"
          testId="kpi-total-sellers"
        />
        <KpiCard
          title="Total de Zonas"
          value={metrics.totalZones.toLocaleString("pt-BR")}
          icon={MapPin}
          variant="default"
          testId="kpi-total-zones"
        />
      </div>

      <BarChart
        title="SLA Geral por Período"
        data={slaByPeriod}
        targetLine={95}
        targetLabel="Meta 95%"
        height={350}
        valueFormatter={(v) => `${v.toFixed(1)}%`}
        testId="chart-sla-period"
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <RankingList
          title="Top 5 Vendedores com Mais Atrasos"
          entries={topDelayedSellers}
          valueLabel="Atrasos"
          variant="danger"
          testId="ranking-delayed-sellers"
        />
        <RankingList
          title="Top 5 Zonas Críticas"
          entries={topCriticalZones}
          valueLabel="Atrasos"
          variant="danger"
          testId="ranking-critical-zones"
        />
        <RankingList
          title="Top 5 CEPs com Problemas"
          entries={topProblematicCeps}
          valueLabel="Atrasos"
          variant="danger"
          testId="ranking-problematic-ceps"
        />
      </div>
    </div>
  );
}
