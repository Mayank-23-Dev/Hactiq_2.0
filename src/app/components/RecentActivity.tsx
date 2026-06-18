// src/app/components/RecentActivity.tsx
import { useMemo } from "react";
import { Link } from "react-router";
import { useApp } from "../store";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { formatDistanceToNow, parseISO } from "date-fns";
import { getActivityIcon, getActivityIconColor } from "../../lib/activity-utils";
import { Sparkles, ArrowRight } from "lucide-react";

interface RecentActivityProps {
  limit?: number;
  showSeeAll?: boolean;
}

export function RecentActivity({ limit = 5, showSeeAll = true }: RecentActivityProps) {
  const { activities } = useApp();

  const sortedActivities = useMemo(() => {
    return [...activities]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }, [activities, limit]);

  // Helper to highlight text in single quotes
  const formatMessage = (msg: string) => {
    const parts = msg.split(/'([^']+)'/g);
    return parts.map((part, index) => {
      if (index % 2 === 1) {
        return (
          <strong key={index} className="font-semibold text-foreground">
            {part}
          </strong>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  return (
    <Card className="border border-border bg-card shadow-xs">
      <CardHeader className="flex flex-row items-center justify-between py-4 border-b border-border">
        <CardTitle className="text-base font-bold tracking-tight flex items-center gap-2">
          <Sparkles className="w-4.5 h-4.5 text-primary" />
          Recent Activity
        </CardTitle>
        {showSeeAll && activities.length > limit && (
          <Link
            to="/activities"
            className="text-xs text-muted-foreground hover:text-foreground font-semibold flex items-center gap-1 transition"
          >
            See all <ArrowRight size={12} />
          </Link>
        )}
      </CardHeader>
      <CardContent className="p-0 divide-y divide-border">
        {sortedActivities.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center px-4">
            <div className="p-3 bg-muted/30 dark:bg-muted/10 rounded-full text-muted-foreground">
              <Sparkles className="w-6 h-6 opacity-40" />
            </div>
            <p className="text-sm font-semibold text-muted-foreground mt-3">No recent activity</p>
            <p className="text-xs text-muted-foreground/60 mt-1">Actions you take will be logged here.</p>
          </div>
        ) : (
          sortedActivities.map((act) => {
            const Icon = getActivityIcon(act.type);
            const colorClass = getActivityIconColor(act.type);
            const timeAgo = formatDistanceToNow(parseISO(act.timestamp), { addSuffix: true });

            return (
              <div
                key={act.id}
                className={`flex items-center gap-3.5 px-5 py-3.5 transition-colors hover:bg-accent/40 ${
                  !act.read ? "bg-primary/5 dark:bg-primary/2" : ""
                }`}
              >
                <div className={`p-2 rounded-lg shrink-0 ${colorClass}`}>
                  <Icon size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-muted-foreground font-medium leading-snug truncate">
                    {formatMessage(act.message)}
                  </p>
                  {act.boardName && (
                    <span className="text-[10px] font-bold text-muted-foreground/75 bg-muted/40 px-2 py-0.5 rounded mt-1 inline-block">
                      {act.boardName}
                    </span>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <span className="text-[10px] font-medium text-muted-foreground whitespace-nowrap">
                    {timeAgo}
                  </span>
                  {!act.read && (
                    <span className="w-1.5 h-1.5 rounded-full bg-primary block ml-auto mt-1" />
                  )}
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
