import { useQuery } from "@tanstack/react-query";
import { SellerCard } from "@/components/dashboard/seller-card";
import { BarChart } from "@/components/dashboard/bar-chart";
import { EmptyState } from "@/components/dashboard/empty-state";
import {
  SellerCardSkeleton,
  ChartSkeleton
} from "@/components/dashboard/loading-skeleton";
import { Upload } from "lucide-react";
import { useLocation } from "wouter";
import { usePageTracking, useAnalytics } from "@/hooks/use-analytics";
import type { SellersData } from "@shared/schema";

export default function Sellers() {
  const [, setLocation] = useLocation();
  const analytics = useAnalytics();
  usePageTracking("Vendedores", "/vendedores");

  const { data, isLoading, error } = useQuery<SellersData>({
    queryKey: ["/api/dashboard/sellers"]
  });

  if (isLoading) {
    return (
      <div className="p-8 space-y-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-foreground">Vendedores</h1>
          <p className="text-sm text-muted-foreground">
            Análise de performance por vendedor
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <SellerCardSkeleton key={i} />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
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
          <h1 className="text-2xl font-bold text-foreground">Vendedores</h1>
          <p className="text-sm text-muted-foreground">
            Análise de performance por vendedor
          </p>
        </div>
        <EmptyState
          title="Nenhum dado disponível"
          description="Faça upload das planilhas para visualizar os dados de vendedores."
          action={{
            label: "Fazer Upload",
            onClick: () => setLocation("/upload"),
            icon: Upload
          }}
          testId="empty-state-sellers"
        />
      </div>
    );
  }

  const { sellers, volumeChart, delaysChart, slaChart } = data;

  return (
    <div className="p-8 space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-foreground" data-testid="text-page-title">
          Vendedores
        </h1>
        <p className="text-sm text-muted-foreground">
          Análise de performance por vendedor
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {sellers.slice(0, 12).map((seller) => (
          <SellerCard
            key={seller.id}
            seller={seller}
            testId={`seller-card-${seller.id}`}
          />
        ))}
      </div>

      {sellers.length > 12 && (
        <p className="text-sm text-muted-foreground text-center">
          Exibindo 12 de {sellers.length} vendedores. Use os gráficos abaixo para análise completa.
        </p>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <BarChart
          title="Volume por Vendedor"
          data={volumeChart}
          height={350}
          color="hsl(var(--chart-1))"
          valueFormatter={(v) => v.toLocaleString("pt-BR")}
          testId="chart-seller-volume"
        />

        <BarChart
          title="Atrasos por Vendedor"
          data={delaysChart}
          height={350}
          color="hsl(var(--destructive))"
          valueFormatter={(v) => v.toLocaleString("pt-BR")}
          testId="chart-seller-delays"
        />

        <BarChart
          title="SLA por Vendedor"
          data={slaChart}
          height={350}
          targetLine={95}
          targetLabel="Meta 95%"
          valueFormatter={(v) => `${v.toFixed(1)}%`}
          testId="chart-seller-sla"
        />
      </div>
    </div>
  );
}
