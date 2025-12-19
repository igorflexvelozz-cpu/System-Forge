import { useQuery } from "@tanstack/react-query";
import { BarChart } from "@/components/dashboard/bar-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/dashboard/empty-state";
import { ChartSkeleton } from "@/components/dashboard/loading-skeleton";
import { Trophy, AlertTriangle, Package, Upload } from "lucide-react";
import { useLocation } from "wouter";
import { usePageTracking } from "@/hooks/use-analytics";
import type { RankingsData } from "@shared/schema";

export default function Rankings() {
  const [, setLocation] = useLocation();
  usePageTracking("Rankings", "/rankings");

  const { data, isLoading, error } = useQuery<RankingsData>({
    queryKey: ["/api/dashboard/rankings"]
  });

  if (isLoading) {
    return (
      <div className="p-8 space-y-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-foreground">Rankings</h1>
          <p className="text-sm text-muted-foreground">
            Rankings visuais de performance
          </p>
        </div>

        <div className="space-y-6">
          <ChartSkeleton height={400} />
          <ChartSkeleton height={400} />
          <ChartSkeleton height={400} />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 space-y-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-foreground">Rankings</h1>
          <p className="text-sm text-muted-foreground">
            Rankings visuais de performance
          </p>
        </div>
        <EmptyState
          title="Nenhum dado disponível"
          description="Faça upload das planilhas para visualizar os rankings."
          action={{
            label: "Fazer Upload",
            onClick: () => setLocation("/upload"),
            icon: Upload
          }}
          testId="empty-state-rankings"
        />
      </div>
    );
  }

  const { sellersByDelays, zonesByDelays, sellersByVolume } = data;

  const delaySellerChartData = sellersByDelays.map((e) => ({
    label: e.name,
    value: e.value,
    color: "hsl(var(--destructive))"
  }));

  const delayZoneChartData = zonesByDelays.map((e) => ({
    label: e.name,
    value: e.value,
    color: "hsl(var(--chart-4))"
  }));

  const volumeChartData = sellersByVolume.map((e) => ({
    label: e.name,
    value: e.value,
    color: "hsl(var(--chart-1))"
  }));

  return (
    <div className="p-8 space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-foreground" data-testid="text-page-title">
          Rankings
        </h1>
        <p className="text-sm text-muted-foreground">
          Rankings visuais de performance
        </p>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <CardTitle className="text-lg font-semibold">
              Vendedores com Mais Atrasos
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <BarChart
            title=""
            data={delaySellerChartData}
            height={400}
            valueFormatter={(v) => v.toLocaleString("pt-BR")}
            testId="chart-ranking-sellers-delays"
          />
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {sellersByDelays.slice(0, 10).map((entry) => (
              <div
                key={entry.rank}
                className="flex items-center gap-2 p-2 bg-muted/50 rounded-md"
              >
                <div className="flex items-center justify-center w-6 h-6 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full text-xs font-bold">
                  {entry.rank}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium truncate" title={entry.name}>
                    {entry.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {entry.value.toLocaleString("pt-BR")} atrasos
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            <CardTitle className="text-lg font-semibold">
              Zonas com Mais Atrasos
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <BarChart
            title=""
            data={delayZoneChartData}
            height={400}
            valueFormatter={(v) => v.toLocaleString("pt-BR")}
            testId="chart-ranking-zones-delays"
          />
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {zonesByDelays.slice(0, 10).map((entry) => (
              <div
                key={entry.rank}
                className="flex items-center gap-2 p-2 bg-muted/50 rounded-md"
              >
                <div className="flex items-center justify-center w-6 h-6 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-full text-xs font-bold">
                  {entry.rank}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium truncate" title={entry.name}>
                    {entry.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {entry.value.toLocaleString("pt-BR")} atrasos
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-chart-1" />
            <CardTitle className="text-lg font-semibold">
              Vendedores com Maior Volume de Pacotes
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <BarChart
            title=""
            data={volumeChartData}
            height={400}
            valueFormatter={(v) => v.toLocaleString("pt-BR")}
            testId="chart-ranking-sellers-volume"
          />
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {sellersByVolume.slice(0, 10).map((entry) => (
              <div
                key={entry.rank}
                className="flex items-center gap-2 p-2 bg-muted/50 rounded-md"
              >
                <div className="flex items-center justify-center w-6 h-6 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-xs font-bold">
                  {entry.rank}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium truncate" title={entry.name}>
                    {entry.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {entry.value.toLocaleString("pt-BR")} pacotes
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
