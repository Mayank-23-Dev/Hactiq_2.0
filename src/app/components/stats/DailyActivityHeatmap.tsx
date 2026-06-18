// src/app/components/stats/DailyActivityHeatmap.tsx
import { memo } from "react";
import { format, parseISO } from "date-fns";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "../ui/tooltip";

interface DailyActivityHeatmapProps {
  data: { date: string; count: number }[];
}

export const DailyActivityHeatmap = memo(function DailyActivityHeatmap({
  data
}: DailyActivityHeatmapProps) {
  // Helper to choose bg color based on activity count
  const getHeatmapColorClass = (count: number) => {
    if (count === 0) return "bg-muted/40 dark:bg-muted/15 border-muted-foreground/5 hover:bg-muted/60";
    if (count === 1) return "bg-green-500/20 text-green-700 dark:text-green-300 hover:bg-green-500/30";
    if (count === 2) return "bg-green-500/40 text-green-800 dark:text-green-200 hover:bg-green-500/50";
    if (count === 3) return "bg-green-500/60 text-white hover:bg-green-500/70";
    return "bg-green-500/85 text-white hover:bg-green-500/95";
  };

  return (
    <Card className="border border-border bg-card">
      <CardHeader>
        <CardTitle className="text-lg font-bold tracking-tight">Daily Activity Heatmap (Last 30 Days)</CardTitle>
      </CardHeader>
      <CardContent>
        <TooltipProvider>
          <div className="flex flex-wrap gap-2.5 justify-center py-2">
            {data.map((item) => {
              const parsedDate = parseISO(item.date);
              const formattedDateLabel = format(parsedDate, "MMM dd, yyyy");

              return (
                <Tooltip key={item.date}>
                  <TooltipTrigger asChild>
                    <div
                      className={`w-9 h-9 rounded-lg border flex items-center justify-center text-[10px] font-bold cursor-help transition-colors select-none ${getHeatmapColorClass(
                        item.count
                      )}`}
                    >
                      {item.count > 0 ? item.count : ""}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <div className="text-center font-medium">
                      <p className="text-xs">{formattedDateLabel}</p>
                      <p className="text-[10px] text-primary-foreground/80 mt-0.5">
                        {item.count} goal{item.count === 1 ? "" : "s"} completed
                      </p>
                    </div>
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </div>
        </TooltipProvider>
        <div className="flex justify-center items-center gap-4 mt-4 text-[10px] text-muted-foreground font-semibold">
          <span className="flex items-center gap-1.5"><span className="w-3.5 h-3.5 rounded bg-muted/40 border border-border" /> 0 completed</span>
          <span className="flex items-center gap-1.5"><span className="w-3.5 h-3.5 rounded bg-green-500/20 border border-border" /> 1 completed</span>
          <span className="flex items-center gap-1.5"><span className="w-3.5 h-3.5 rounded bg-green-500/65 border border-border" /> 3 completed</span>
          <span className="flex items-center gap-1.5"><span className="w-3.5 h-3.5 rounded bg-green-500/85 border border-border" /> 4+ completed</span>
        </div>
      </CardContent>
    </Card>
  );
});
