import { useQuery } from "@tanstack/react-query";
import { BarChart } from "@/components/dashboard/bar-chart";
import { DataTable, type Column } from "@/components/dashboard/data-table";
import { EmptyState } from "@/components/dashboard/empty-state";
import { ChartSkeleton, TableSkeleton } from "@/components/dashboard/loading-skeleton";
import { Upload } from "lucide-react";
import { useLocation } from "wouter";
import type { ZonesData, ZoneMetrics, CepMetrics } from "@shared/schema";

type ZoneCepTableRow = {
  zone: string;
  cep: string;
  volume: number;
  delays: number;
  slaAverage: number;
};

export default function Zones() {
  const [, setLocation] = useLocation();

  const { data, isLoading, error } = useQuery<ZonesData>({
    queryKey: ["/api/dashboard/zones"]
  });

  const zoneColumns: Column<ZoneCepTableRow>[] = [
    { key: "zone", header: "Zona", sortable: true },
    { key: "cep", header: "CEP", sortable: true },
    { 
      key: "volume", 
      header: "Volume", 
      sortable: true, 
      align: "right",
      accessor: (row) => row.volume.toLocaleString("pt-BR")
    },
    { 
      key: "delays", 
      header: "Atrasos", 
      sortable: true, 
      align: "right",
      accessor: (row) => row.delays.toLocaleString("pt-BR")
    },
    { 
      key: "slaAverage", 
      header: "SLA Médio", 
      sortable: true, 
      align: "right",
      accessor: (row) => `${row.slaAverage.toFixed(1)}%`
    }
  ];

  if (isLoading) {
    return (
      <div className="p-8 space-y-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-foreground">Zonas & CEPs</h1>
          <p className="text-sm text-muted-foreground">
            Análise de performance por zona e CEP
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ChartSkeleton height={350} />
          <ChartSkeleton height={350} />
        </div>

        <TableSkeleton rows={10} />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 space-y-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-foreground">Zonas & CEPs</h1>
          <p className="text-sm text-muted-foreground">
            Análise de performance por zona e CEP
          </p>
        </div>
        <EmptyState
          title="Nenhum dado disponível"
          description="Faça upload das planilhas para visualizar os dados de zonas e CEPs."
          action={{
            label: "Fazer Upload",
            onClick: () => setLocation("/upload"),
            icon: Upload
          }}
          testId="empty-state-zones"
        />
      </div>
    );
  }

  const { zones, ceps, zoneDelaysChart, cepDelaysChart } = data;

  const tableData: ZoneCepTableRow[] = ceps.map((cep) => {
    const zone = zones.find((z) => z.zone === cep.cep.substring(0, 3)) || zones[0];
    return {
      zone: zone?.zone || "-",
      cep: cep.cep,
      volume: cep.totalPackages,
      delays: cep.totalDelays,
      slaAverage: cep.slaPercentage
    };
  });

  return (
    <div className="p-8 space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-foreground" data-testid="text-page-title">
          Zonas & CEPs
        </h1>
        <p className="text-sm text-muted-foreground">
          Análise de performance por zona e CEP
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <BarChart
          title="Zonas com Mais Atrasos"
          data={zoneDelaysChart}
          height={350}
          color="hsl(var(--chart-4))"
          valueFormatter={(v) => v.toLocaleString("pt-BR")}
          testId="chart-zone-delays"
        />

        <BarChart
          title="CEPs Mais Problemáticos"
          data={cepDelaysChart}
          height={350}
          color="hsl(var(--chart-5))"
          valueFormatter={(v) => v.toLocaleString("pt-BR")}
          testId="chart-cep-delays"
        />
      </div>

      <DataTable
        title="Detalhamento por Zona e CEP"
        columns={zoneColumns as Column<Record<string, unknown>>[]}
        data={tableData as Record<string, unknown>[]}
        searchable
        searchPlaceholder="Buscar por zona ou CEP..."
        pageSize={25}
        emptyMessage="Nenhuma zona ou CEP encontrado"
        testId="table-zones-ceps"
      />
    </div>
  );
}
