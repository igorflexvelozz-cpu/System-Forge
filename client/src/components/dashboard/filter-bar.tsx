import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Calendar, Filter, X } from "lucide-react";
import type { FilterOptions } from "@shared/schema";

interface FilterValues {
  startDate?: string;
  endDate?: string;
  zone?: string;
  seller?: string;
  costCenter?: string;
}

interface FilterBarProps {
  options: FilterOptions;
  values: FilterValues;
  onChange: (values: FilterValues) => void;
  onApply?: () => void;
  onReset?: () => void;
  testId?: string;
}

export function FilterBar({
  options,
  values,
  onChange,
  onApply,
  onReset,
  testId
}: FilterBarProps) {
  const handleChange = (key: keyof FilterValues, value: string | undefined) => {
    onChange({ ...values, [key]: value === "all" ? undefined : value });
  };

  const hasFilters = Object.values(values).some((v) => v !== undefined && v !== "");

  return (
    <Card data-testid={testId}>
      <CardContent className="py-4">
        <div className="flex items-end gap-4 flex-wrap">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Filter className="w-4 h-4" />
            Filtros
          </div>

          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="start-date" className="text-xs">
                Data Início
              </Label>
              <div className="relative">
                <Input
                  id="start-date"
                  type="date"
                  value={values.startDate || ""}
                  onChange={(e) => handleChange("startDate", e.target.value)}
                  className="pr-8"
                  data-testid="input-filter-start-date"
                />
                <Calendar className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="end-date" className="text-xs">
                Data Fim
              </Label>
              <div className="relative">
                <Input
                  id="end-date"
                  type="date"
                  value={values.endDate || ""}
                  onChange={(e) => handleChange("endDate", e.target.value)}
                  className="pr-8"
                  data-testid="input-filter-end-date"
                />
                <Calendar className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="zone" className="text-xs">
                Zona
              </Label>
              <Select
                value={values.zone || "all"}
                onValueChange={(v) => handleChange("zone", v)}
              >
                <SelectTrigger id="zone" data-testid="select-filter-zone">
                  <SelectValue placeholder="Todas as zonas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as zonas</SelectItem>
                  {options.zones.map((zone) => (
                    <SelectItem key={zone} value={zone}>
                      {zone}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="seller" className="text-xs">
                Vendedor
              </Label>
              <Select
                value={values.seller || "all"}
                onValueChange={(v) => handleChange("seller", v)}
              >
                <SelectTrigger id="seller" data-testid="select-filter-seller">
                  <SelectValue placeholder="Todos os vendedores" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os vendedores</SelectItem>
                  {options.sellers.map((seller) => (
                    <SelectItem key={seller} value={seller}>
                      {seller}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="cost-center" className="text-xs">
                Centro de Custo
              </Label>
              <Select
                value={values.costCenter || "all"}
                onValueChange={(v) => handleChange("costCenter", v)}
              >
                <SelectTrigger id="cost-center" data-testid="select-filter-cost-center">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {options.costCenters.map((center) => (
                    <SelectItem key={center} value={center}>
                      {center}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onApply && (
              <Button onClick={onApply} data-testid="button-apply-filters">
                Aplicar
              </Button>
            )}
            {onReset && hasFilters && (
              <Button
                variant="outline"
                onClick={onReset}
                className="gap-1.5"
                data-testid="button-reset-filters"
              >
                <X className="w-4 h-4" />
                Limpar
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
