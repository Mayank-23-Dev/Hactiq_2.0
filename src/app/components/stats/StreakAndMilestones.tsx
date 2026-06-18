// src/app/components/stats/StreakAndMilestones.tsx
import { memo } from "react";
import { Award, Flame, Zap, Trophy, CheckCircle, Clock, AlertTriangle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { Milestone } from "../../lib/stats-helper";
import { Goal } from "../../app/store";

interface StreakAndMilestonesProps {
  milestones: Milestone[];
  unfinishedGoals: Goal[];
  projectedStreak: { current: number; projected: number };
  avgTime: number;
}

export const StreakAndMilestones = memo(function StreakAndMilestones({
  milestones,
  unfinishedGoals,
  projectedStreak,
  avgTime
}: StreakAndMilestonesProps) {
  // Helper to map icon string to Lucide component
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "Award":
        return <Award className="w-5 h-5 text-indigo-500" />;
      case "Flame":
        return <Flame className="w-5 h-5 text-orange-500" />;
      case "Zap":
        return <Zap className="w-5 h-5 text-amber-500" />;
      case "Trophy":
        return <Trophy className="w-5 h-5 text-yellow-500" />;
      default:
        return <CheckCircle className="w-5 h-5 text-green-500" />;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Achievement Milestones */}
      <Card className="border border-border bg-card lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-lg font-bold tracking-tight">Milestones & Achievements</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {milestones.map((m) => (
              <div
                key={m.id}
                className={`p-3.5 border rounded-xl flex gap-3 transition-all ${
                  m.achieved
                    ? "border-green-500/30 bg-green-500/5 dark:bg-green-500/10"
                    : "border-border bg-card opacity-75"
                }`}
              >
                <div className="shrink-0 p-2 rounded-lg bg-background border border-border">
                  {getIcon(m.icon)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate text-foreground">{m.title}</p>
                  <p className="text-xs text-muted-foreground line-clamp-1">{m.description}</p>
                  {m.progress !== undefined && m.target !== undefined && (
                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            m.achieved ? "bg-green-500" : "bg-primary"
                          }`}
                          style={{ width: `${(m.progress / m.target) * 100}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-bold text-muted-foreground whitespace-nowrap">
                        {m.progress}/{m.target}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Streak Projection & Avg Completion Time */}
      <div className="flex flex-col gap-6">
        <Card className="border border-border bg-card flex-1">
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-muted-foreground">Streak Outlook</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col justify-center">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-2xl font-black text-foreground">{projectedStreak.current} Days</p>
                <p className="text-xs text-muted-foreground">Current Streak</p>
              </div>
              <Flame className="w-8 h-8 text-orange-500 shrink-0" />
            </div>
            <div className="p-3 bg-muted/50 border border-border rounded-xl">
              <p className="text-xs text-muted-foreground font-medium">Projected Streak (If trend holds)</p>
              <p className="text-lg font-bold text-primary mt-0.5">{projectedStreak.projected} Days</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border bg-card flex-1">
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-muted-foreground">Velocity & Time</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col justify-center">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-2xl font-black text-foreground">{avgTime} hrs</p>
                <p className="text-xs text-muted-foreground">Avg Goal Completion Time</p>
              </div>
              <Clock className="w-8 h-8 text-blue-500 shrink-0" />
            </div>
            <p className="text-[11px] text-muted-foreground">
              Based on priority weightings and deterministic dispatch logs.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Unfinished Business */}
      <Card className="border border-border bg-card lg:col-span-3">
        <CardHeader>
          <CardTitle className="text-lg font-bold tracking-tight">Unfinished Business</CardTitle>
        </CardHeader>
        <CardContent>
          {unfinishedGoals.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">All goals completed! Excellent job.</p>
          ) : (
            <div className="space-y-2.5">
              {unfinishedGoals.map((g) => (
                <div key={g.id} className="p-3 border border-border bg-card rounded-xl flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{g.title}</p>
                      <p className="text-[10px] text-muted-foreground">Date: {g.date} | Category: {g.category} | Priority: {g.priority}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded-md">
                    Pending
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
});
