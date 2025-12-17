import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { DataTable, type Column } from "@/components/dashboard/data-table";
import { EmptyState } from "@/components/dashboard/empty-state";
import { TableSkeleton } from "@/components/dashboard/loading-skeleton";
import { Badge } from "@/components/ui/badge";
import { Upload, Download } from "lucide-react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import type { ConsolidatedData, PackageRecord } from "@shared/schema";

export default function ConsolidatedBase() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data, isLoading, error } = useQuery<ConsolidatedData>({
    queryKey: ["/api/dashboard/consolidated"]
  });

  const columns: Column<PackageRecord>[] = [
    { key: "pedido", header: "Pedido", sortable: true },
    { key: "dataPedido", header: "Data Pedido", sortable: true },
    { key: "vendedor", header: "Vendedor", sortable: true },
    { key: "zona", header: "Zona", sortable: true },
    { key: "cep", header: "CEP", sortable: true },
    { key: "cidade", header: "Cidade", sortable: true },
    { key: "bairro", header: "Bairro", sortable: true },
    { key: "statusDoDia", header: "Status Logmanager", sortable: true },
    { key: "statusDiaGestora", header: "Status Gestora", sortable: true },
    { key: "previsaoEntrega", header: "Previsão Entrega", sortable: true },
    { key: "entrega", header: "Entrega", sortable: true },
    { 
      key: "prazo", 
      header: "Prazo (dias)", 
      sortable: true, 
      align: "right",
      accessor: (row) => row.prazo?.toString() || "-"
    },
    { 
      key: "atraso", 
      header: "Atraso (dias)", 
      sortable: true, 
      align: "right",
      accessor: (row) => row.atraso !== undefined && row.atraso !== null ? row.atraso.toString() : "-"
    },
    {
      key: "sla",
      header: "SLA",
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
    },
    { key: "cliente", header: "Cliente", sortable: true },
    { key: "nomeComprador", header: "Comprador", sortable: true },
    { key: "conta", header: "Conta", sortable: true },
    { key: "centroDeCusto", header: "Centro de Custo", sortable: true },
    { key: "frete", header: "Frete", sortable: true },
    { key: "responsabilidade", header: "Responsabilidade", sortable: true },
    { key: "etiqueta", header: "Etiqueta", sortable: true },
    { key: "pacote", header: "Pacote", sortable: true },
    { key: "logradouro", header: "Logradouro", sortable: true },
    { key: "numero", header: "Número", sortable: true },
    { key: "complemento", header: "Complemento", sortable: true }
  ];

  const handleExport = async () => {
    try {
      const response = await fetch("/api/export/consolidated");
      if (!response.ok) throw new Error("Erro ao exportar");
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `base-consolidada-${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Exportação concluída",
        description: "O arquivo foi baixado com sucesso."
      });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Erro na exportação",
        description: "Não foi possível exportar os dados."
      });
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 space-y-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-foreground">Base Consolidada</h1>
          <p className="text-sm text-muted-foreground">
            Todos os dados mesclados das planilhas
          </p>
        </div>
        <TableSkeleton rows={15} />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 space-y-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-foreground">Base Consolidada</h1>
          <p className="text-sm text-muted-foreground">
            Todos os dados mesclados das planilhas
          </p>
        </div>
        <EmptyState
          title="Nenhum dado disponível"
          description="Faça upload das planilhas para visualizar a base consolidada."
          action={{
            label: "Fazer Upload",
            onClick: () => setLocation("/upload"),
            icon: Upload
          }}
          testId="empty-state-consolidated"
        />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-foreground" data-testid="text-page-title">
            Base Consolidada
          </h1>
          <p className="text-sm text-muted-foreground">
            Todos os dados mesclados das planilhas
          </p>
        </div>
        <Badge variant="secondary" className="text-sm">
          {data.totalRecords.toLocaleString("pt-BR")} registros
        </Badge>
      </div>

      <DataTable
        columns={columns as Column<Record<string, unknown>>[]}
        data={data.records as Record<string, unknown>[]}
        searchable
        searchPlaceholder="Buscar por pedido, vendedor, CEP, cidade..."
        pageSize={50}
        pageSizeOptions={[25, 50, 100, 250]}
        onExport={handleExport}
        exportLabel="Exportar CSV"
        emptyMessage="Nenhum registro encontrado"
        testId="table-consolidated"
      />
    </div>
  );
}
