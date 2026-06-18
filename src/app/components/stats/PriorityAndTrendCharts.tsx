// src/app/components/stats/PriorityAndTrendCharts.tsx
import { memo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Cell, PieChart, Pie, Legend } from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { PriorityBreakdown } from "../../lib/stats-helper";

interface PriorityAndTrendChartsProps {
  priorityData: PriorityBreakdown[];
  trendData: { date: string; rate: number; count: number }[];
}

export const PriorityAndTrendCharts = memo(function PriorityAndTrendCharts({
  priorityData,
  trendData
}: PriorityAndTrendChartsProps) {
  const COLORS = ["#ef4444", "#f59e0b", "#3b82f6"]; // High, Medium, Low colors

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Priority Breakdown */}
      <Card className="border border-border bg-card">
        <CardHeader>
          <CardTitle className="text-lg font-bold tracking-tight">Priority Completion Rates</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col justify-center min-h-[250px]">
          <div className="h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={priorityData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted/40" />
                <XAxis
                  dataKey="priority"
                  axisLine={false}
                  tickLine={false}
                  tickMargin={8}
                  className="text-xs font-medium fill-muted-foreground"
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  domain={[0, 100]}
                  tickFormatter={(val) => `${val}%`}
                  tickCount={6}
                  className="text-xs font-medium fill-muted-foreground"
                />
                <Tooltip
                  formatter={(value) => [`${value}%`, "Completion Rate"]}
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    borderColor: "hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="rate" radius={[4, 4, 0, 0]} barSize={30}>
                  {priorityData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Goal Completion Trend */}
      <Card className="border border-border bg-card">
        <CardHeader>
          <CardTitle className="text-lg font-bold tracking-tight">30-Day Completion Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted/40" />
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tickMargin={8}
                  className="text-xs font-medium fill-muted-foreground"
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  domain={[0, 100]}
                  tickFormatter={(val) => `${val}%`}
                  tickCount={6}
                  className="text-xs font-medium fill-muted-foreground"
                />
                <Tooltip
                  formatter={(value) => [`${value}%`, "Completion Rate"]}
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    borderColor: "hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="rate"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2.5}
                  dot={{ r: 2, strokeWidth: 1 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});
