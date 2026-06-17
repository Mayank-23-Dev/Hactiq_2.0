import React, { useState } from "react";
import { Layout } from "../Layout";
import { useApp } from "../../store";
import { Flame as Fire, CheckCircle, ListChecks, Bot, Sparkles } from "lucide-react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, PieChart, Pie, Cell
} from "recharts";
import { format, subDays, eachDayOfInterval } from "date-fns";
import { generateInsights } from "../../../lib/groq";
import { toast } from "sonner";

export function StatsView() {
  const { goals, groqApiKey, aiFeaturesConfig, customConfig } = useApp();
  const [isCoaching, setIsCoaching] = useState(false);
  const [aiAdvice, setAiAdvice] = useState<string | null>(null);

  const calculateStreak = () => {
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
        const olderGoals = goals.some(g => g.date < dStr);
        if (!olderGoals) break;
      }
      checkDate = subDays(checkDate, 1);
      if (streak > 365) break;
    }
    return streak;
  };

  // Weekly Performance Data
  const last7Days = eachDayOfInterval({
    start: subDays(new Date(), 6),
    end: new Date()
  });

  const weeklyData = last7Days.map(day => {
    const dStr = format(day, "yyyy-MM-dd");
    const dayGoals = goals.filter(g => g.date === dStr);
    return {
      name: format(day, "MM/dd"),
      Set: dayGoals.length,
      Completed: dayGoals.filter(g => g.completed).length
    };
  });

  // Category Breakdown Data
  const categoriesList = customConfig.categories;
  const last30DaysLimit = subDays(new Date(), 30);
  const recentGoals = goals.filter(g => new Date(g.date) >= last30DaysLimit);
  
  const categoryData = categoriesList.map(cat => {
    const catGoals = recentGoals.filter(g => g.category === cat.id);
    const rate = catGoals.length > 0 ? Math.round((catGoals.filter(g => g.completed).length / catGoals.length) * 100) : 0;
    return { name: cat.name, value: rate, id: cat.id };
  }).filter(c => c.value > 0);

  const getCatColor = (id: string) => {
    const colors = ["#ef4444", "#f59e0b", "#10b981", "#3b82f6", "#8b5cf6", "#6366f1", "#ec4899", "#14b8a6"];
    const idx = categoriesList.findIndex(x => x.id === id);
    return colors[idx % colors.length];
  };

  const todayStr = format(new Date(), "yyyy-MM-dd");
  const todaysGoals = goals.filter(g => g.date === todayStr);
  const todayRate = todaysGoals.length > 0 ? Math.round((completedTodayCount() / todaysGoals.length) * 100) : 0;

  function completedTodayCount() {
    return todaysGoals.filter(g => g.completed).length;
  }

  const handleGetInsights = async () => {
    if (!groqApiKey) return toast.error("Groq API key required");
    setIsCoaching(true);
    try {
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
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <h1 className="text-3xl font-extrabold text-foreground">Insights & Progress</h1>
          {aiFeaturesConfig.aiInsights && (
            <button 
              onClick={handleGetInsights}
              disabled={isCoaching || recentGoals.length === 0}
              className="bg-primary/10 text-primary hover:bg-primary/20 font-bold py-2 px-4 rounded-lg transition flex items-center gap-2 disabled:opacity-50"
            >
              {isCoaching ? <Sparkles className="animate-spin" size={20} /> : <Bot size={20} />}
              Ask AI Coach
            </button>
          )}
        </div>

        {aiAdvice && (
          <div className="mb-8 p-6 rounded-xl border border-primary/30 bg-primary/5 flex items-start gap-4 shadow-sm">
            <div className="p-3 bg-primary/10 rounded-full text-primary shrink-0"><Bot size={28} /></div>
            <div>
              <h3 className="font-bold text-primary mb-2 text-lg">AI Coach Insights (Last 30 Days)</h3>
              <div className="text-sm text-foreground/80 leading-relaxed whitespace-pre-line">
                {aiAdvice}
              </div>
              <button onClick={() => setAiAdvice(null)} className="mt-4 text-xs text-primary hover:underline">Dismiss</button>
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard 
            icon={<Fire size={24} className="text-orange-600" />} 
            label="Current Streak" 
            value={`${calculateStreak()} Days`} 
            bgColor="bg-orange-100 dark:bg-orange-900/20"
          />
          <StatCard 
            icon={<CheckCircle size={24} className="text-green-600" />} 
            label="Today's Rate" 
            value={`${todayRate}%`} 
            bgColor="bg-green-100 dark:bg-green-900/20"
          />
          <StatCard 
            icon={<ListChecks size={24} className="text-primary" />} 
            label="Total Goals Set" 
            value={goals.length.toString()} 
            bgColor="bg-primary/10"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-card p-6 rounded-xl shadow-sm border border-border">
            <h2 className="text-xl font-bold mb-6">Weekly Performance</h2>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))", borderRadius: "8px" }}
                    itemStyle={{ fontSize: "12px" }}
                  />
                  <Legend verticalAlign="bottom" height={36}/>
                  <Bar dataKey="Set" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Completed" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-card p-6 rounded-xl shadow-sm border border-border">
            <h2 className="text-xl font-bold mb-6">Category Breakdown (30 Days)</h2>
            <div className="h-[300px] w-full flex justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}%`}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={getCatColor(entry.id)} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

function StatCard({ icon, label, value, bgColor }: { icon: React.ReactNode, label: string, value: string, bgColor: string }) {
  return (
    <div className="bg-card p-6 rounded-xl shadow-sm border border-border flex items-center">
      <div className={`${bgColor} p-4 rounded-full mr-4`}>
        {icon}
      </div>
      <div>
        <p className="text-sm text-muted-foreground font-medium">{label}</p>
        <h3 className="text-3xl font-bold">{value}</h3>
      </div>
    </div>
  );
}