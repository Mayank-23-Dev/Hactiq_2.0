// src/app/components/StreakGoals.tsx
import React, { useState, useEffect } from "react";
import { Layout } from "./Layout";
import { useApp, Priority, StreakGoal } from "../store";
import { Plus, Trash2, Calendar, Target, Play, Pause, Repeat } from "lucide-react";
import { toast } from "sonner";
import { format, addMonths } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PriorityBadge } from "./goals/Shared";

export function StreakGoals() {
  const { streakGoals, addStreakGoal, updateStreakGoal, deleteStreakGoal, goals, customConfig } = useApp();
  const [showAddModal, setShowAddModal] = useState(false);
  
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [priority, setPriority] = useState("");
  const [notes, setNotes] = useState("");
  const [frequency, setFrequency] = useState<StreakGoal["frequency"]>("daily");

  // Initialize with custom defaults
  useEffect(() => {
    if (!category && customConfig.categories.length > 0) {
      setCategory(customConfig.categories[0].id);
    }
    if (!priority && customConfig.priorities.length > 0) {
      setPriority(customConfig.priorities[0].id);
    }
  }, [customConfig, category, priority]);
  
  const todayStr = format(new Date(), "yyyy-MM-dd");
  const [startDate, setStartDate] = useState(todayStr);
  const [endDate, setEndDate] = useState(format(addMonths(new Date(), 1), "yyyy-MM-dd"));
  const [customDays, setCustomDays] = useState<number[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (new Date(startDate) > new Date(endDate)) {
      return toast.error("End date must be after start date.");
    }
    if (frequency === "custom" && customDays.length === 0) {
      return toast.error("Select at least one day for custom frequency.");
    }

    addStreakGoal({ 
      title, 
      category, 
      priority, 
      notes, 
      startDate, 
      endDate, 
      frequency, 
      customDays: frequency === "custom" ? customDays : undefined,
      active: true 
    });
    
    setShowAddModal(false);
    setTitle("");
    setNotes("");
    toast.success("Streak Goal created! Instances generated.");
  };

  const toggleDay = (dayIndex: number) => {
    setCustomDays(prev => 
      prev.includes(dayIndex) ? prev.filter(d => d !== dayIndex) : [...prev, dayIndex]
    );
  };

  // Helper to calculate progress
  const getProgress = (streakId: string) => {
    const streakInstances = goals.filter(g => g.streakId === streakId);
    const completed = streakInstances.filter(g => g.completed).length;
    const total = streakInstances.length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { completed, total, percentage };
  };

  const daysOfWeek = ["S", "M", "T", "W", "T", "F", "S"];

  return (
    <Layout title="Streak Goals">
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-extrabold text-foreground">Streak Goals</h1>
          <button 
            onClick={() => setShowAddModal(true)}
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-2 px-4 rounded-lg transition flex items-center gap-2"
          >
            <Plus size={20} /> New Streak
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {streakGoals.length === 0 ? (
            <div className="col-span-full text-center py-20 text-muted-foreground italic">No streak goals created.</div>
          ) : (
            streakGoals.map(sg => {
              const { completed, total, percentage } = getProgress(sg.id);
              return (
                <div key={sg.id} className={`bg-card p-6 rounded-xl shadow-sm border border-border relative ${!sg.active ? "opacity-60" : ""}`}>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg text-foreground">{sg.title}</h3>
                    <div className="flex gap-1">
                      <button 
                        onClick={() => updateStreakGoal(sg.id, { active: !sg.active })}
                        className="p-1.5 text-muted-foreground hover:bg-accent rounded-md transition"
                        title={sg.active ? "Pause Generation" : "Resume"}
                      >
                        {sg.active ? <Pause size={16} /> : <Play size={16} />}
                      </button>
                      <button 
                        onClick={() => {
                          if(confirm("Delete this streak? Future uncompleted goals will be removed.")) deleteStreakGoal(sg.id);
                        }}
                        className="p-1.5 text-destructive hover:bg-destructive/10 rounded-md transition"
                        title="Delete Streak"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mb-4">
                    <PriorityBadge priorityId={sg.priority} customConfig={customConfig} />
                    <span className="text-xs text-muted-foreground bg-accent px-2 py-0.5 rounded flex items-center gap-1">
                      <Repeat size={10}/> {sg.frequency}
                    </span>
                  </div>

                  <div className="text-xs text-muted-foreground mb-4 space-y-1">
                    <div className="flex items-center gap-1"><Calendar size={12}/> {sg.startDate} to {sg.endDate}</div>
                    <div className="flex items-center gap-1"><Target size={12}/> {completed} / {total} days completed</div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-muted rounded-full h-2 mt-2 overflow-hidden">
                    <div className="bg-primary h-2 rounded-full transition-all" style={{ width: `${percentage}%` }}></div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
          <div className="bg-card rounded-xl shadow-2xl max-w-lg w-full p-6 border border-border max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">New Streak Goal</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input 
                  type="text" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required 
                  className="w-full px-3 py-2 bg-background border border-input rounded-lg outline-none" 
                  placeholder="e.g. Read 10 pages"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Category</label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      {customConfig.categories.map(c => (
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Priority</label>
                  <Select value={priority} onValueChange={setPriority}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Priority" />
                    </SelectTrigger>
                    <SelectContent>
                      {customConfig.priorities.map(p => (
                        <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Start Date</label>
                  <input 
                    type="date" 
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required 
                    className="w-full px-3 py-2 bg-background border border-input rounded-lg outline-none" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">End Date</label>
                  <input 
                    type="date" 
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    required 
                    className="w-full px-3 py-2 bg-background border border-input rounded-lg outline-none" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Frequency</label>
                <Select value={frequency} onValueChange={(val: any) => setFrequency(val)}>
                  <SelectTrigger className="w-full mb-2">
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekdays">Weekdays (Mon-Fri)</SelectItem>
                    <SelectItem value="weekends">Weekends (Sat-Sun)</SelectItem>
                    <SelectItem value="custom">Custom Days</SelectItem>
                  </SelectContent>
                </Select>
                
                {frequency === "custom" && (
                  <div className="flex gap-2 mt-2">
                    {daysOfWeek.map((day, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => toggleDay(idx)}
                        className={`w-8 h-8 rounded-full text-xs font-bold transition-colors ${
                          customDays.includes(idx) ? "bg-primary text-primary-foreground" : "bg-accent text-muted-foreground border border-border"
                        }`}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Notes</label>
                <textarea 
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2} 
                  className="w-full px-3 py-2 bg-background border border-input rounded-lg outline-none"
                />
              </div>
              
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-2 bg-secondary text-secondary-foreground rounded-lg transition">Cancel</button>
                <button type="submit" className="flex-1 bg-primary text-primary-foreground font-bold py-2 rounded-lg transition">Create Streak</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}
