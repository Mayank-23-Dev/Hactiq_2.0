// src/app/components/goals/StatsView.tsx
import { useState, useMemo, useCallback, useEffect } from "react";
import { Layout } from "../Layout";
import { useApp } from "../../store";
import { Flame as Fire, CheckCircle, ListChecks, Bot, Sparkles, RefreshCw, BarChart3, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { format, subDays, eachDayOfInterval } from "date-fns";

// Subcomponents
import { WeeklyPerformanceChart } from "../stats/WeeklyPerformanceChart";
import { CategoryBreakdownChart } from "../stats/CategoryBreakdownChart";
import { ProductivityCharts } from "../stats/ProductivityCharts";
import { PriorityAndTrendCharts } from "../stats/PriorityAndTrendCharts";
import { MoodCorrelationChart } from "../stats/MoodCorrelationChart";
import { StreakAndMilestones } from "../stats/StreakAndMilestones";
import { DailyActivityHeatmap } from "../stats/DailyActivityHeatmap";

// Helper calculations
import {
  calculateCurrentStreak,
  getWeekdayPerformance,
  getHourlyProductivity,
  getGoalVelocity,
  getPriorityBreakdown,
  getMoodEnergyCorrelation,
  getAverageCompletionTime,
  getTopCategories,
  getGoalTrend,
  getUnfinishedBusiness,
  getMilestones,
  getProjectedStreak,
  getDailyHeatmap
} from "../../../lib/stats-helper";
import { generateInsights } from "../../../lib/groq";

export function StatsView() {
  const { goals, dailyMetadata, groqApiKey, aiFeaturesConfig, customConfig } = useApp();
  const [isCoaching, setIsCoaching] = useState(false);
  const [aiAdvice, setAiAdvice] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Simulated quick loading/recalculate state
  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    const timer = setTimeout(() => {
      setIsRefreshing(false);
      toast.success("Insights and analytics updated successfully");
    }, 450);
    return () => clearTimeout(timer);
  }, []);

  // Calculate metrics using useMemo
  const currentStreak = useMemo(() => calculateCurrentStreak(goals), [goals]);
  const totalGoalsSet = useMemo(() => goals.length, [goals]);

  const todayRate = useMemo(() => {
    const todayStr = format(new Date(), "yyyy-MM-dd");
    const todaysGoals = goals.filter(g => g.date === todayStr);
    const completed = todaysGoals.filter(g => g.completed).length;
    return todaysGoals.length > 0 ? Math.round((completed / todaysGoals.length) * 100) : 0;
  }, [goals]);

  // Weekly data prop formatted: { date: Date, set: number, completed: number }[]
  const weeklyData = useMemo(() => {
    const last7Days = eachDayOfInterval({
      start: subDays(new Date(), 6),
      end: new Date()
    });

    return last7Days.map(day => {
      const dStr = format(day, "yyyy-MM-dd");
      const dayGoals = goals.filter(g => g.date === dStr);
      return {
        date: day,
        set: dayGoals.length,
        completed: dayGoals.filter(g => g.completed).length
      };
    });
  }, [goals]);

  // Category breakdown
  const categoryData = useMemo(() => {
    const categoriesList = customConfig.categories;
    const last30DaysLimit = subDays(new Date(), 30);
    const recentGoals = goals.filter(g => new Date(g.date) >= last30DaysLimit);

    return categoriesList.map(cat => {
      const catGoals = recentGoals.filter(g => g.category === cat.id);
      const rate = catGoals.length > 0 ? Math.round((catGoals.filter(g => g.completed).length / catGoals.length) * 100) : 0;
      return { name: cat.name, total: catGoals.length, completed: catGoals.filter(g => g.completed).length, rate, id: cat.id };
    }).filter(c => c.total > 0);
  }, [goals, customConfig.categories]);

  // Weekday Performance
  const weekdayPerf = useMemo(() => getWeekdayPerformance(goals), [goals]);

  // Hourly Productivity
  const hourlyProductivity = useMemo(() => getHourlyProductivity(goals), [goals]);

  // Priority Breakdown
  const priorityBreakdown = useMemo(() => getPriorityBreakdown(goals), [goals]);

  // Mood/Energy Correlation
  const moodCorrelation = useMemo(() => getMoodEnergyCorrelation(goals, dailyMetadata), [goals, dailyMetadata]);

  // Avg Completion Time
  const avgTime = useMemo(() => getAverageCompletionTime(goals), [goals]);

  // Trend (30 Days)
  const trendData = useMemo(() => getGoalTrend(goals), [goals]);

  // Unfinished business
  const unfinishedGoals = useMemo(() => getUnfinishedBusiness(goals), [goals]);

  // Milestone checks
  const milestones = useMemo(() => getMilestones(goals), [goals]);

  // Projected Streak
  const projectedStreak = useMemo(() => getProjectedStreak(goals), [goals]);

  // Heatmap completed daily count
  const heatmapData = useMemo(() => getDailyHeatmap(goals), [goals]);

  // Goal Distribution: Completed vs Pending
  const distributionData = useMemo(() => {
    const completed = goals.filter(g => g.completed).length;
    const pending = goals.filter(g => !g.completed).length;
    return [
      { name: "Completed", value: completed },
      { name: "Pending", value: pending }
    ];
  }, [goals]);

  // Velocity Stats
  const velocity = useMemo(() => getGoalVelocity(goals), [goals]);

  const handleGetInsights = async () => {
    if (!groqApiKey) return toast.error("Groq API key required");
    setIsCoaching(true);
    try {
      const last30DaysLimit = subDays(new Date(), 30);
      const recentGoals = goals.filter(g => new Date(g.date) >= last30DaysLimit);
      const insights = await generateInsights(recentGoals, groqApiKey);
      setAiAdvice(insights);
    } catch (e: any) {
      toast.error("Failed to generate insights: " + e.message);
    } finally {
      setIsCoaching(false);
    }
  };

  return (
    <Layout title="Insights & Progress">
      <div className="p-6 max-w-7xl mx-auto space-y-8">
        {/* Page Title & Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
              <BarChart3 className="w-8 h-8 text-primary" />
              Insights & Progress
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Comprehensive analytics, trends, and productivity metrics.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              className="bg-muted hover:bg-muted/80 text-foreground p-2 rounded-lg border border-border transition flex items-center justify-center"
              title="Recalculate Insights"
            >
              <RefreshCw size={18} className={isRefreshing ? "animate-spin" : ""} />
            </button>
            {aiFeaturesConfig.aiInsights && (
              <button
                onClick={handleGetInsights}
                disabled={isCoaching || goals.length === 0}
                className="bg-primary/10 text-primary hover:bg-primary/20 font-bold py-2 px-4 rounded-lg border border-primary/20 transition flex items-center gap-2 disabled:opacity-50"
              >
                {isCoaching ? <Sparkles className="animate-spin" size={18} /> : <Bot size={18} />}
                Ask AI Coach
              </button>
            )}
          </div>
        </div>

        {/* AI Insights Card */}
        {aiAdvice && (
          <div className="p-6 rounded-xl border border-primary/30 bg-primary/5 flex items-start gap-4 shadow-sm animate-in fade-in-50 duration-300">
            <div className="p-3 bg-primary/10 rounded-full text-primary shrink-0"><Bot size={26} /></div>
            <div className="flex-1">
              <h3 className="font-bold text-primary mb-2 text-lg">AI Coach Insights (Last 30 Days)</h3>
              <div className="text-sm text-foreground/80 leading-relaxed whitespace-pre-line">
                {aiAdvice}
              </div>
              <button onClick={() => setAiAdvice(null)} className="mt-4 text-xs text-primary hover:underline font-semibold">Dismiss Insights</button>
            </div>
          </div>
        )}

        {/* Global Loading Overlay */}
        {isRefreshing ? (
          <div className="h-[400px] flex flex-col justify-center items-center gap-3">
            <RefreshCw className="animate-spin text-primary w-8 h-8" />
            <p className="text-sm text-muted-foreground font-medium">Analyzing goals and calculations...</p>
          </div>
        ) : (
          <>
            {/* Top Summaries */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard
                icon={<Fire size={24} className="text-orange-500" />}
                label="Current Streak"
                value={`${currentStreak} Days`}
                bgColor="bg-orange-500/10"
                secondaryLabel="Goal streak"
              />
              <StatCard
                icon={<CheckCircle size={24} className="text-green-500" />}
                label="Today's Rate"
                value={`${todayRate}%`}
                bgColor="bg-green-500/10"
                secondaryLabel="Today's goal completion"
              />
              <StatCard
                icon={<ListChecks size={24} className="text-blue-500" />}
                label="Total Goals Set"
                value={totalGoalsSet.toString()}
                bgColor="bg-blue-500/10"
                secondaryLabel="All time"
              />
            </div>

            {/* Velocity Overview */}
            <Card className="border border-border bg-card">
              <CardContent className="py-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center divide-y sm:divide-y-0 sm:divide-x divide-border">
                  <div className="pt-4 sm:pt-0">
                    <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Goal Velocity (7 Days)</p>
                    <p className="text-2xl font-extrabold mt-1 text-foreground">{velocity.last7Days} goals/day</p>
                  </div>
                  <div className="pt-4 sm:pt-0">
                    <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Goal Velocity (30 Days)</p>
                    <p className="text-2xl font-extrabold mt-1 text-foreground">{velocity.last30Days} goals/day</p>
                  </div>
                  <div className="pt-4 sm:pt-0">
                    <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Total Completed Goals</p>
                    <p className="text-2xl font-extrabold mt-1 text-foreground">{velocity.allTime} completed</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Chart Rows */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <WeeklyPerformanceChart data={weeklyData} />
              <CategoryBreakdownChart data={categoryData} />
            </div>

            <ProductivityCharts weekdayData={weekdayPerf} hourlyData={hourlyProductivity} />

            <PriorityAndTrendCharts priorityData={priorityBreakdown} trendData={trendData} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <MoodCorrelationChart data={moodCorrelation} />
              <DailyActivityHeatmap data={heatmapData} />
            </div>

            {/* Achievements, Streaks, and Pending Items */}
            <StreakAndMilestones
              milestones={milestones}
              unfinishedGoals={unfinishedGoals}
              projectedStreak={projectedStreak}
              avgTime={avgTime}
            />
          </>
        )}
      </div>
    </Layout>
  );
}

function StatCard({ icon, label, value, bgColor, secondaryLabel }: {
  icon: React.ReactNode;
  label: string;
  value: string;
  bgColor: string;
  secondaryLabel?: string;
}) {
  return (
    <Card className="border border-border bg-card">
      <CardContent className="flex items-center p-6">
        <div className={`${bgColor} p-3.5 rounded-xl mr-4 shrink-0`}>
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">{label}</p>
          <h3 className="text-2xl font-black mt-1 text-foreground truncate">{value}</h3>
          {secondaryLabel && (
            <p className="text-[10px] text-muted-foreground/80 mt-0.5 truncate">{secondaryLabel}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}