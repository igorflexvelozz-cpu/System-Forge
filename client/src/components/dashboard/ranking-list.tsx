import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { RankingEntry } from "@shared/schema";

interface RankingListProps {
  title: string;
  entries: RankingEntry[];
  valueLabel?: string;
  valueFormatter?: (value: number) => string;
  showPercentage?: boolean;
  maxItems?: number;
  variant?: "default" | "danger" | "success";
  testId?: string;
}

export function RankingList({
  title,
  entries,
  valueLabel = "Total",
  valueFormatter = (v) => v.toLocaleString("pt-BR"),
  showPercentage = true,
  maxItems = 5,
  variant = "default",
  testId
}: RankingListProps) {
  const displayEntries = entries.slice(0, maxItems);
  const maxValue = Math.max(...displayEntries.map((e) => e.value), 1);

  const barColors = {
    default: "bg-chart-1",
    danger: "bg-red-500",
    success: "bg-emerald-500"
  };

  return (
    <Card data-testid={testId}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {displayEntries.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            Nenhum dado disponível
          </p>
        ) : (
          displayEntries.map((entry, index) => (
            <div key={entry.rank} className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-semibold">
                    {entry.rank}
                  </span>
                  <span className="font-medium truncate" title={entry.name}>
                    {entry.name}
                  </span>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                  <span className="font-semibold tabular-nums">
                    {valueFormatter(entry.value)}
                  </span>
                  {showPercentage && entry.percentage !== undefined && (
                    <span className="text-xs text-muted-foreground">
                      ({entry.percentage.toFixed(1)}%)
                    </span>
                  )}
                </div>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-500",
                    barColors[variant]
                  )}
                  style={{ width: `${(entry.value / maxValue) * 100}%` }}
                />
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
