// src/app/components/stats/CategoryBreakdownChart.tsx
import { memo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";

export interface CategoryData {
  name: string;
  total: number;
  completed: number;
  rate: number;
}

interface CategoryBreakdownChartProps {
  data: CategoryData[];
}

export const CategoryBreakdownChart = memo(function CategoryBreakdownChart({
  data
}: CategoryBreakdownChartProps) {
  const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#14b8a6", "#6366f1"];

  const hasData = data.some(d => d.total > 0);

  return (
    <Card className="border border-border bg-card">
      <CardHeader>
        <CardTitle className="text-lg font-bold tracking-tight">Category Completion Breakdown</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center min-h-[300px]">
        {!hasData ? (
          <p className="text-muted-foreground text-sm text-center">No category data logged yet.</p>
        ) : (
          <div className="h-[280px] w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="rate"
                  nameKey="name"
                >
                  {data.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => [`${value}% Completion`, "Category"]}
                  contentStyle={{
                    backgroundColor: "var(--card)",
                    borderColor: "var(--border)",
                    borderRadius: "8px",
                  }}
                  itemStyle={{ color: "var(--foreground)" }}
                  labelStyle={{ color: "var(--foreground)", fontWeight: 600 }}
                />
                <Legend
                  verticalAlign="bottom"
                  align="center"
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{
                    fontSize: "12px",
                    fontWeight: 500,
                    paddingTop: "10px"
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
});
