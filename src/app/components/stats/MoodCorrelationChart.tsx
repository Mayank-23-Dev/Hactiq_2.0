// src/app/components/stats/MoodCorrelationChart.tsx
import { memo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { MoodEnergyCorrelation } from "../../lib/stats-helper";

interface MoodCorrelationChartProps {
  data: MoodEnergyCorrelation[];
}

export const MoodCorrelationChart = memo(function MoodCorrelationChart({
  data
}: MoodCorrelationChartProps) {
  const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ec4899", "#8b5cf6", "#ef4444"];

  const hasData = data.length > 0;

  return (
    <Card className="border border-border bg-card">
      <CardHeader>
        <CardTitle className="text-lg font-bold tracking-tight">Mood & Energy Correlation</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col justify-center min-h-[300px]">
        {!hasData ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-sm">No mood or energy metadata logged yet.</p>
            <p className="text-xs text-muted-foreground/60 mt-1">Start tracking your daily mood to unlock these insights.</p>
          </div>
        ) : (
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted/40" />
                <XAxis
                  dataKey="name"
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
                  formatter={(value, name, props) => {
                    if (name === "rate") {
                      return [`${value}% Completion`, "Average Rate"];
                    }
                    return [value, name];
                  }}
                  labelFormatter={(label) => {
                    const item = data.find(d => d.name === label);
                    return item ? `${label} Mood (${item.energyName} Energy)` : label;
                  }}
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    borderColor: "hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="rate" radius={[4, 4, 0, 0]} barSize={32}>
                  {data.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
});
