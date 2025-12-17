import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell
} from "recharts";
import type { BarChartData } from "@shared/schema";

interface BarChartProps {
  title: string;
  data: BarChartData[];
  dataKey?: string;
  color?: string;
  showGrid?: boolean;
  targetLine?: number;
  targetLabel?: string;
  height?: number;
  valueFormatter?: (value: number) => string;
  labelFormatter?: (label: string) => string;
  testId?: string;
}

export function BarChart({
  title,
  data,
  dataKey = "value",
  color = "hsl(var(--chart-1))",
  showGrid = true,
  targetLine,
  targetLabel,
  height = 300,
  valueFormatter = (v) => v.toLocaleString("pt-BR"),
  labelFormatter = (l) => l,
  testId
}: BarChartProps) {
  const chartColors = [
    "hsl(var(--chart-1))",
    "hsl(var(--chart-2))",
    "hsl(var(--chart-3))",
    "hsl(var(--chart-4))",
    "hsl(var(--chart-5))"
  ];

  return (
    <Card data-testid={testId}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div style={{ height }}>
          <ResponsiveContainer width="100%" height="100%">
            <RechartsBarChart
              data={data}
              margin={{ top: 20, right: 20, left: 20, bottom: 60 }}
            >
              {showGrid && (
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="hsl(var(--border))"
                />
              )}
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                tickLine={false}
                axisLine={{ stroke: "hsl(var(--border))" }}
                angle={-45}
                textAnchor="end"
                height={60}
                tickFormatter={labelFormatter}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                tickLine={false}
                axisLine={false}
                tickFormatter={valueFormatter}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--popover))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "6px",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
                }}
                labelStyle={{ color: "hsl(var(--foreground))", fontWeight: 600 }}
                formatter={(value: number) => [valueFormatter(value), "Valor"]}
                labelFormatter={labelFormatter}
              />
              {targetLine !== undefined && (
                <ReferenceLine
                  y={targetLine}
                  stroke="hsl(var(--chart-2))"
                  strokeDasharray="5 5"
                  strokeWidth={2}
                  label={{
                    value: targetLabel || `Meta: ${targetLine}%`,
                    position: "right",
                    fill: "hsl(var(--chart-2))",
                    fontSize: 11
                  }}
                />
              )}
              <Bar
                dataKey={dataKey}
                radius={[4, 4, 0, 0]}
                maxBarSize={50}
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color || chartColors[index % chartColors.length]}
                  />
                ))}
              </Bar>
            </RechartsBarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
