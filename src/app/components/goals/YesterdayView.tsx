import React, { useState } from "react";
import { Layout } from "../Layout";
import { useApp, Priority, Goal } from "../../store";
import { Trash2, CheckCircle, Circle, ArrowRight, StickyNote, Bot, Sparkles, Edit2 } from "lucide-react";
import { toast } from "sonner";
import { format, subDays } from "date-fns";
import { suggestReschedule } from "../../../lib/groq";
import { EditGoalDialog } from "./EditGoalDialog";
import { PriorityBadge } from "./Shared";

export function YesterdayView() {
  const { goals, toggleGoal, deleteGoal, carryForwardGoal, groqApiKey, aiFeaturesConfig, dailyMetadata, customConfig } = useApp();
  const [loadingSuggestion, setLoadingSuggestion] = useState<string | null>(null);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  
  const yesterdayStr = format(subDays(new Date(), 1), "yyyy-MM-dd");
  const yesterdayGoals = goals.filter(g => g.date === yesterdayStr);
  const uncompleted = yesterdayGoals.filter(g => !g.completed);

  const carryForward = (id: string) => {
    carryForwardGoal(id);
    toast.success("Carried forward to today!");
  };

  const carryForwardAll = () => {
    uncompleted.forEach(g => {
      carryForwardGoal(g.id);
    });
    toast.success(`${uncompleted.length} goals carried forward!`);
  };

  const handleAiSuggest = async (goalTitle: string, id: string) => {
    if (!groqApiKey) return toast.error("Groq API key required");
    setLoadingSuggestion(id);
    try {
      const recentEnergy = dailyMetadata[yesterdayStr]?.energy || "medium";
      const suggestion = await suggestReschedule(goalTitle, recentEnergy, groqApiKey);
      toast("AI Suggestion", {
        description: suggestion,
        icon: <Bot className="text-primary" />,
        action: {
          label: "Carry Forward",
          onClick: () => carryForward(id)
        }
      });
    } catch (e: any) {
      toast.error("Failed to get suggestion: " + e.message);
    } finally {
      setLoadingSuggestion(null);
    }
  };

  return (
    <Layout title="Yesterday's Reflection">
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-foreground">Yesterday's Reflection</h1>
            <p className="text-muted-foreground font-medium">{format(subDays(new Date(), 1), "EEEE, MMMM do, yyyy")}</p>
          </div>
          {uncompleted.length > 0 && (
            <button 
              onClick={carryForwardAll}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-2 px-4 rounded-lg transition"
            >
              Carry All Uncompleted
            </button>
          )}
        </div>

        <div className="bg-card p-6 rounded-xl shadow-sm border border-border min-h-[400px]">
          <div className="space-y-4">
            {yesterdayGoals.length === 0 ? (
              <div className="text-center py-20 text-muted-foreground italic">
                No goals found for yesterday.
              </div>
            ) : (
              yesterdayGoals.map(goal => (
                <div 
                  key={goal.id} 
                  className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-border hover:border-primary/30 hover:bg-accent/50 transition duration-200 gap-4"
                >
                  <div className="flex items-center gap-4">
                    <button onClick={() => toggleGoal(goal.id)} className="text-primary hover:scale-110 transition shrink-0">
                      {goal.completed ? <CheckCircle size={24} /> : <Circle size={24} />}
                    </button>
                    <div>
                      <h3 className={`font-semibold ${goal.completed ? "line-through opacity-50" : ""}`}>{goal.title}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <PriorityBadge priorityId={goal.priority} customConfig={customConfig} />
                        <span className="text-xs text-muted-foreground font-medium">{goal.category}</span>
                        {goal.notes && <StickyNote size={12} className="text-muted-foreground" title={goal.notes} />}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 sm:opacity-0 group-hover:opacity-100 transition">
                    {!goal.completed && aiFeaturesConfig.smartRescheduling && (
                      <button 
                        onClick={() => handleAiSuggest(goal.title, goal.id)}
                        disabled={loadingSuggestion === goal.id}
                        className="px-2 py-1.5 text-xs bg-primary/10 text-primary hover:bg-primary/20 rounded-lg flex items-center gap-1 disabled:opacity-50"
                        title="Get AI Suggestion"
                      >
                        {loadingSuggestion === goal.id ? <Sparkles className="animate-spin" size={12} /> : <Bot size={12} />}
                        AI Suggest
                      </button>
                    )}
                    {!goal.completed && (
                      <button 
                        onClick={() => carryForward(goal.id)}
                        className="p-2 text-primary hover:bg-primary/10 rounded-lg"
                        title="Carry Forward"
                      >
                        <ArrowRight size={16} />
                      </button>
                    )}
                    <button onClick={() => setEditingGoal(goal)} className="p-2 text-muted-foreground hover:bg-accent rounded-lg" title="Edit Goal">
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => deleteGoal(goal.id)} className="p-2 text-destructive hover:bg-destructive/10 rounded-lg">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      <EditGoalDialog 
        goal={editingGoal} 
        open={!!editingGoal} 
        onOpenChange={(open) => !open && setEditingGoal(null)} 
      />
    </Layout>
  );
}
