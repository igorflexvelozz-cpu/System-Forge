import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Legend
} from "recharts";
import type { LineChartData } from "@shared/schema";

interface LineChartProps {
  title: string;
  data: LineChartData[];
  showTarget?: boolean;
  targetValue?: number;
  targetLabel?: string;
  height?: number;
  valueFormatter?: (value: number) => string;
  dateFormatter?: (date: string) => string;
  color?: string;
  showLegend?: boolean;
  testId?: string;
}

export function LineChart({
  title,
  data,
  showTarget = false,
  targetValue = 95,
  targetLabel = "Meta 95%",
  height = 300,
  valueFormatter = (v) => `${v.toFixed(1)}%`,
  dateFormatter = (d) => {
    const date = new Date(d);
    return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
  },
  color = "hsl(var(--chart-1))",
  showLegend = false,
  testId
}: LineChartProps) {
  return (
    <Card data-testid={testId}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div style={{ height }}>
          <ResponsiveContainer width="100%" height="100%">
            <RechartsLineChart
              data={data}
              margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="hsl(var(--border))"
              />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                tickLine={false}
                axisLine={{ stroke: "hsl(var(--border))" }}
                tickFormatter={dateFormatter}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                tickLine={false}
                axisLine={false}
                tickFormatter={valueFormatter}
                domain={[0, 100]}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--popover))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "6px",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
                }}
                labelStyle={{ color: "hsl(var(--foreground))", fontWeight: 600 }}
                formatter={(value: number) => [valueFormatter(value), "SLA"]}
                labelFormatter={dateFormatter}
              />
              {showLegend && <Legend />}
              {showTarget && (
                <ReferenceLine
                  y={targetValue}
                  stroke="hsl(var(--chart-2))"
                  strokeDasharray="5 5"
                  strokeWidth={2}
                  label={{
                    value: targetLabel,
                    position: "right",
                    fill: "hsl(var(--chart-2))",
                    fontSize: 11
                  }}
                />
              )}
              <Line
                type="monotone"
                dataKey="value"
                stroke={color}
                strokeWidth={2}
                dot={{ fill: color, strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, fill: color }}
              />
            </RechartsLineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
