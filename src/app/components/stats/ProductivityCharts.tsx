// src/app/components/stats/ProductivityCharts.tsx
import { memo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { WeekdayPerf } from "../../lib/stats-helper";

interface ProductivityChartsProps {
  weekdayData: WeekdayPerf[];
  hourlyData: { hour: string; count: number }[];
}

export const ProductivityCharts = memo(function ProductivityCharts({
  weekdayData,
  hourlyData
}: ProductivityChartsProps) {
  // Find weekday with highest completion rate
  const bestDay = weekdayData.reduce(
    (max, day) => (day.rate > max.rate ? day : max),
    { dayName: "None", rate: 0 }
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Weekday Performance */}
      <Card className="border border-border bg-card">
        <CardHeader className="flex flex-row justify-between items-center">
          <CardTitle className="text-lg font-bold tracking-tight">Weekday Completion</CardTitle>
          {bestDay.rate > 0 && (
            <span className="text-xs bg-green-500/15 text-green-500 px-2.5 py-1 rounded-full font-semibold">
              Best: {bestDay.dayName} ({bestDay.rate}%)
            </span>
          )}
        </CardHeader>
        <CardContent>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weekdayData} margin={{ top: 10, right: 10, left: -5, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted/40" />
                <XAxis
                  dataKey="dayName"
                  tickFormatter={(val) => val.substring(0, 3)}
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
                  width={40}
                  className="text-xs font-medium fill-muted-foreground"
                />
                <Tooltip
                  formatter={(value) => [`${value}%`, "Completion Rate"]}
                  contentStyle={{
                    backgroundColor: "var(--card)",
                    borderColor: "var(--border)",
                    borderRadius: "8px",
                  }}
                  itemStyle={{ color: "var(--foreground)" }}
                  labelStyle={{ color: "var(--foreground)", fontWeight: 600 }}
                  cursor={{ fill: "var(--muted)", fillOpacity: 0.15 }}
                />
                <Bar dataKey="rate" fill="var(--primary)" radius={[4, 4, 0, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Hourly Productivity */}
      <Card className="border border-border bg-card">
        <CardHeader>
          <CardTitle className="text-lg font-bold tracking-tight">Hourly Goal Completion</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={hourlyData} margin={{ top: 10, right: 10, left: -5, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted/40" />
                <XAxis
                  dataKey="hour"
                  axisLine={false}
                  tickLine={false}
                  tickMargin={8}
                  className="text-xs font-medium fill-muted-foreground"
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                  tickCount={5}
                  width={35}
                  className="text-xs font-medium fill-muted-foreground"
                />
                <Tooltip
                  formatter={(value) => [value, "Completed Goals"]}
                  contentStyle={{
                    backgroundColor: "var(--card)",
                    borderColor: "var(--border)",
                    borderRadius: "8px",
                  }}
                  itemStyle={{ color: "var(--foreground)" }}
                  labelStyle={{ color: "var(--foreground)", fontWeight: 600 }}
                />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="#8b5cf6"
                  fillOpacity={1}
                  fill="url(#colorCount)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});
