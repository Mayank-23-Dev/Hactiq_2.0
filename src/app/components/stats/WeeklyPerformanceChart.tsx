// src/app/components/stats/WeeklyPerformanceChart.tsx
import { memo } from "react";
import { format } from "date-fns";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer
} from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";

export interface WeeklyChartItem {
  date: Date;
  set: number;
  completed: number;
}

interface WeeklyPerformanceChartProps {
  data: WeeklyChartItem[];
}

export const WeeklyPerformanceChart = memo(function WeeklyPerformanceChart({
  data
}: WeeklyPerformanceChartProps) {
  // Format data for Recharts
  const chartData = data.map(item => ({
    ...item,
    formattedDate: format(item.date, "MM/dd"),
    labelDate: format(item.date, "MMM dd, yyyy")
  }));

  // Find max value to configure YAxis domain
  const maxVal = Math.max(...chartData.map(d => Math.max(d.set, d.completed)), 4);

  return (
    <Card className="border border-border bg-card">
      <CardHeader>
        <CardTitle className="text-lg font-bold tracking-tight">Weekly Performance</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              barGap={4}
              barCategoryGap={12}
              margin={{ top: 10, right: 10, left: -5, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted/40" />
              <XAxis
                dataKey="formattedDate"
                axisLine={false}
                tickLine={false}
                tickMargin={10}
                className="text-xs font-medium fill-muted-foreground"
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
                domain={[0, Math.ceil(maxVal * 1.15)]}
                tickCount={6}
                width={35}
                className="text-xs font-medium fill-muted-foreground"
              />
              <Tooltip
                cursor={{ fill: "var(--muted)", fillOpacity: 0.15 }}
                contentStyle={{
                  backgroundColor: "var(--card)",
                  borderColor: "var(--border)",
                  borderRadius: "8px",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
                }}
                labelStyle={{ fontWeight: "bold", fontSize: "12px", color: "var(--foreground)" }}
                itemStyle={{ fontSize: "12px", padding: "2px 0", color: "var(--foreground)" }}
                labelFormatter={(_, items) => {
                  if (items && items[0]) {
                    return (items[0].payload as any).labelDate;
                  }
                  return "";
                }}
              />
              <Legend
                verticalAlign="top"
                align="right"
                iconType="circle"
                iconSize={8}
                wrapperStyle={{
                  paddingBottom: "15px",
                  fontSize: "12px",
                  fontWeight: 500
                }}
              />
              <Bar
                dataKey="set"
                name="Goals Set"
                fill="var(--primary)"
                radius={[4, 4, 0, 0]}
                barSize={20}
              />
              <Bar
                dataKey="completed"
                name="Completed"
                fill="#10b981"
                radius={[4, 4, 0, 0]}
                barSize={20}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
});
