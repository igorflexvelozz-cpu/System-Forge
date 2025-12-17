import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { LineChart } from "@/components/dashboard/line-chart";
import { FilterBar } from "@/components/dashboard/filter-bar";
import { DataTable, type Column } from "@/components/dashboard/data-table";
import { EmptyState } from "@/components/dashboard/empty-state";
import { ChartSkeleton, TableSkeleton } from "@/components/dashboard/loading-skeleton";
import { Badge } from "@/components/ui/badge";
import { Upload } from "lucide-react";
import { useLocation } from "wouter";
import type { SlaPerformanceData, PackageRecord, FilterOptions } from "@shared/schema";

interface FilterValues {
  startDate?: string;
  endDate?: string;
  zone?: string;
  seller?: string;
  costCenter?: string;
}

export default function SlaPerformance() {
  const [, setLocation] = useLocation();
  const [filters, setFilters] = useState<FilterValues>({});

  const { data: filterOptions } = useQuery<FilterOptions>({
    queryKey: ["/api/filters"]
  });

  const queryParams = new URLSearchParams();
  if (filters.startDate) queryParams.set("startDate", filters.startDate);
  if (filters.endDate) queryParams.set("endDate", filters.endDate);
  if (filters.zone) queryParams.set("zone", filters.zone);
  if (filters.seller) queryParams.set("seller", filters.seller);
  if (filters.costCenter) queryParams.set("costCenter", filters.costCenter);

  const { data, isLoading, error, refetch } = useQuery<SlaPerformanceData>({
    queryKey: ["/api/dashboard/sla-performance", queryParams.toString()]
  });

  const columns: Column<PackageRecord>[] = [
    { key: "pedido", header: "Pedido", sortable: true },
    { key: "vendedor", header: "Vendedor", sortable: true },
    { key: "zona", header: "Zona", sortable: true },
    { key: "previsaoEntrega", header: "Prazo", sortable: true },
    { key: "entrega", header: "Entrega", sortable: true },
    { 
      key: "atraso", 
      header: "Atraso (dias)", 
      sortable: true,
      align: "right",
      accessor: (row) => row.atraso !== undefined ? `${row.atraso}d` : "-"
    },
    {
      key: "sla",
      header: "Status SLA",
      sortable: true,
      accessor: (row) => {
        switch (row.sla) {
          case "dentro_prazo":
            return "Dentro do Prazo";
          case "fora_prazo":
            return "Fora do Prazo";
          case "atrasado":
            return "Atrasado";
          case "nao_entregue":
            return "Não Entregue";
          default:
            return "-";
        }
      }
    }
  ];

  const handleReset = () => {
    setFilters({});
  };

  if (isLoading) {
    return (
      <div className="p-8 space-y-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-foreground">SLA de Performance</h1>
          <p className="text-sm text-muted-foreground">
            Análise detalhada de SLA por período
          </p>
        </div>
        <ChartSkeleton height={350} />
        <TableSkeleton rows={10} />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 space-y-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-foreground">SLA de Performance</h1>
          <p className="text-sm text-muted-foreground">
            Análise detalhada de SLA por período
          </p>
        </div>
        <EmptyState
          title="Nenhum dado disponível"
          description="Faça upload das planilhas para visualizar os dados de SLA de performance."
          action={{
            label: "Fazer Upload",
            onClick: () => setLocation("/upload"),
            icon: Upload
          }}
          testId="empty-state-sla"
        />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-foreground" data-testid="text-page-title">
          SLA de Performance
        </h1>
        <p className="text-sm text-muted-foreground">
          Análise detalhada de SLA por período
        </p>
      </div>

      {filterOptions && (
        <FilterBar
          options={filterOptions}
          values={filters}
          onChange={setFilters}
          onApply={() => refetch()}
          onReset={handleReset}
          testId="filter-bar-sla"
        />
      )}

      <LineChart
        title="Evolução do SLA por Período"
        data={data.slaTrend}
        showTarget
        targetValue={95}
        targetLabel="Meta 95%"
        height={350}
        testId="chart-sla-trend"
      />

      <DataTable
        title="Tabela Analítica de SLA"
        columns={columns as Column<Record<string, unknown>>[]}
        data={data.records as Record<string, unknown>[]}
        searchable
        searchPlaceholder="Buscar por pedido, vendedor, zona..."
        pageSize={25}
        emptyMessage="Nenhum registro encontrado com os filtros selecionados"
        testId="table-sla-records"
      />
    </div>
  );
}
