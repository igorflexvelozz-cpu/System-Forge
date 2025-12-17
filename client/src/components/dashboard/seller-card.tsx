import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, AlertTriangle, TrendingUp, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SellerMetrics } from "@shared/schema";

interface SellerCardProps {
  seller: SellerMetrics;
  testId?: string;
}

export function SellerCard({ seller, testId }: SellerCardProps) {
  const slaColor =
    seller.slaPercentage >= 95
      ? "text-emerald-600"
      : seller.slaPercentage >= 85
      ? "text-amber-500"
      : "text-red-500";

  const slaBadgeVariant =
    seller.slaPercentage >= 95
      ? "default"
      : seller.slaPercentage >= 85
      ? "secondary"
      : "destructive";

  return (
    <Card className="hover-elevate" data-testid={testId}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-foreground truncate" title={seller.name}>
              {seller.name}
            </h3>
            <p className="text-sm text-muted-foreground">
              Vendedor #{seller.id.slice(0, 8)}
            </p>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <Trophy className="w-4 h-4 text-amber-500" />
            <span className="text-sm font-bold">#{seller.rank}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Package className="w-4 h-4" />
              <span className="text-xs">Pacotes</span>
            </div>
            <p className="text-xl font-bold tabular-nums">
              {seller.totalPackages.toLocaleString("pt-BR")}
            </p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-xs">Atrasos</span>
            </div>
            <p className="text-xl font-bold text-red-500 tabular-nums">
              {seller.totalDelays.toLocaleString("pt-BR")}
            </p>
          </div>
        </div>

        <div className="pt-4 border-t flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <TrendingUp className={cn("w-4 h-4", slaColor)} />
            <span className="text-sm text-muted-foreground">SLA</span>
          </div>
          <Badge
            variant={slaBadgeVariant}
            className={cn(
              slaBadgeVariant === "default" && "bg-emerald-600 text-white"
            )}
          >
            {seller.slaPercentage.toFixed(1)}%
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
