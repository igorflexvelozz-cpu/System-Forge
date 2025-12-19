import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { LineChart } from "@/components/dashboard/line-chart";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { BarChart } from "@/components/dashboard/bar-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/dashboard/empty-state";
import {
  KpiCardSkeleton,
  ChartSkeleton
} from "@/components/dashboard/loading-skeleton";
import { TrendingUp, TrendingDown, ArrowRight, Upload, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocation } from "wouter";
import { usePageTracking, useAnalytics } from "@/hooks/use-analytics";
import type { HistoricalData } from "@shared/schema";

type ComparisonMode = "week" | "month";

export default function Historical() {
  const [, setLocation] = useLocation();
  const analytics = useAnalytics();
  usePageTracking("Histórico & Comparativos", "/historico");
  const [comparisonMode, setComparisonMode] = useState<ComparisonMode>("week");

  // Track comparison mode changes
  useEffect(() => {
    analytics.trackDashboardInteraction("comparison_mode_changed", "historical", {
      mode: comparisonMode
    });
  }, [comparisonMode, analytics]);

  const { data, isLoading, error } = useQuery<HistoricalData>({
    queryKey: ["/api/dashboard/historical", comparisonMode]
  });

  if (isLoading) {
    return (
      <div className="p-8 space-y-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-foreground">
            Histórico & Comparativos
          </h1>
          <p className="text-sm text-muted-foreground">
            Comparação de períodos e tendências
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <KpiCardSkeleton />
          <KpiCardSkeleton />
          <KpiCardSkeleton />
        </div>

        <ChartSkeleton height={350} />
        <ChartSkeleton height={350} />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 space-y-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-foreground">
            Histórico & Comparativos
          </h1>
          <p className="text-sm text-muted-foreground">
            Comparação de períodos e tendências
          </p>
        </div>
        <EmptyState
          title="Nenhum dado disponível"
          description="Faça upload das planilhas para visualizar o histórico e comparativos."
          action={{
            label: "Fazer Upload",
            onClick: () => setLocation("/upload"),
            icon: Upload
          }}
          testId="empty-state-historical"
        />
      </div>
    );
  }

  const { slaEvolution, delayTrend, periodComparison, sellerPerformance } = data;

  const isPositiveChange = periodComparison.percentageChange >= 0;

  const sellerPerformanceChartData = sellerPerformance.slice(0, 10).map((s) => ({
    label: s.seller,
    value: s.periods[s.periods.length - 1]?.slaPercentage || 0
  }));

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-foreground" data-testid="text-page-title">
            Histórico & Comparativos
          </h1>
          <p className="text-sm text-muted-foreground">
            Comparação de períodos e tendências
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={comparisonMode === "week" ? "default" : "outline"}
            onClick={() => setComparisonMode("week")}
            className="gap-2"
            data-testid="button-comparison-week"
          >
            <Calendar className="w-4 h-4" />
            Semana vs Semana
          </Button>
          <Button
            variant={comparisonMode === "month" ? "default" : "outline"}
            onClick={() => setComparisonMode("month")}
            className="gap-2"
            data-testid="button-comparison-month"
          >
            <Calendar className="w-4 h-4" />
            Mês vs Mês
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">
            Comparação de Período ({comparisonMode === "week" ? "Semanal" : "Mensal"})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Período Anterior</p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold">
                  {periodComparison.previous.withinSlaPercentage.toFixed(1)}%
                </span>
                <span className="text-sm text-muted-foreground">SLA</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {periodComparison.previous.totalPackages.toLocaleString("pt-BR")} pacotes
              </p>
            </div>

            <div className="flex flex-col items-center justify-center gap-2">
              <ArrowRight className="w-8 h-8 text-muted-foreground" />
              <div
                className={cn(
                  "flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium",
                  isPositiveChange
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                    : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                )}
              >
                {isPositiveChange ? (
                  <TrendingUp className="w-4 h-4" />
                ) : (
                  <TrendingDown className="w-4 h-4" />
                )}
                {isPositiveChange ? "+" : ""}
                {periodComparison.percentageChange.toFixed(1)}%
              </div>
            </div>

            <div className="space-y-2 text-right">
              <p className="text-sm text-muted-foreground">Período Atual</p>
              <div className="flex items-baseline gap-2 justify-end">
                <span className="text-3xl font-bold">
                  {periodComparison.current.withinSlaPercentage.toFixed(1)}%
                </span>
                <span className="text-sm text-muted-foreground">SLA</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {periodComparison.current.totalPackages.toLocaleString("pt-BR")} pacotes
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <KpiCard
          title="Variação de Atrasos"
          value={`${periodComparison.current.totalDelays - periodComparison.previous.totalDelays > 0 ? "+" : ""}${(periodComparison.current.totalDelays - periodComparison.previous.totalDelays).toLocaleString("pt-BR")}`}
          subtitle={`${periodComparison.current.totalDelays.toLocaleString("pt-BR")} atrasos atuais`}
          icon={periodComparison.current.totalDelays <= periodComparison.previous.totalDelays ? TrendingDown : TrendingUp}
          variant={periodComparison.current.totalDelays <= periodComparison.previous.totalDelays ? "success" : "danger"}
          testId="kpi-delay-variation"
        />
        <KpiCard
          title="Variação de Volume"
          value={`${periodComparison.current.totalPackages - periodComparison.previous.totalPackages > 0 ? "+" : ""}${(periodComparison.current.totalPackages - periodComparison.previous.totalPackages).toLocaleString("pt-BR")}`}
          subtitle={`${periodComparison.current.totalPackages.toLocaleString("pt-BR")} pacotes atuais`}
          icon={TrendingUp}
          variant="default"
          testId="kpi-volume-variation"
        />
        <KpiCard
          title="Meta de SLA"
          value={periodComparison.current.withinSlaPercentage >= 95 ? "Atingida" : "Não Atingida"}
          subtitle={`Meta: 95% | Atual: ${periodComparison.current.withinSlaPercentage.toFixed(1)}%`}
          icon={periodComparison.current.withinSlaPercentage >= 95 ? TrendingUp : TrendingDown}
          variant={periodComparison.current.withinSlaPercentage >= 95 ? "success" : "warning"}
          testId="kpi-sla-goal"
        />
      </div>

      <LineChart
        title="Evolução do SLA"
        data={slaEvolution}
        showTarget
        targetValue={95}
        targetLabel="Meta 95%"
        height={350}
        testId="chart-sla-evolution"
      />

      <LineChart
        title="Tendência de Atrasos"
        data={delayTrend}
        height={350}
        color="hsl(var(--destructive))"
        valueFormatter={(v) => v.toLocaleString("pt-BR")}
        testId="chart-delay-trend"
      />

      <BarChart
        title="Performance de Vendedores ao Longo do Tempo"
        data={sellerPerformanceChartData}
        height={400}
        targetLine={95}
        targetLabel="Meta 95%"
        valueFormatter={(v) => `${v.toFixed(1)}%`}
        testId="chart-seller-performance-trend"
      />
    </div>
  );
}
