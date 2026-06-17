import React, { useState, useEffect } from "react";
import { Layout } from "../Layout";
import { useApp, Goal, Priority } from "../../store";
import { 
  PlusCircle, Wand, Activity, Zap, Trash2, Edit2, 
  CheckCircle, Circle, StickyNote, ArrowRight,
  Bot, Mic, MicOff, AlertTriangle, Sparkles, Repeat
} from "lucide-react";
import { toast } from "sonner";
import { format, subDays } from "date-fns";
import { 
  parseNLGoal, suggestCategory, generateBriefing, 
  predictStreakBreak, generateReflection 
} from "../../../lib/groq";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EditGoalDialog } from "./EditGoalDialog";

import { PriorityBadge } from "./Shared";

export function GoalTracker() {
  const { 
    goals, addGoal, toggleGoal, deleteGoal, updateGoal,
    dailyMetadata, setDayMetadata, templates, addTemplate,
    groqApiKey, aiFeaturesConfig, customConfig
  } = useApp();

  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [priority, setPriority] = useState("");
  const [notes, setNotes] = useState("");

  // Initialize with custom defaults
  useEffect(() => {
    if (!category && customConfig.categories.length > 0) {
      setCategory(customConfig.categories[0].id);
    }
    if (!priority && customConfig.priorities.length > 0) {
      setPriority(customConfig.priorities[0].id);
    }
  }, [customConfig, category, priority]);

  const applyPersona = (p: any) => {
    if (p.defaultCategoryId) setCategory(p.defaultCategoryId);
    if (p.defaultPriorityId) setPriority(p.defaultPriorityId);
    if (p.sampleGoalTitle) setTitle(p.sampleGoalTitle);
    toast.success(`${p.name} persona applied`);
  };
  
  const [showTemplatePicker, setShowTemplatePicker] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [isCategorizing, setIsCategorizing] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [briefing, setBriefing] = useState<string | null>(null);
  const [streakRisk, setStreakRisk] = useState<number | null>(null);

  const todayStr = format(new Date(), "yyyy-MM-dd");
  const todaysGoals = goals.filter(g => g.date === todayStr);
  const metadata = dailyMetadata[todayStr] || {};

  // Speech Recognition Setup
  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  const recognition = SpeechRecognition ? new SpeechRecognition() : null;

  if (recognition) {
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onresult = async (event: any) => {
      const transcript = event.results[0][0].transcript;
      setTitle(transcript);
      if (groqApiKey && aiFeaturesConfig.naturalLanguageEntry) {
        handleParseNL(transcript);
      }
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
  }

  const toggleListen = () => {
    if (!recognition) {
      toast.error("Voice entry is not supported in this browser.");
      return;
    }
    if (isListening) {
      recognition.stop();
    } else {
      recognition.start();
      setIsListening(true);
      toast.info("Listening...");
    }
  };

  useEffect(() => {
    if (groqApiKey && aiFeaturesConfig.dailyBriefing) {
      const fetchBriefing = async () => {
        try {
          const recentGoals = goals.filter(g => g.date >= format(subDays(new Date(), 7), "yyyy-MM-dd"));
          const b = await generateBriefing(recentGoals, dailyMetadata, groqApiKey);
          setBriefing(b);
        } catch (e) {
          console.error("Failed to generate briefing", e);
        }
      };
      fetchBriefing();
    }

    if (groqApiKey && aiFeaturesConfig.predictiveAlert) {
      const fetchRisk = async () => {
        try {
          const recentGoals = goals.filter(g => g.date >= format(subDays(new Date(), 30), "yyyy-MM-dd"));
          const risk = await predictStreakBreak(recentGoals, metadata.energy || "medium", groqApiKey);
          setStreakRisk(risk);
        } catch (e) {
          console.error("Failed to predict risk", e);
        }
      };
      if (metadata.energy) fetchRisk();
    }
  }, [groqApiKey, aiFeaturesConfig.dailyBriefing, aiFeaturesConfig.predictiveAlert, metadata.energy]);

  const handleParseNL = async (text: string) => {
    if (!groqApiKey) return toast.error("Groq API key required for AI parsing");
    setIsParsing(true);
    try {
      const parsed = await parseNLGoal(text, groqApiKey);
      setTitle(parsed.title);
      setCategory(parsed.category as any);
      setPriority(parsed.priority as any);
      toast.success("Goal parsed with AI!");
    } catch (e: any) {
      toast.error("Failed to parse: " + e.message);
    } finally {
      setIsParsing(false);
    }
  };

  const handleSuggestCategory = async () => {
    if (!groqApiKey) return toast.error("Groq API key required");
    if (!title.trim()) return toast.error("Enter a title first");
    setIsCategorizing(true);
    try {
      const cat = await suggestCategory(title, groqApiKey);
      setCategory(cat as any);
      toast.success(`Categorized as ${cat}`);
    } catch (e: any) {
      toast.error("Failed to categorize: " + e.message);
    } finally {
      setIsCategorizing(false);
    }
  };

  const handleToggleGoal = async (goal: Goal) => {
    const isNowCompleted = !goal.completed;
    toggleGoal(goal.id);

    if (isNowCompleted && groqApiKey) {
      // 5. Auto-Reflection
      if (aiFeaturesConfig.autoReflection && !goal.notes) {
        toast.promise(generateReflection(goal.title, groqApiKey), {
          loading: "AI generating reflection...",
          success: (ref) => {
            updateGoal(goal.id, { notes: ref });
            return "Reflection added!";
          },
          error: "Failed to generate reflection"
        });
      }

      // 7. Smart Template Generation (Check if completed 3 times)
      if (aiFeaturesConfig.smartTemplates) {
        const similarCompleted = goals.filter(g => g.title.toLowerCase() === goal.title.toLowerCase() && g.completed).length;
        // Since toggleGoal updates state async, add 1 to count the current completion
        if (similarCompleted + 1 === 3) {
          const tExists = templates.some(t => t.title.toLowerCase() === goal.title.toLowerCase());
          if (!tExists) {
            toast("Recurring goal detected!", {
              description: `You've completed "${goal.title}" 3 times. Create a template?`,
              action: {
                label: "Create Template",
                onClick: () => {
                  addTemplate({ title: goal.title, category: goal.category, priority: goal.priority, notes: "" });
                  toast.success("Template created!");
                }
              }
            });
          }
        }
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    addGoal({
      title,
      category,
      priority,
      notes,
      completed: false,
      date: todayStr,
      status: "todo"
    });
    setTitle("");
    setNotes("");
    toast.success("Goal added!");
  };

  const applyTemplate = (templateId: string) => {
    const t = templates.find(x => x.id === templateId);
    if (t) {
      setTitle(t.title);
      setCategory(t.category);
      setPriority(t.priority);
      setNotes(t.notes);
      setShowTemplatePicker(false);
    }
  };

  const completedCount = todaysGoals.filter(g => g.completed).length;
  const rate = todaysGoals.length > 0 ? Math.round((completedCount / todaysGoals.length) * 100) : 0;

  return (
    <Layout title="Today's Goals">
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-foreground">Today's Dashboard</h1>
            <p className="text-muted-foreground font-medium">{format(new Date(), "EEEE, MMMM do, yyyy")}</p>
          </div>
          <div className="bg-primary/10 px-4 py-2 rounded-lg border border-primary/20">
            <span className="text-primary font-semibold">Today's Progress: {rate}%</span>
          </div>
        </div>

        {/* Persona Quick Start */}
        <div className="mb-8 overflow-x-auto pb-2">
          <div className="flex gap-2 min-w-max">
            {customConfig.personaTemplates.map(p => (
              <button
                key={p.id}
                onClick={() => applyPersona(p)}
                className="px-3 py-1.5 bg-card border border-border rounded-full text-xs font-semibold hover:bg-accent transition whitespace-nowrap"
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>

        {/* 10. Predictive Streak Alert */}
        {streakRisk !== null && streakRisk > 70 && (
          <div className="mb-6 p-4 rounded-xl border border-destructive/30 bg-destructive/10 flex items-start gap-3">
            <AlertTriangle className="text-destructive shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-destructive">High Risk of Breaking Streak!</h3>
              <p className="text-sm text-destructive/80">
                AI predicts a {streakRisk}% chance you might miss your goals tomorrow based on your current energy levels and historical patterns. Consider setting lighter goals!
              </p>
            </div>
          </div>
        )}

        {/* 3. Daily AI Briefing */}
        {briefing && (
          <div className="mb-8 p-5 rounded-xl border border-primary/20 bg-primary/5 flex items-start gap-4">
            <div className="p-2 bg-primary/10 rounded-full text-primary shrink-0"><Bot size={24} /></div>
            <div>
              <h3 className="font-semibold text-primary mb-1">Your Daily AI Briefing</h3>
              <p className="text-sm text-foreground/80 leading-relaxed">{briefing}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Add Goal & Mood */}
          <div className="space-y-8">
            <div className="bg-card p-6 rounded-xl shadow-sm border border-border relative overflow-hidden">
              {isParsing && (
                <div className="absolute inset-0 bg-background/50 backdrop-blur-sm z-10 flex items-center justify-center">
                  <span className="flex items-center gap-2 text-primary font-medium">
                    <Sparkles className="animate-spin" size={16} /> Parsing with AI...
                  </span>
                </div>
              )}
              
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <PlusCircle className="text-primary" size={20} /> Add New Goal
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <div className="flex justify-between items-end mb-1">
                    <label className="block text-sm font-medium">Goal Title *</label>
                    <div className="flex gap-2">
                      {aiFeaturesConfig.naturalLanguageEntry && (
                        <button 
                          type="button" 
                          onClick={() => handleParseNL(title)}
                          disabled={!title.trim() || isParsing}
                          className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full hover:bg-primary/20 transition disabled:opacity-50"
                        >
                          Parse AI
                        </button>
                      )}
                      {aiFeaturesConfig.voiceEntry && (
                        <button 
                          type="button" 
                          onClick={toggleListen}
                          className={`text-[10px] px-2 py-0.5 rounded-full transition flex items-center gap-1 ${isListening ? "bg-red-100 text-red-600 animate-pulse" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"}`}
                        >
                          {isListening ? <Mic size={10} /> : <MicOff size={10} />} Voice
                        </button>
                      )}
                    </div>
                  </div>
                  <input 
                    type="text" 
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required 
                    className="w-full px-3 py-2 bg-background border border-input rounded-lg focus:ring-2 focus:ring-primary outline-none" 
                    placeholder="e.g. read 20 pages high priority learning"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="flex justify-between items-end mb-1">
                      <label className="block text-sm font-medium">Category</label>
                      {aiFeaturesConfig.autoCategorization && (
                        <button 
                          type="button"
                          onClick={handleSuggestCategory}
                          disabled={isCategorizing || !title.trim()}
                          className="text-[10px] text-primary hover:underline disabled:opacity-50"
                        >
                          {isCategorizing ? "Thinking..." : "Suggest"}
                        </button>
                      )}
                    </div>
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
                <div>
                  <label className="block text-sm font-medium mb-1">Notes (Optional)</label>
                  <textarea 
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={2} 
                    className="w-full px-3 py-2 bg-background border border-input rounded-lg outline-none" 
                    placeholder="Add some context..."
                  />
                </div>
                <div className="flex items-center gap-2">
                  <button type="submit" className="flex-grow bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-2 px-4 rounded-lg transition">
                    Add Goal
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setShowTemplatePicker(true)}
                    className="bg-secondary hover:bg-secondary/80 text-secondary-foreground p-2 rounded-lg transition flex items-center justify-center h-10 w-10 shrink-0"
                    title="Load from Template"
                  >
                    <Wand size={18} />
                  </button>
                </div>
              </form>
            </div>

            <div className="bg-card p-6 rounded-xl shadow-sm border border-border">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Activity className="text-yellow-500" size={20} /> Daily Vibe
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">How's your Mood?</label>
                  <Select value={metadata.mood || ""} onValueChange={(val) => setDayMetadata(todayStr, { mood: val })}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select mood" />
                    </SelectTrigger>
                    <SelectContent>
                      {customConfig.moods.map(m => (
                        <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Energy Levels?</label>
                  <Select value={metadata.energy || ""} onValueChange={(val) => setDayMetadata(todayStr, { energy: val })}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select energy" />
                    </SelectTrigger>
                    <SelectContent>
                      {customConfig.energies.map(e => (
                        <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Goals List */}
          <div className="lg:col-span-2">
            <div className="bg-card p-6 rounded-xl shadow-sm border border-border min-h-[400px]">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Today's Goals</h2>
                <span className="bg-secondary text-secondary-foreground text-xs font-bold px-2 py-1 rounded-full">
                  {todaysGoals.length} Goals
                </span>
              </div>
              <div className="space-y-4">
                {todaysGoals.length === 0 ? (
                  <div className="text-center py-20 text-muted-foreground italic">
                    No goals set for today yet. Start by adding one!
                  </div>
                ) : (
                  todaysGoals.map(goal => (
                    <div 
                      key={goal.id} 
                      className="group flex items-center justify-between p-4 rounded-xl border border-border hover:border-primary/30 hover:bg-accent/50 transition duration-200"
                    >
                      <div className="flex items-center gap-4">
                        <button onClick={() => handleToggleGoal(goal)} className="text-primary hover:scale-110 transition">
                          {goal.completed ? <CheckCircle size={24} /> : <Circle size={24} />}
                        </button>
                        <div>
                          <h3 className={`font-semibold ${goal.completed ? "line-through opacity-50" : ""}`}>{goal.title}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <PriorityBadge priorityId={goal.priority} customConfig={customConfig} />
                            <span className="text-xs text-muted-foreground font-medium">{goal.category}</span>
                            {goal.streakId && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-accent text-muted-foreground font-bold uppercase tracking-wider flex items-center gap-1" title="Part of a streak">
                                <Repeat size={10} /> Streak
                              </span>
                            )}
                            {goal.notes && <StickyNote size={12} className="text-muted-foreground" title={goal.notes} />}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition">
                        <button onClick={() => setEditingGoal(goal)} className="p-2 text-muted-foreground hover:bg-accent rounded-lg" title="Edit Goal">
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => deleteGoal(goal.id)} className="p-2 text-destructive hover:bg-destructive/10 rounded-lg" title="Delete Goal">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Template Picker Modal */}
      {showTemplatePicker && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
          <div className="bg-card rounded-xl shadow-2xl max-w-lg w-full p-6 border border-border">
            <h2 className="text-xl font-bold mb-4">Select Template</h2>
            <div className="space-y-2 max-h-[60vh] overflow-y-auto">
              {templates.length === 0 ? (
                <p className="text-muted-foreground italic text-center py-4">No templates available. Create one in Templates view.</p>
              ) : (
                templates.map(t => (
                  <button 
                    key={t.id} 
                    onClick={() => applyTemplate(t.id)}
                    className="w-full text-left p-3 hover:bg-accent border border-border rounded-lg transition"
                  >
                    <div className="font-semibold">{t.title}</div>
                    <div className="text-xs text-muted-foreground">{t.category} | {t.priority}</div>
                  </button>
                ))
              )}
            </div>
            <button 
              onClick={() => setShowTemplatePicker(false)}
              className="mt-4 w-full py-2 bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-lg transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
      <EditGoalDialog 
        goal={editingGoal} 
        open={!!editingGoal} 
        onOpenChange={(open) => !open && setEditingGoal(null)} 
      />
    </Layout>
  );
}
