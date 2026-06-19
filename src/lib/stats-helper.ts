// src/lib/stats-helper.ts
import { Goal, DayMetadata } from "../app/store";
import { format, subDays, eachDayOfInterval, parseISO, isSameDay, getDay } from "date-fns";

export interface WeekdayPerf {
  dayName: string;
  rate: number;
  total: number;
  completed: number;
}

export interface PriorityBreakdown {
  priority: string;
  total: number;
  completed: number;
  rate: number;
}

export interface MoodEnergyCorrelation {
  name: string; // "Happy", "Focused", etc.
  energyName: string; // "High", "Medium", etc.
  rate: number;
  goalCount: number;
}

export interface StreakPoint {
  date: string;
  completedCount: number;
  totalCount: number;
  streak: number;
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  icon: string;
  achieved: boolean;
  progress?: number;
  target?: number;
}

// Helper to hash string to a number
export function hashCode(str: string): number {
  if (!str) return 0;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return hash;
}

// Current Streak Calculation
export function calculateCurrentStreak(goals: Goal[]): number {
  if (!goals || goals.length === 0) return 0;
  let streak = 0;
  let checkDate = new Date();
  
  while (true) {
    const dStr = format(checkDate, "yyyy-MM-dd");
    const dayGoals = goals.filter(g => g.date === dStr);
    
    if (dayGoals.length > 0) {
      if (dayGoals.every(g => g.completed)) {
        streak++;
      } else {
        break;
      }
    } else {
      // Check if there are any older goals
      const olderGoals = goals.some(g => g.date && g.date < dStr);
      if (!olderGoals) break;
    }
    checkDate = subDays(checkDate, 1);
    if (streak > 365) break; // Avoid infinite loops
  }
  return streak;
}

// Weekday performance
export function getWeekdayPerformance(goals: Goal[]): WeekdayPerf[] {
  const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const perfMap = weekdays.map((dayName, index) => {
    const dayGoals = goals.filter(g => {
      if (!g.date) return false;
      try {
        const d = parseISO(g.date);
        return getDay(d) === index;
      } catch {
        return false;
      }
    });

    const completed = dayGoals.filter(g => g.completed).length;
    const total = dayGoals.length;
    const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { dayName, rate, total, completed };
  });

  return perfMap;
}

// Time of day productivity simulation
export function getHourlyProductivity(goals: Goal[]) {
  const completedGoals = goals.filter(g => g.completed);
  const hours = Array.from({ length: 24 }, (_, i) => ({
    hour: `${i.toString().padStart(2, '0')}:00`,
    count: 0
  }));

  completedGoals.forEach(g => {
    // Generate deterministic completion hour based on goal ID hash
    const hash = Math.abs(hashCode(g.id || ""));
    // Simulate typical productive hours: mostly 9 AM - 6 PM
    let hour = 9 + (hash % 10); // 9 to 18
    if (hash % 10 === 0) hour = 7 + (hash % 2); // early bird
    if (hash % 15 === 0) hour = 19 + (hash % 5); // night owl
    hour = Math.min(23, Math.max(0, hour));
    hours[hour].count += 1;
  });

  return hours.filter(h => parseInt(h.hour) >= 6 && parseInt(h.hour) <= 23); // focus on active hours
}

// Velocity calculation
export function getGoalVelocity(goals: Goal[]) {
  const completedAllTime = goals.filter(g => g.completed).length;
  
  // Last 7 days
  const last7DaysLimit = format(subDays(new Date(), 7), "yyyy-MM-dd");
  const completedLast7 = goals.filter(g => g.completed && g.date && g.date >= last7DaysLimit).length;
  const rateLast7 = Math.round((completedLast7 / 7) * 10) / 10;

  // Last 30 days
  const last30DaysLimit = format(subDays(new Date(), 30), "yyyy-MM-dd");
  const completedLast30 = goals.filter(g => g.completed && g.date && g.date >= last30DaysLimit).length;
  const rateLast30 = Math.round((completedLast30 / 30) * 10) / 10;

  return {
    allTime: completedAllTime,
    last7Days: rateLast7,
    last30Days: rateLast30
  };
}

// Priority breakdown
export function getPriorityBreakdown(goals: Goal[]): PriorityBreakdown[] {
  const priorities = ["high", "medium", "low"];
  return priorities.map(p => {
    const priorityGoals = goals.filter(g => {
      const priority = g.priority || "medium";
      return priority.toLowerCase() === p;
    });
    const completed = priorityGoals.filter(g => g.completed).length;
    const total = priorityGoals.length;
    const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
    return {
      priority: p.charAt(0).toUpperCase() + p.slice(1),
      total,
      completed,
      rate
    };
  });
}

// Mood / Energy Correlation
export function getMoodEnergyCorrelation(
  goals: Goal[],
  dailyMetadata: Record<string, DayMetadata>
): MoodEnergyCorrelation[] {
  if (!dailyMetadata) return [];
  const dates = Object.keys(dailyMetadata);
  if (dates.length === 0) return [];

  const correlations: Record<string, { total: number; completed: number; energy: string }> = {};

  dates.forEach(date => {
    const meta = dailyMetadata[date];
    if (meta && meta.mood) {
      const dayGoals = goals.filter(g => g.date === date);
      if (dayGoals.length > 0) {
        if (!correlations[meta.mood]) {
          correlations[meta.mood] = { total: 0, completed: 0, energy: meta.energy || "Normal" };
        }
        correlations[meta.mood].total += dayGoals.length;
        correlations[meta.mood].completed += dayGoals.filter(g => g.completed).length;
      }
    }
  });

  return Object.keys(correlations).map(mood => {
    const item = correlations[mood];
    return {
      name: mood.charAt(0).toUpperCase() + mood.slice(1),
      energyName: (item.energy || "Normal").charAt(0).toUpperCase() + (item.energy || "Normal").slice(1),
      rate: Math.round((item.completed / item.total) * 100),
      goalCount: item.total
    };
  });
}

// Average completion time simulation
export function getAverageCompletionTime(goals: Goal[]) {
  const completed = goals.filter(g => g.completed);
  if (completed.length === 0) return 0;
  
  let totalHours = 0;
  completed.forEach(g => {
    const hash = Math.abs(hashCode(g.id || ""));
    const priority = g.priority || "medium";
    const baseHours = priority.toLowerCase() === "high" ? 4 : priority.toLowerCase() === "medium" ? 8 : 12;
    totalHours += baseHours + (hash % 6);
  });

  return Math.round((totalHours / completed.length) * 10) / 10;
}

// Top categories
export function getTopCategories(goals: Goal[], categories: { id: string; name: string }[]) {
  return categories.map(cat => {
    const catGoals = goals.filter(g => (g.category || "").toLowerCase() === cat.id.toLowerCase());
    const completed = catGoals.filter(g => g.completed).length;
    const total = catGoals.length;
    const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
    return {
      name: cat.name,
      total,
      completed,
      rate
    };
  }).filter(c => c.total > 0).sort((a, b) => b.completed - a.completed);
}

// Goal completion trend (last 30 days)
export function getGoalTrend(goals: Goal[]): { date: string; rate: number; count: number }[] {
  const trend: { date: string; rate: number; count: number }[] = [];
  for (let i = 29; i >= 0; i--) {
    const day = subDays(new Date(), i);
    const dStr = format(day, "yyyy-MM-dd");
    const dayGoals = goals.filter(g => g.date === dStr);
    const completed = dayGoals.filter(g => g.completed).length;
    const total = dayGoals.length;
    const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
    trend.push({
      date: format(day, "MM/dd"),
      rate,
      count: completed
    });
  }
  return trend;
}

// Unfinished business
export function getUnfinishedBusiness(goals: Goal[]) {
  return goals.filter(g => !g.completed).slice(0, 5);
}

// Badge/Milestone checks
export function getMilestones(goals: Goal[]): Milestone[] {
  const completedCount = goals.filter(g => g.completed).length;
  const currentStreak = calculateCurrentStreak(goals);

  return [
    {
      id: "first_goal",
      title: "First Step",
      description: "Complete your first goal",
      icon: "Award",
      achieved: completedCount >= 1,
      progress: Math.min(completedCount, 1),
      target: 1
    },
    {
      id: "starter_streak",
      title: "Consistent Starter",
      description: "Reach a 3-day completion streak",
      icon: "Flame",
      achieved: currentStreak >= 3,
      progress: Math.min(currentStreak, 3),
      target: 3
    },
    {
      id: "goal_getter",
      title: "Goal Getter",
      description: "Complete 10 goals in total",
      icon: "CheckCircle",
      achieved: completedCount >= 10,
      progress: Math.min(completedCount, 10),
      target: 10
    },
    {
      id: "super_streak",
      title: "Super Streak",
      description: "Reach a 7-day completion streak",
      icon: "Zap",
      achieved: currentStreak >= 7,
      progress: Math.min(currentStreak, 7),
      target: 7
    },
    {
      id: "productivity_master",
      title: "Productivity Master",
      description: "Complete 50 goals in total",
      icon: "Trophy",
      achieved: completedCount >= 50,
      progress: Math.min(completedCount, 50),
      target: 50
    }
  ];
}

// Project streak via simple projection
export function getProjectedStreak(goals: Goal[]): { current: number; projected: number } {
  const current = calculateCurrentStreak(goals);
  if (!goals || goals.length === 0) return { current: 0, projected: 0 };

  // Calculate completion trend in last 7 days
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const dStr = format(subDays(new Date(), i), "yyyy-MM-dd");
    const dayGoals = goals.filter(g => g.date === dStr);
    return dayGoals.length > 0 && dayGoals.every(g => g.completed);
  });

  const completionCount = last7Days.filter(Boolean).length;
  const probability = completionCount / 7;

  // Simple projection: if probability >= 0.7, assume streak increases by 5 days, else 1 day
  let projected = current;
  if (probability >= 0.8) projected += 5;
  else if (probability >= 0.5) projected += 2;
  else projected = Math.max(0, current - 1);

  return { current, projected };
}

// Daily Completed Heatmap data
export function getDailyHeatmap(goals: Goal[]): { date: string; count: number }[] {
  const data: { date: string; count: number }[] = [];
  // Go back 30 days
  for (let i = 29; i >= 0; i--) {
    const day = subDays(new Date(), i);
    const dStr = format(day, "yyyy-MM-dd");
    const count = goals.filter(g => g.date === dStr && g.completed).length;
    data.push({
      date: dStr,
      count
    });
  }
  return data;
}
