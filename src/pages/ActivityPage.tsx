// src/pages/ActivityPage.tsx
import { useEffect, useState, useMemo } from "react";
import { Layout } from "../app/components/Layout";
import { useApp } from "../app/store";
import { formatDistanceToNow, parseISO } from "date-fns";
import { getActivityIcon, getActivityIconColor, ActivityType } from "../lib/activity-utils";
import { Trash2, Search, Filter, Sparkles, CheckCheck } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "../app/components/ui/card";

export default function ActivityPage() {
  const { activities, markAllActivitiesAsRead } = useApp();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");

  // Mark all as read when visiting page
  useEffect(() => {
    markAllActivitiesAsRead();
  }, [markAllActivitiesAsRead]);

  // Types list for filtering
  const filterOptions = [
    { id: "all", label: "All Activities" },
    { id: "goal_created", label: "Created" },
    { id: "goal_completed", label: "Completed" },
    { id: "goal_deleted", label: "Deleted" },
    { id: "goal_moved", label: "Moved" },
    { id: "board_created", label: "Boards" },
    { id: "goal_edited", label: "Updates" },
    { id: "carried_forward", label: "Carried Forward" }
  ];

  // Filtering activities
  const filteredActivities = useMemo(() => {
    return activities
      .filter((act) => {
        const matchesSearch = act.message.toLowerCase().includes(searchTerm.toLowerCase()) || 
          (act.boardName && act.boardName.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesFilter = filterType === "all" || act.type === filterType;
        return matchesSearch && matchesFilter;
      })
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [activities, searchTerm, filterType]);

  // Helper to format messages
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
    <Layout title="Activity Feed">
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
              <Sparkles className="w-8 h-8 text-primary" />
              Activity Feed
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Review and audit actions taken across your boards and goal tracker.
            </p>
          </div>
        </div>

        {/* Filters and Search */}
        <Card className="border border-border bg-card shadow-xs">
          <CardContent className="p-4 flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative flex items-center">
              <Search className="absolute left-3 w-4 h-4 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                placeholder="Search by action or title..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm bg-muted/40 border border-border rounded-lg outline-none focus:ring-2 focus:ring-ring text-foreground"
              />
            </div>
            <div className="flex gap-2 flex-wrap items-center">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="bg-muted/40 border border-border rounded-lg text-sm px-3 py-2 outline-none focus:ring-2 focus:ring-ring text-foreground"
              >
                {filterOptions.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Timeline */}
        <Card className="border border-border bg-card shadow-xs">
          <CardContent className="p-0 divide-y divide-border">
            {filteredActivities.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center px-4">
                <div className="p-4 bg-muted/30 dark:bg-muted/10 rounded-full text-muted-foreground">
                  <Sparkles className="w-8 h-8 opacity-40" />
                </div>
                <p className="text-base font-bold text-muted-foreground mt-4">No activities logged</p>
                <p className="text-sm text-muted-foreground/60 mt-1">
                  Adjust your search or filter settings, or start taking actions in the workspace.
                </p>
              </div>
            ) : (
              filteredActivities.map((act) => {
                const Icon = getActivityIcon(act.type);
                const colorClass = getActivityIconColor(act.type);
                const timeAgo = formatDistanceToNow(parseISO(act.timestamp), { addSuffix: true });

                return (
                  <div
                    key={act.id}
                    className="flex items-start gap-4 px-6 py-4.5 transition-colors hover:bg-accent/30"
                  >
                    <div className={`p-2.5 rounded-lg shrink-0 mt-0.5 ${colorClass}`}>
                      <Icon size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-muted-foreground leading-snug">
                        {formatMessage(act.message)}
                      </p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-[10px] font-semibold text-muted-foreground">
                          {timeAgo}
                        </span>
                        {act.boardName && (
                          <>
                            <span className="text-muted-foreground/50">·</span>
                            <span className="text-[10px] font-bold text-muted-foreground/80 bg-muted px-2 py-0.5 rounded">
                              {act.boardName}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
