// src/pages/LandingPage.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../contexts/AuthContext";
import { ThemeToggle } from "../components/ThemeToggle";
import { 
  ArrowRight, 
  Sparkles, 
  Plus, 
  Check, 
  Trash2, 
  ChevronRight, 
  ChevronLeft, 
  Terminal, 
  Database, 
  Lock, 
  Flame, 
  ArrowUpRight, 
  Fingerprint, 
  Workflow
} from "lucide-react";

interface DemoGoal {
  id: string;
  title: string;
  status: "todo" | "progress" | "done";
  decomposed?: string[];
  isDecomposing?: boolean;
}

export default function LandingPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  // --- INTERACTIVE DEMO BOARD STATE ---
  const [goals, setGoals] = useState<DemoGoal[]>([
    { id: "1", title: "Orchestrate background particles & GL canvas", status: "done" },
    { id: "2", title: "Integrate Groq AI cognitive engine", status: "progress" },
    { id: "3", title: "Decompose Q3 system blueprints", status: "todo" }
  ]);
  const [newGoalTitle, setNewGoalTitle] = useState("");
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  // Add goal in the demo workspace
  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoalTitle.trim()) return;
    
    const newGoal: DemoGoal = {
      id: Date.now().toString(),
      title: newGoalTitle.trim(),
      status: "todo"
    };
    
    setGoals(prev => [...prev, newGoal]);
    setNewGoalTitle("");
    triggerFeedback("Goal successfully dispatched to To-Do swimlane");
  };

  // Move goal between swimlanes
  const moveGoal = (id: string, direction: "left" | "right") => {
    setGoals(prev => prev.map(goal => {
      if (goal.id !== id) return goal;
      
      let nextStatus: "todo" | "progress" | "done" = goal.status;
      if (goal.status === "todo" && direction === "right") nextStatus = "progress";
      else if (goal.status === "progress" && direction === "right") nextStatus = "done";
      else if (goal.status === "progress" && direction === "left") nextStatus = "todo";
      else if (goal.status === "done" && direction === "left") nextStatus = "progress";

      return { ...goal, status: nextStatus };
    }));
  };

  // Delete goal in the demo workspace
  const deleteGoal = (id: string) => {
    setGoals(prev => prev.filter(g => g.id !== id));
    triggerFeedback("Goal removed from workspace memory");
  };

  // Simulate AI Decomposition
  const decomposeGoal = (id: string) => {
    setGoals(prev => prev.map(g => g.id === id ? { ...g, isDecomposing: true } : g));
    
    setTimeout(() => {
      setGoals(prev => prev.map(g => {
        if (g.id !== id) return g;
        return {
          ...g,
          isDecomposing: false,
          decomposed: [
            "Deconstruct high-level goals into 3 actionable steps",
            "Synthesize context parameters & metadata",
            "Sync layout nodes across the workspace database"
          ]
        };
      }));
      triggerFeedback("AI Decomposer injected subtasks into memory nodes");
    }, 1000);
  };

  // Toast feedback helper
  const triggerFeedback = (msg: string) => {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(null), 3000);
  };

  // Board Stats calculation
  const completedCount = goals.filter(g => g.status === "done").length;
  const totalCount = goals.length;
  const percentComplete = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="relative min-h-screen bg-background text-foreground font-sans overflow-x-clip select-none">
      <div className="fixed inset-0 bg-background -z-20" />
      
      {/* 1. Structural Monochrome Grid Lines & Radial Mask */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.03)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:80px_80px] pointer-events-none z-0" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_10%,var(--background)_80%)] pointer-events-none z-0" />

      {/* 2. Sleek Glassmorphic Navbar */}
      <header className="sticky top-0 w-full z-50 backdrop-blur-md bg-background/40 border-b border-border/40 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/")}>
            <div className="w-8 h-8 flex items-center justify-center bg-transparent">
              <img src="/logo.svg" alt="Hactiq Logo" className="w-8 h-8 object-contain invert dark:invert-0" />
            </div>
            <span className="font-display font-bold tracking-tight text-lg text-foreground">Hactiq</span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-xs font-semibold uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
            <a href="#features" className="hover:text-black dark:hover:text-white transition-colors duration-200">Features</a>
            <a href="#sandbox" className="hover:text-black dark:hover:text-white transition-colors duration-200">Interactive Sandbox</a>
            <a href="#architecture" className="hover:text-black dark:hover:text-white transition-colors duration-200">Specs</a>
          </nav>

          <div className="flex items-center gap-4">
            <ThemeToggle />
            <button 
              onClick={() => navigate("/login")}
              className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white transition-all cursor-pointer"
            >
              Sign In
            </button>
            <button 
              onClick={() => navigate("/register")}
              className="py-2 px-4 bg-black dark:bg-white hover:bg-neutral-800 dark:hover:bg-neutral-200 text-white dark:text-black text-xs font-bold uppercase tracking-wider rounded-md transition-all shadow-md hover:shadow-black/5 dark:hover:shadow-white/5 cursor-pointer"
            >
              Get Started
            </button>
          </div>
        </div>
      </header>

      {/* 3. Hero Section */}
      <section className="relative max-w-7xl mx-auto px-6 pt-24 pb-20 flex flex-col items-center text-center z-10">
        
        {/* Pulsing Pill Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.02] backdrop-blur-md mb-8 animate-pulse">
          <span className="w-1.5 h-1.5 rounded-full bg-black dark:bg-white shadow-[0_0_8px_rgba(0,0,0,0.3)] dark:shadow-[0_0_8px_#ffffff]" />
          <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-600 dark:text-neutral-300">System Version 2.0 Live</span>
        </div>

        {/* Display Typography */}
        <h1 className="font-display text-5xl md:text-8xl font-extrabold tracking-tighter text-black dark:text-white max-w-5xl leading-[0.95] mb-8">
          The Monochrome <span className="text-transparent bg-clip-text bg-gradient-to-b from-neutral-800 to-black dark:from-white dark:via-neutral-100 dark:to-neutral-600">Goal Tracker App</span> for High-Fidelity Goals.
        </h1>

        {/* Paragraph copy */}
        <p className="text-base md:text-xl text-neutral-600 dark:text-neutral-400 max-w-2xl leading-relaxed font-light mb-12">
          Hactiq replaces colorful distraction with high-contrast cognitive alignment. Experience an elegant, local-first goal-tracking engine with real-time Kanban architecture and on-demand AI task decomposition.
        </p>

        {/* Hero Actions */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-24">
          <button 
            onClick={() => navigate("/register")}
            className="w-full sm:w-auto py-3.5 px-8 bg-black dark:bg-white hover:bg-neutral-800 dark:hover:bg-neutral-200 text-white dark:text-black text-sm font-bold uppercase tracking-widest rounded-lg transition-all duration-200 cursor-pointer flex items-center justify-center gap-2"
          >
            <span>Initialize Board</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <a
            href="#sandbox"
            className="w-full sm:w-auto py-3.5 px-8 bg-black/[0.03] dark:bg-white/[0.03] hover:bg-black/[0.06] dark:hover:bg-white/[0.06] active:bg-black/[0.1] dark:active:bg-white/[0.1] text-black dark:text-white border border-black/10 dark:border-white/10 text-sm font-bold uppercase tracking-widest rounded-lg transition-all duration-200 cursor-pointer flex items-center justify-center gap-2"
          >
            <span>Try Sandbox</span>
          </a>
        </div>
      </section>

      {/* 4. Interactive Sandbox Showcase */}
      <section id="sandbox" className="relative max-w-6xl mx-auto px-6 pb-32 z-10">
        
        {/* Floating feedback node */}
        {feedbackMsg && (
          <div className="fixed bottom-6 right-6 z-50 p-4 bg-neutral-100 dark:bg-neutral-900 border border-black/10 dark:border-white/10 rounded-xl shadow-2xl flex items-center gap-3 animate-bounce">
            <Terminal className="w-4 h-4 text-black dark:text-white" />
            <span className="text-xs font-mono text-neutral-700 dark:text-neutral-300">{feedbackMsg}</span>
          </div>
        )}

        <div className="relative border border-black/10 dark:border-white/10 bg-neutral-50/80 dark:bg-neutral-950/80 rounded-2xl p-6 md:p-8 backdrop-blur-2xl shadow-2xl transition-all duration-500 hover:border-black/20 dark:hover:border-white/20">
          
          {/* Decorative Terminal Header */}
          <div className="flex items-center justify-between pb-6 mb-8 border-b border-black/5 dark:border-white/5">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-neutral-300 dark:bg-neutral-800" />
              <span className="w-2.5 h-2.5 rounded-full bg-neutral-300 dark:bg-neutral-800" />
              <span className="w-2.5 h-2.5 rounded-full bg-neutral-300 dark:bg-neutral-800" />
              <span className="text-xs font-mono text-neutral-500 ml-2">sandbox://hactiq-active-node</span>
            </div>
            
            {/* Completion metrics */}
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest">Active Workspace Nodes</p>
                <p className="text-xs font-bold text-black dark:text-white">{completedCount}/{totalCount} Completed ({percentComplete}%)</p>
              </div>
              <div className="w-16 h-1.5 bg-neutral-200 dark:bg-neutral-900 rounded-full overflow-hidden border border-black/5 dark:border-white/5">
                <div 
                  className="h-full bg-black dark:bg-white transition-all duration-500" 
                  style={{ width: `${percentComplete}%` }}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Swimlane: To Do */}
            <div className="flex flex-col rounded-xl border border-black/5 dark:border-white/5 bg-neutral-100/30 dark:bg-neutral-900/20 p-4 min-h-[350px]">
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-black/5 dark:border-white/5">
                <span className="text-xs font-mono uppercase tracking-widest text-neutral-500 dark:text-neutral-400">01 // To Do</span>
                <span className="px-2 py-0.5 rounded bg-neutral-200 dark:bg-neutral-900 text-[10px] font-mono text-neutral-600 dark:text-neutral-400 border border-black/5 dark:border-white/5">
                  {goals.filter(g => g.status === "todo").length}
                </span>
              </div>
              
              <div className="flex-grow flex flex-col gap-3">
                {goals.filter(g => g.status === "todo").map(goal => (
                  <div 
                    key={goal.id}
                    className="group relative border border-black/[0.06] dark:border-white/[0.06] bg-white dark:bg-neutral-950 p-4 rounded-lg transition-all duration-300 hover:border-black/20 dark:hover:border-white/20 hover:shadow-lg"
                  >
                    <p className="text-sm font-semibold text-black dark:text-white mb-2 leading-snug">{goal.title}</p>
                    
                    {/* Action buttons */}
                    <div className="flex items-center justify-between gap-2 mt-4 pt-3 border-t border-black/[0.04] dark:border-white/[0.04]">
                      <button 
                        onClick={() => decomposeGoal(goal.id)}
                        disabled={goal.isDecomposing}
                        className="flex items-center gap-1 px-2 py-1 rounded bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-[10px] font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all disabled:opacity-50 cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>{goal.isDecomposing ? "Decomposing..." : "AI Decompose"}</span>
                      </button>
                      
                      <div className="flex items-center gap-1.5">
                        <button 
                          onClick={() => deleteGoal(goal.id)}
                          className="p-1 rounded text-neutral-500 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={() => moveGoal(goal.id, "right")}
                          className="p-1 rounded text-neutral-500 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Render Simulated AI Subtasks */}
                    {goal.decomposed && (
                      <div className="mt-3 pt-3 border-t border-dashed border-black/10 dark:border-white/10 space-y-2 animate-fadeIn">
                        <p className="text-[10px] font-mono uppercase tracking-widest text-neutral-500 mb-1">Decentralized Steps</p>
                        {goal.decomposed.map((sub, i) => (
                          <div key={i} className="flex items-start gap-2">
                            <span className="mt-1 flex-shrink-0 w-1.5 h-1.5 rounded-full bg-neutral-400 dark:bg-neutral-600" />
                            <span className="text-[11px] text-neutral-600 dark:text-neutral-400 font-light">{sub}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                
                {goals.filter(g => g.status === "todo").length === 0 && (
                  <div className="flex-grow flex items-center justify-center border border-dashed border-black/5 dark:border-white/5 rounded-lg p-6 text-center">
                    <p className="text-xs text-neutral-400 dark:text-neutral-600 font-mono">No tasks in queue</p>
                  </div>
                )}
              </div>
            </div>

            {/* Swimlane: In Progress */}
            <div className="flex flex-col rounded-xl border border-black/5 dark:border-white/5 bg-neutral-100/30 dark:bg-neutral-900/20 p-4 min-h-[350px]">
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-black/5 dark:border-white/5">
                <span className="text-xs font-mono uppercase tracking-widest text-neutral-500 dark:text-neutral-400">02 // Active</span>
                <span className="px-2 py-0.5 rounded bg-neutral-200 dark:bg-neutral-900 text-[10px] font-mono text-neutral-600 dark:text-neutral-400 border border-black/5 dark:border-white/5">
                  {goals.filter(g => g.status === "progress").length}
                </span>
              </div>
              
              <div className="flex-grow flex flex-col gap-3">
                {goals.filter(g => g.status === "progress").map(goal => (
                  <div 
                    key={goal.id}
                    className="relative border border-black/[0.06] dark:border-white/[0.06] bg-white dark:bg-neutral-950 p-4 rounded-lg transition-all duration-300 hover:border-black/20 dark:hover:border-white/20 hover:shadow-lg"
                  >
                    <p className="text-sm font-semibold text-black dark:text-white mb-2 leading-snug">{goal.title}</p>
                    
                    <div className="flex items-center justify-between gap-2 mt-4 pt-3 border-t border-black/[0.04] dark:border-white/[0.04]">
                      <button 
                        onClick={() => moveGoal(goal.id, "left")}
                        className="p-1 rounded text-neutral-500 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      
                      <div className="flex items-center gap-1.5">
                        <button 
                          onClick={() => deleteGoal(goal.id)}
                          className="p-1 rounded text-neutral-500 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={() => moveGoal(goal.id, "right")}
                          className="p-1 rounded text-neutral-500 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {goals.filter(g => g.status === "progress").length === 0 && (
                  <div className="flex-grow flex items-center justify-center border border-dashed border-black/5 dark:border-white/5 rounded-lg p-6 text-center">
                    <p className="text-xs text-neutral-400 dark:text-neutral-600 font-mono">No active execution nodes</p>
                  </div>
                )}
              </div>
            </div>

            {/* Swimlane: Done */}
            <div className="flex flex-col rounded-xl border border-black/5 dark:border-white/5 bg-neutral-100/30 dark:bg-neutral-900/20 p-4 min-h-[350px]">
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-black/5 dark:border-white/5">
                <span className="text-xs font-mono uppercase tracking-widest text-neutral-500 dark:text-neutral-400">03 // Complete</span>
                <span className="px-2 py-0.5 rounded bg-neutral-200 dark:bg-neutral-900 text-[10px] font-mono text-neutral-600 dark:text-neutral-400 border border-black/5 dark:border-white/5">
                  {goals.filter(g => g.status === "done").length}
                </span>
              </div>
              
              <div className="flex-grow flex flex-col gap-3">
                {goals.filter(g => g.status === "done").map(goal => (
                  <div 
                    key={goal.id}
                    className="relative border border-black/[0.06] dark:border-white/[0.06] bg-white dark:bg-neutral-950 p-4 rounded-lg transition-all duration-300 hover:border-black/20 dark:hover:border-white/20 hover:shadow-lg opacity-85"
                  >
                    <div className="flex items-start gap-2">
                      <span className="mt-1 flex-shrink-0 w-3.5 h-3.5 rounded-full border border-black/30 dark:border-white/30 bg-black dark:bg-white flex items-center justify-center text-white dark:text-black">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </span>
                      <p className="text-sm font-semibold text-neutral-500 dark:text-neutral-400 line-through leading-snug">{goal.title}</p>
                    </div>
                    
                    <div className="flex items-center justify-between gap-2 mt-4 pt-3 border-t border-black/[0.04] dark:border-white/[0.04]">
                      <button 
                        onClick={() => moveGoal(goal.id, "left")}
                        className="p-1 rounded text-neutral-500 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      
                      <button 
                        onClick={() => deleteGoal(goal.id)}
                        className="p-1 rounded text-neutral-500 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}

                {goals.filter(g => g.status === "done").length === 0 && (
                  <div className="flex-grow flex items-center justify-center border border-dashed border-black/5 dark:border-white/5 rounded-lg p-6 text-center">
                    <p className="text-xs text-neutral-400 dark:text-neutral-600 font-mono">No goals logged today</p>
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* Sandbox Form */}
          <form onSubmit={handleAddGoal} className="mt-8 pt-6 border-t border-black/5 dark:border-white/5 flex gap-3">
            <input 
              type="text" 
              value={newGoalTitle}
              onChange={(e) => setNewGoalTitle(e.target.value)}
              placeholder="Inject new goal node (e.g. Refactor workspace layouts)..."
              className="flex-grow px-4 py-3 bg-neutral-100 dark:bg-neutral-900 border border-black/10 dark:border-white/10 rounded-lg text-sm text-black dark:text-white placeholder-neutral-400 dark:placeholder-neutral-600 focus:outline-none focus:border-black dark:focus:border-white focus:ring-1 focus:ring-black dark:focus:ring-white transition-all font-mono"
            />
            <button 
              type="submit"
              className="py-3 px-6 bg-black dark:bg-white hover:bg-neutral-800 dark:hover:bg-neutral-200 text-white dark:text-black text-xs font-bold uppercase tracking-wider rounded-lg transition-all flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Node</span>
            </button>
          </form>

        </div>
      </section>

      {/* 5. Features Grid (Bento Box Section) */}
      <section id="features" className="relative max-w-7xl mx-auto px-6 py-20 z-10 border-t border-black/5 dark:border-white/5">
        <div className="text-center mb-16">
          <p className="text-xs uppercase tracking-[0.25em] font-mono text-neutral-500 mb-2">Designed for System Thinkers</p>
          <h2 className="font-display text-3xl md:text-5xl font-extrabold tracking-tight text-black dark:text-white">Structured to Eliminate Mental Overhead.</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1: Kanban Swimlanes */}
          <div className="group border border-black/5 dark:border-white/5 bg-neutral-50/50 dark:bg-neutral-950/40 p-8 rounded-2xl flex flex-col justify-between transition-all duration-300 hover:border-black/15 dark:hover:border-white/15 hover:bg-neutral-100/50 dark:hover:bg-neutral-900/10">
            <div>
              <div className="w-12 h-12 rounded-xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/10 dark:border-white/10 flex items-center justify-center p-3 mb-6 text-neutral-500 dark:text-neutral-400 group-hover:text-black dark:group-hover:text-white transition-colors">
                <Workflow className="w-full h-full" />
              </div>
              <h3 className="text-lg font-bold mb-3 text-black dark:text-white">Fluid Kanban Board</h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 font-light leading-relaxed">
                Organize daily targets into clean columns. Instantly edit status, adjust ordering, and visually align priorities in a monochrome environment.
              </p>
            </div>
            <div className="mt-8 flex items-center text-xs font-mono text-neutral-500 group-hover:text-black dark:group-hover:text-white transition-colors gap-1.5">
              <span>BOARD_INTERFACE_READY</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Card 2: AI Task Decomposition */}
          <div className="group border border-black/5 dark:border-white/5 bg-neutral-50/50 dark:bg-neutral-950/40 p-8 rounded-2xl flex flex-col justify-between transition-all duration-300 hover:border-black/15 dark:hover:border-white/15 hover:bg-neutral-100/50 dark:hover:bg-neutral-900/10">
            <div>
              <div className="w-12 h-12 rounded-xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/10 dark:border-white/10 flex items-center justify-center p-3 mb-6 text-neutral-500 dark:text-neutral-400 group-hover:text-black dark:group-hover:text-white transition-colors">
                <Sparkles className="w-full h-full" />
              </div>
              <h3 className="text-lg font-bold mb-3 text-black dark:text-white">Recursive AI Decomposition</h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 font-light leading-relaxed">
                Connect your personal API keys to break complex goals into manageable steps instantly. Use natural language commands to automatically structure workflows.
              </p>
            </div>
            <div className="mt-8 flex items-center text-xs font-mono text-neutral-500 group-hover:text-black dark:group-hover:text-white transition-colors gap-1.5">
              <span>COGNITIVE_PARSER_ACTIVE</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Card 3: Momentum & Reflection */}
          <div className="group border border-black/5 dark:border-white/5 bg-neutral-50/50 dark:bg-neutral-950/40 p-8 rounded-2xl flex flex-col justify-between transition-all duration-300 hover:border-black/15 dark:hover:border-white/15 hover:bg-neutral-100/50 dark:hover:bg-neutral-900/10">
            <div>
              <div className="w-12 h-12 rounded-xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/10 dark:border-white/10 flex items-center justify-center p-3 mb-6 text-neutral-500 dark:text-neutral-400 group-hover:text-black dark:group-hover:text-white transition-colors">
                <Flame className="w-full h-full" />
              </div>
              <h3 className="text-lg font-bold mb-3 text-black dark:text-white">Momentum & Retrospectives</h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 font-light leading-relaxed">
                Track consistency over time. Carry forward incomplete goals with auto-rollover, reflect with daily energy trackers, and build robust productivity chains.
              </p>
            </div>
            <div className="mt-8 flex items-center text-xs font-mono text-neutral-500 group-hover:text-black dark:group-hover:text-white transition-colors gap-1.5">
              <span>METRIC_NODE_OPERATIONAL</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </div>
          </div>

        </div>
      </section>

      {/* 6. Technical Specifications & Architecture (Specifications Block) */}
      <section id="architecture" className="relative max-w-7xl mx-auto px-6 py-20 z-10 border-t border-black/5 dark:border-white/5">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          <div>
            <p className="text-xs uppercase tracking-[0.25em] font-mono text-neutral-500 mb-2">Technical Architecture</p>
            <h2 className="font-display text-3xl md:text-5xl font-extrabold tracking-tight mb-6 leading-tight text-black dark:text-white">
              An Execution Environment Engine.
            </h2>
            <p className="text-neutral-600 dark:text-neutral-400 font-light text-base leading-relaxed mb-8">
              We believe a productivity environment shouldn't require sending your thoughts to external analytics clusters. Hactiq provides a fast, privacy-focused workspace synced securely to the cloud with minimal external dependencies.
            </p>

            <div className="space-y-6">
              
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded border border-black/10 dark:border-white/10 bg-black/[0.01] dark:bg-white/[0.01] flex items-center justify-center text-neutral-500 dark:text-neutral-400">
                  <Database className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-black dark:text-white mb-1">Cloud-Synced Persistence</h4>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 font-light leading-relaxed">
                    All goals, streak records, and workspace boards are persisted securely in the cloud using Supabase (Postgres) with real-time updates.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded border border-black/10 dark:border-white/10 bg-black/[0.01] dark:bg-white/[0.01] flex items-center justify-center text-neutral-500 dark:text-neutral-400">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-black dark:text-white mb-1">Zero Tracker Telemetry</h4>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 font-light leading-relaxed">
                    We maintain absolute privacy. Zero telemetry agents, tracking scripts, or usage analytics packages are bundled in the application.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded border border-black/10 dark:border-white/10 bg-black/[0.01] dark:bg-white/[0.01] flex items-center justify-center text-neutral-500 dark:text-neutral-400">
                  <Fingerprint className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-black dark:text-white mb-1">Tactile Keyboard Navigation</h4>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 font-light leading-relaxed">
                    Equipped with accessible focus rings, tab traps, and modal bindings, allowing you to orchestrate goals entirely via key operations.
                  </p>
                </div>
              </div>

            </div>
          </div>

          <div className="border border-black/10 dark:border-white/10 bg-neutral-50 dark:bg-neutral-950 p-6 rounded-xl font-mono text-[11px] leading-relaxed text-neutral-600 dark:text-neutral-400 shadow-2xl relative">
            <div className="absolute top-3 right-3 text-[9px] uppercase tracking-wider text-neutral-400 dark:text-neutral-600">sys_mon.o</div>
            
            <p className="text-black dark:text-white font-bold mb-2">HACTIQ COMPILER LOGS // CORE_MONITOR</p>
            <p className="text-neutral-400 dark:text-neutral-500">----------------------------------------------------</p>
            
            <div className="space-y-1">
              <p><span className="text-neutral-400 dark:text-neutral-500">[04:03:07]</span> STATE : Initializing connection to database cluster...</p>
              <p><span className="text-neutral-400 dark:text-neutral-500">[04:03:07]</span> STATE : Connected to Supabase PostgreSQL cluster</p>
              <p><span className="text-neutral-400 dark:text-neutral-500">[04:03:08]</span> RENDER: React v18 render pipeline active | DPR: 1.25</p>
              <p><span className="text-neutral-400 dark:text-neutral-500">[04:03:08]</span> DATA  : Hydrated user workspace boards in 15ms</p>
              <p><span className="text-neutral-400 dark:text-neutral-500">[04:03:09]</span> CACHE : Local user session cache active</p>
              <p className="text-black dark:text-white mt-4 font-semibold">WORKSPACE CONSTANTS</p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-neutral-500 pt-1">
                <p>db_driver:      <span className="text-black dark:text-white">supabase-postgres</span></p>
                <p>render_pipeline: <span className="text-black dark:text-white">react-dom (vdom)</span></p>
                <p>router:          <span className="text-black dark:text-white">react-router-v7</span></p>
                <p>style_system:    <span className="text-black dark:text-white">tailwind-css-v4</span></p>
                <p>auth_method:     <span className="text-black dark:text-white">firebase-oauth</span></p>
                <p>analytics:       <span className="text-black dark:text-white">recharts-svg</span></p>
              </div>
            </div>
            
            <div className="mt-6 p-3 bg-neutral-200 dark:bg-neutral-900 border border-black/5 dark:border-white/5 rounded flex items-center justify-between text-neutral-700 dark:text-neutral-300 text-[10px]">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-ping" />
                <span>ENVIRONMENT: STABLE</span>
              </span>
              <span>NODE_ID: hq_2.0_client</span>
            </div>
          </div>

        </div>
      </section>

      {/* 6.1. SEO Context & Philosophy Section */}
      <section className="relative max-w-7xl mx-auto px-6 py-24 z-10 border-t border-black/5 dark:border-white/5">
        <div className="mb-16">
          <p className="text-xs uppercase tracking-[0.25em] font-mono text-neutral-500 mb-2">Cognitive Architecture</p>
          <h2 className="font-display text-3xl md:text-5xl font-extrabold tracking-tight mb-6 text-black dark:text-white leading-tight">
            Designing a Distraction-Free System:<br />The Hactiq Philosophy
          </h2>
          <div className="h-px w-20 bg-black/20 dark:bg-white/20 mb-8" />
          <p className="text-base md:text-lg text-neutral-600 dark:text-neutral-400 font-light leading-relaxed max-w-3xl">
            In an era dominated by notifications, gamified badges, and bright color palettes designed to keep you scrolling, productivity has lost its core purpose. True focus isn't about collecting streak points or setting arbitrary deadlines in a bloated list; it’s about clear, spatial alignment with your objectives. Hactiq was built to address this overhead, serving as a specialized <strong className="text-black dark:text-white font-medium">web based goal tracker</strong> and <strong className="text-black dark:text-white font-medium">workflow management tool</strong> designed for high-fidelity execution.
          </p>
        </div>

        {/* Comparison Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {/* Card 1: The Problem */}
          <div className="group border border-black/5 dark:border-white/5 bg-neutral-50/50 dark:bg-neutral-950/40 p-8 rounded-2xl flex flex-col justify-between transition-all duration-300 hover:border-black/15 dark:hover:border-white/15 hover:bg-neutral-100/30 dark:hover:bg-neutral-900/10">
            <div>
              <p className="text-[10px] font-mono tracking-widest text-neutral-400 dark:text-neutral-500 uppercase mb-4">01 / THE OVERHEAD</p>
              <h3 className="text-xl font-bold mb-4 text-black dark:text-white">Why Generic To-Do Lists Fail</h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 font-light leading-relaxed mb-4">
                Most traditional to-do list applications fail because they present tasks in a single, unstructured list. This approach creates cognitive friction: a high-priority career goal sits right next to a trivial chore, leading to choice fatigue and procrastination.
              </p>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 font-light leading-relaxed">
                Without visual hierarchy or a clear progression system, users find themselves overwhelmed by the sheer density of their tasks, leading to lists that are simply abandoned.
              </p>
            </div>
            <div className="mt-8 text-[9px] font-mono text-neutral-400 dark:text-neutral-500">COGNITIVE_FRICTION: ACTIVE</div>
          </div>

          {/* Card 2: The Solution */}
          <div className="group border border-black/5 dark:border-white/5 bg-neutral-50/50 dark:bg-neutral-950/40 p-8 rounded-2xl flex flex-col justify-between transition-all duration-300 hover:border-black/15 dark:hover:border-white/15 hover:bg-neutral-100/30 dark:hover:bg-neutral-900/10">
            <div>
              <p className="text-[10px] font-mono tracking-widest text-neutral-400 dark:text-neutral-500 uppercase mb-4">02 / THE ARCHITECTURE</p>
              <h3 className="text-xl font-bold mb-4 text-black dark:text-white">The Kanban Goal Tracker</h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 font-light leading-relaxed mb-4">
                Hactiq solves this by functioning as a <strong className="text-black dark:text-white font-medium">goal tracker with kanban board</strong> layout, allowing you to group objectives by workflow stage. This <strong className="text-black dark:text-white font-medium">visual goal tracker</strong> design makes it simple to move goals from <em>Backlog</em> to <em>In Progress</em>, and finally to <em>Completed</em>.
              </p>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 font-light leading-relaxed">
                Because it is a hybrid <strong className="text-black dark:text-white font-medium">habit and goal tracker</strong>, you can manage daily routines alongside milestones, making Hactiq the ideal <strong className="text-black dark:text-white font-medium">goal tracker no signup required</strong> for users who want to start instantly in our sandbox.
              </p>
            </div>
            <div className="mt-8 text-[9px] font-mono text-neutral-400 dark:text-neutral-500">PERSISTENCE: CLOUD_SECURE</div>
          </div>
        </div>

        {/* Feature blocks (Key Capabilities) */}
        <div className="border border-black/5 dark:border-white/5 bg-neutral-50/30 dark:bg-neutral-950/20 p-8 rounded-2xl mb-16">
          <div className="mb-8">
            <p className="text-[10px] font-mono tracking-widest text-neutral-400 dark:text-neutral-500 uppercase mb-2">SYSTEM PARAMETERS</p>
            <h3 className="text-xl font-bold text-black dark:text-white">Key Capabilities Built for Execution</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="p-6 border border-black/5 dark:border-white/5 bg-neutral-50/50 dark:bg-neutral-950/40 rounded-xl hover:border-black/10 dark:hover:border-white/10 transition-colors">
              <h4 className="text-sm font-bold text-black dark:text-white mb-2">Customizable Kanban Boards</h4>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 font-light leading-relaxed">
                Segment your projects and workflows using clean, horizontal lanes. Drag and drop goals to track progress visually.
              </p>
            </div>
            <div className="p-6 border border-black/5 dark:border-white/5 bg-neutral-50/50 dark:bg-neutral-950/40 rounded-xl hover:border-black/10 dark:hover:border-white/10 transition-colors">
              <h4 className="text-sm font-bold text-black dark:text-white mb-2">Goal Templates</h4>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 font-light leading-relaxed">
                Skip the blank page syndrome. Seed starter templates like "Daily Essentials", "Quick Wins", or "Focus Blocks" to structure your day immediately.
              </p>
            </div>
            <div className="p-6 border border-black/5 dark:border-white/5 bg-neutral-50/50 dark:bg-neutral-950/40 rounded-xl hover:border-black/10 dark:hover:border-white/10 transition-colors">
              <h4 className="text-sm font-bold text-black dark:text-white mb-2">Category &amp; Priority Tagging</h4>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 font-light leading-relaxed">
                Classify goals (Work, Health, Personal, Finance, Education) and set priority levels (High, Medium, Low) to keep your focus where it belongs.
              </p>
            </div>
            <div className="p-6 border border-black/5 dark:border-white/5 bg-neutral-50/50 dark:bg-neutral-950/40 rounded-xl hover:border-black/10 dark:hover:border-white/10 transition-colors">
              <h4 className="text-sm font-bold text-black dark:text-white mb-2">Distraction-Free Environment</h4>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 font-light leading-relaxed">
                Built entirely on a high-contrast monochrome design system, Hactiq aligns with your natural cognitive focus, helping you maintain momentum without colorful distractions.
              </p>
            </div>
          </div>
        </div>

        {/* Conclusion / Summary */}
        <div className="border border-black/5 dark:border-white/5 bg-neutral-50/30 dark:bg-neutral-950/20 p-8 rounded-2xl flex flex-col md:flex-row gap-8 transition-all hover:border-black/10 dark:hover:border-white/10">
          <div className="flex-shrink-0 md:w-48">
            <p className="text-[10px] font-mono tracking-widest text-neutral-400 dark:text-neutral-500 uppercase mb-2">SUMMARY</p>
            <h3 className="text-lg font-bold text-black dark:text-white leading-tight">Clarity &amp; Execution</h3>
          </div>
          <div className="text-neutral-600 dark:text-neutral-400 font-light text-sm leading-relaxed space-y-4 flex-1">
            <p>
              Hactiq functions as a flexible <strong className="text-black dark:text-white font-medium">goal tracker for work and personal life</strong>, letting you separate workspaces or view everything in a unified dashboard. For students, professionals, and creators alike, it serves as the <strong className="text-black dark:text-white font-medium">best free goal tracker app</strong> to build consistency without subscription fees.
            </p>
            <p>
              By combining a <strong className="text-black dark:text-white font-medium">free goal tracker</strong> with advanced routing and database persistence, Hactiq gives you the power of a modern cloud-synced system without the complexity. If you're looking for a <strong className="text-black dark:text-white font-medium">simple goal tracker app</strong> that respects your focus, Hactiq is the ultimate <strong className="text-black dark:text-white font-medium">goal tracking app online</strong> to plan your future. It provides the utility of an <strong className="text-black dark:text-white font-medium">online goal planner</strong> with the sleek performance of a modern desktop client, helping you establish clarity and focus on what truly matters in your daily life.
            </p>
          </div>
        </div>
      </section>

      {/* 6.2. Frequently Asked Questions (FAQ) Section */}
      <section className="relative max-w-4xl mx-auto px-6 py-20 z-10 border-t border-black/5 dark:border-white/5">
        <h2 className="font-display text-2xl md:text-4xl font-extrabold tracking-tight mb-12 text-center text-black dark:text-white">
          Frequently Asked Questions
        </h2>
        
        <div className="space-y-2">
          
          <details className="group border-b border-black/5 dark:border-white/5 py-4">
            <summary className="flex justify-between items-center font-bold text-sm md:text-base cursor-pointer list-none [&::-webkit-details-marker]:hidden text-black dark:text-white select-none">
              <span>What is a goal tracker app?</span>
              <span className="transition-transform group-open:rotate-180 font-mono text-neutral-500 dark:text-neutral-400 text-lg w-5 text-right">+</span>
            </summary>
            <p className="mt-2 text-xs md:text-sm text-neutral-600 dark:text-neutral-400 font-light leading-relaxed">
              A goal tracker app is a digital tool designed to help you define, organize, and monitor progress toward personal or professional objectives over time, bridging the gap between high-level ambition and daily tasks.
            </p>
          </details>

          <details className="group border-b border-black/5 dark:border-white/5 py-4">
            <summary className="flex justify-between items-center font-bold text-sm md:text-base cursor-pointer list-none [&::-webkit-details-marker]:hidden text-black dark:text-white select-none">
              <span>Is Hactiq free to use?</span>
              <span className="transition-transform group-open:rotate-180 font-mono text-neutral-500 dark:text-neutral-400 text-lg w-5 text-right">+</span>
            </summary>
            <p className="mt-2 text-xs md:text-sm text-neutral-600 dark:text-neutral-400 font-light leading-relaxed">
              Yes, Hactiq is completely free to use. You can access all board features, goal tracking tools, templates, and workspace customizers without any cost.
            </p>
          </details>

          <details className="group border-b border-black/5 dark:border-white/5 py-4">
            <summary className="flex justify-between items-center font-bold text-sm md:text-base cursor-pointer list-none [&::-webkit-details-marker]:hidden text-black dark:text-white select-none">
              <span>Does Hactiq work without creating an account?</span>
              <span className="transition-transform group-open:rotate-180 font-mono text-neutral-500 dark:text-neutral-400 text-lg w-5 text-right">+</span>
            </summary>
            <p className="mt-2 text-xs md:text-sm text-neutral-600 dark:text-neutral-400 font-light leading-relaxed">
              Yes. Hactiq features an interactive sandbox mode that requires no signup, letting you test and manage goals locally in your browser session instantly.
            </p>
          </details>

          <details className="group border-b border-black/5 dark:border-white/5 py-4">
            <summary className="flex justify-between items-center font-bold text-sm md:text-base cursor-pointer list-none [&::-webkit-details-marker]:hidden text-black dark:text-white select-none">
              <span>Can I use Hactiq to manage daily tasks and long-term goals together?</span>
              <span className="transition-transform group-open:rotate-180 font-mono text-neutral-500 dark:text-neutral-400 text-lg w-5 text-right">+</span>
            </summary>
            <p className="mt-2 text-xs md:text-sm text-neutral-600 dark:text-neutral-400 font-light leading-relaxed">
              Absolutely. Hactiq is designed to handle both short-term daily tasks and long-term goals by grouping them into customizable stages on your Kanban board.
            </p>
          </details>

          <details className="group border-b border-black/5 dark:border-white/5 py-4">
            <summary className="flex justify-between items-center font-bold text-sm md:text-base cursor-pointer list-none [&::-webkit-details-marker]:hidden text-black dark:text-white select-none">
              <span>What's the difference between a goal tracker and a to-do list app?</span>
              <span className="transition-transform group-open:rotate-180 font-mono text-neutral-500 dark:text-neutral-400 text-lg w-5 text-right">+</span>
            </summary>
            <p className="mt-2 text-xs md:text-sm text-neutral-600 dark:text-neutral-400 font-light leading-relaxed">
              While to-do lists focus on static checkboxes, a goal tracker like Hactiq integrates visual workflow stages, progress status, categories, priorities, and goal templates to give you a spatial perspective of your goals.
            </p>
          </details>

          <details className="group border-b border-black/5 dark:border-white/5 py-4">
            <summary className="flex justify-between items-center font-bold text-sm md:text-base cursor-pointer list-none [&::-webkit-details-marker]:hidden text-black dark:text-white select-none">
              <span>Does Hactiq support Kanban-style boards?</span>
              <span className="transition-transform group-open:rotate-180 font-mono text-neutral-500 dark:text-neutral-400 text-lg w-5 text-right">+</span>
            </summary>
            <p className="mt-2 text-xs md:text-sm text-neutral-600 dark:text-neutral-400 font-light leading-relaxed">
              Yes, Hactiq features a fluid Kanban board interface where you can easily drag and drop your goal cards through stages like Backlog, In Progress, and Completed.
            </p>
          </details>

          <details className="group border-b border-black/5 dark:border-white/5 py-4">
            <summary className="flex justify-between items-center font-bold text-sm md:text-base cursor-pointer list-none [&::-webkit-details-marker]:hidden text-black dark:text-white select-none">
              <span>Can I track goals by category or priority in Hactiq?</span>
              <span className="transition-transform group-open:rotate-180 font-mono text-neutral-500 dark:text-neutral-400 text-lg w-5 text-right">+</span>
            </summary>
            <p className="mt-2 text-xs md:text-sm text-neutral-600 dark:text-neutral-400 font-light leading-relaxed">
              Yes. Hactiq allows you to organize every goal by category (such as Work, Personal, Health) and prioritize them (High, Medium, Low) to keep your focus aligned.
            </p>
          </details>

          <details className="group border-b border-black/5 dark:border-white/5 py-4">
            <summary className="flex justify-between items-center font-bold text-sm md:text-base cursor-pointer list-none [&::-webkit-details-marker]:hidden text-black dark:text-white select-none">
              <span>Is my data private and secure in Hactiq?</span>
              <span className="transition-transform group-open:rotate-180 font-mono text-neutral-500 dark:text-neutral-400 text-lg w-5 text-right">+</span>
            </summary>
            <p className="mt-2 text-xs md:text-sm text-neutral-600 dark:text-neutral-400 font-light leading-relaxed">
              Yes. When logged in, your data is stored securely in a dedicated PostgreSQL database powered by Supabase, with user authentication managed securely by Firebase.
            </p>
          </details>

          <details className="group border-b border-black/5 dark:border-white/5 py-4">
            <summary className="flex justify-between items-center font-bold text-sm md:text-base cursor-pointer list-none [&::-webkit-details-marker]:hidden text-black dark:text-white select-none">
              <span>Can I use Hactiq on mobile?</span>
              <span className="transition-transform group-open:rotate-180 font-mono text-neutral-500 dark:text-neutral-400 text-lg w-5 text-right">+</span>
            </summary>
            <p className="mt-2 text-xs md:text-sm text-neutral-600 dark:text-neutral-400 font-light leading-relaxed">
              Yes, Hactiq is a responsive web application designed to work smoothly on both desktop monitors and mobile device screens.
            </p>
          </details>

          <details className="group border-b border-black/5 dark:border-white/5 py-4">
            <summary className="flex justify-between items-center font-bold text-sm md:text-base cursor-pointer list-none [&::-webkit-details-marker]:hidden text-black dark:text-white select-none">
              <span>Does Hactiq offer goal templates to get started quickly?</span>
              <span className="transition-transform group-open:rotate-180 font-mono text-neutral-500 dark:text-neutral-400 text-lg w-5 text-right">+</span>
            </summary>
            <p className="mt-2 text-xs md:text-sm text-neutral-600 dark:text-neutral-400 font-light leading-relaxed">
              Yes, Hactiq provides default starter templates (like Daily Essentials, Quick Wins, and Focus Blocks) to help new users seed their boards and start tracking goals immediately.
            </p>
          </details>

        </div>
      </section>

      {/* 7. Call To Action (CTAs) */}
      <section className="relative max-w-5xl mx-auto px-6 py-24 z-10 text-center border-t border-black/5 dark:border-white/5">
        <h2 className="font-display text-4xl md:text-6xl font-extrabold tracking-tight mb-6 text-black dark:text-white">Initialize Your Focus Board.</h2>
        <p className="text-neutral-600 dark:text-neutral-400 max-w-xl mx-auto text-sm md:text-base font-light mb-10">
          Get started with our distraction-free, privacy-preserving workspace. Setup your goals in less than 30 seconds.
        </p>
        <button 
          onClick={() => navigate("/register")}
          className="py-4 px-10 bg-black dark:bg-white hover:bg-neutral-800 dark:hover:bg-neutral-200 text-white dark:text-black text-xs font-bold uppercase tracking-widest rounded-lg transition-all duration-200 cursor-pointer"
        >
          Begin Setup Process
        </button>
      </section>

      {/* 8. Minimalist Footer */}
      <footer className="relative w-full z-10 border-t border-black/5 dark:border-white/5 py-12 bg-neutral-50/50 dark:bg-neutral-950/40 text-neutral-500 text-xs">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <span className="font-display font-semibold tracking-tight text-black dark:text-white">Hactiq</span>
            <span className="text-neutral-500">© 2026 Hactiq Inc. All rights reserved.</span>
          </div>

          <div className="flex items-center gap-8 font-mono text-[10px] uppercase">
            <a href="#features" className="hover:text-black dark:hover:text-white text-neutral-500 transition-colors">Features</a>
            <a href="#sandbox" className="hover:text-black dark:hover:text-white text-neutral-500 transition-colors">Sandbox</a>
            <a href="#architecture" className="hover:text-black dark:hover:text-white text-neutral-500 transition-colors">Architecture</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
