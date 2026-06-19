// src/app/components/Layout.tsx
import { useState, useMemo, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import {
  Bell, Search, X, ChevronDown, LogOut, User, ChevronLeft, ChevronRight, Bot, Send, Trash2, Loader2, AlertTriangle, RefreshCw, Menu
} from "lucide-react";
import { useApp } from "../store";
import { useAuth } from "../../contexts/AuthContext";
import { ThemeToggle } from "../../components/ThemeToggle";
import { Particles } from "./ui/particles";
import { Avatar, AvatarFallback, AvatarImage } from "@/app/components/ui/avatar";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "./ui/tooltip";
import { formatDistanceToNow, parseISO } from "date-fns";
import { navItems } from "../../config/navigation";
import { callGroqAPI } from "../../lib/groq";
import { useClickOutside } from "../../hooks/useClickOutside";
import ReactMarkdown from "react-markdown";

interface SidebarInnerProps {
  isCollapsed: boolean;
  onToggleSidebar: () => void;
  isMobile: boolean;
  onCloseMobileDrawer?: () => void;
  unreadCount: number;
  isActive: (path: string) => boolean;
  userProfile: any;
  handleLogout: () => void;
  navigate: any;
}

function SidebarInner({
  isCollapsed,
  onToggleSidebar,
  isMobile,
  onCloseMobileDrawer,
  unreadCount,
  isActive,
  userProfile,
  handleLogout,
  navigate
}: SidebarInnerProps) {
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  return (
    <div className="flex flex-col h-full bg-sidebar">
      {/* Logo and Toggle/Close */}
      <div className={`flex ${(!isMobile && !isCollapsed) || isMobile ? "items-center justify-between px-4" : "flex-col items-center gap-3 px-2"} py-4 border-b border-border`}>
        <div className="flex items-center gap-2">
          <img src="/logo.svg" alt="Hactiq Logo" className="w-8 h-8 shrink-0 object-contain invert dark:invert-0" />
          {((!isMobile && !isCollapsed) || isMobile) && (
            <span className="font-semibold text-sidebar-foreground truncate mr-auto ml-2">Hactiq</span>
          )}
        </div>
        
        {isMobile ? (
          <button
            type="button"
            onClick={onCloseMobileDrawer}
            className="text-muted-foreground hover:text-foreground transition-colors p-1.5 rounded-md hover:bg-sidebar-accent shrink-0 cursor-pointer"
            aria-label="Close Sidebar"
          >
            <X size={16} />
          </button>
        ) : (
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={onToggleSidebar}
                className="text-muted-foreground hover:text-foreground transition-colors p-1.5 rounded-md hover:bg-sidebar-accent shrink-0 cursor-pointer"
                aria-label={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
              >
                {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">
              {isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            </TooltipContent>
          </Tooltip>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 p-2 space-y-1 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {navItems.map((item) => {
          const Icon = item.icon;
          const badge = item.label === "Activities" ? unreadCount : undefined;
          return (
            <NavItem
              key={item.path}
              to={item.path}
              icon={<Icon size={16} />}
              label={item.label}
              active={isActive(item.path)}
              collapsed={!isMobile && isCollapsed}
              badge={badge}
              onClick={isMobile ? onCloseMobileDrawer : undefined}
            />
          );
        })}
      </nav>

      {/* User Profile Section */}
      <div className="p-2 border-t border-border relative">
        {!isMobile && isCollapsed ? (
          // Collapsed: Avatar only, click toggles side popover
          <>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center justify-center w-full py-2 rounded-md hover:bg-sidebar-accent transition-colors cursor-pointer"
                  aria-label="User Profile Actions"
                >
                  <Avatar className="w-8 h-8 shrink-0">
                    {userProfile.avatarUrl ? (
                      <AvatarImage src={userProfile.avatarUrl} alt={userProfile.name} className="object-cover" />
                    ) : null}
                    <AvatarFallback className="text-xs font-semibold bg-muted text-foreground">
                      {userProfile.avatar}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">
                {userProfile.name} (Click for options)
              </TooltipContent>
            </Tooltip>

            {userMenuOpen && (
              <div className="absolute bottom-full left-14 mb-1 w-40 bg-popover border border-border rounded-lg shadow-lg py-1 z-50">
                <button 
                  type="button"
                  onClick={() => { navigate("/settings"); setUserMenuOpen(false); }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-accent transition-colors text-left text-foreground cursor-pointer"
                >
                  <User size={14} /> Profile
                </button>
                <div className="my-1 border-t border-border" />
                <button 
                  type="button" 
                  onClick={handleLogout}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-destructive hover:bg-accent transition-colors text-left cursor-pointer font-medium"
                >
                  <LogOut size={14} /> Log out
                </button>
              </div>
            )}
          </>
        ) : (
          // Expanded: Full profile summary with Logout button directly available
          <div className="flex items-center gap-2 w-full px-2 py-2 rounded-md bg-sidebar-accent/30 border border-border/40">
            <button
              type="button"
              onClick={() => { navigate("/settings"); if (isMobile && onCloseMobileDrawer) onCloseMobileDrawer(); }}
              className="flex items-center gap-2 flex-1 min-w-0 text-left hover:opacity-80 transition-opacity cursor-pointer"
              title="Go to settings"
            >
              <Avatar className="w-8 h-8 shrink-0">
                {userProfile.avatarUrl ? (
                  <AvatarImage src={userProfile.avatarUrl} alt={userProfile.name} className="object-cover" />
                ) : null}
                <AvatarFallback className="text-xs font-semibold bg-muted text-foreground">
                  {userProfile.avatar}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-sidebar-foreground truncate">{userProfile.name}</p>
                <p className="text-muted-foreground truncate" style={{ fontSize: 10 }}>{userProfile.email}</p>
              </div>
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer shrink-0"
              title="Log out"
              aria-label="Log out"
            >
              <LogOut size={15} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
}

export function Layout({ children, title = "Dashboard" }: LayoutProps) {
  const { theme, setTheme, userProfile, getAvatarColor, activities, markAllActivitiesAsRead, groqApiKey, goals, streakGoals } = useApp();
  const { logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem("hactiq_sidebar_collapsed") === "true";
  });
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  const toggleSidebar = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("hactiq_sidebar_collapsed", String(next));
      return next;
    });
  };

  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  // AI Coach state
  const [isCoachOpen, setIsCoachOpen] = useState(() => {
    return localStorage.getItem("hactiq_coach_open") === "true";
  });
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; content: string }[]>(() => {
    try {
      const stored = localStorage.getItem("hactiq_coach_messages");
      return stored ? JSON.parse(stored) : [
        { role: "assistant", content: "Hi! I'm Hactiq Coach, your dedicated habit and productivity assistant. What are we working on improving today?" }
      ];
    } catch {
      return [
        { role: "assistant", content: "Hi! I'm Hactiq Coach, your dedicated habit and productivity assistant. What are we working on improving today?" }
      ];
    }
  });
  const [inputMessage, setInputMessage] = useState("");
  const [isCoachLoading, setIsCoachLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const notifRef = useRef<HTMLDivElement>(null);
  const coachRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  useClickOutside(notifRef, () => {
    if (notifOpen) setNotifOpen(false);
  });

  useClickOutside(coachRef, () => {
    if (isCoachOpen) setIsCoachOpen(false);
  });

  useClickOutside(searchRef, () => {
    if (searchOpen) setSearchOpen(false);
  });

  useEffect(() => {
    localStorage.setItem("hactiq_coach_open", String(isCoachOpen));
  }, [isCoachOpen]);

  useEffect(() => {
    localStorage.setItem("hactiq_coach_messages", JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Get user goals & streaks context to personalize advice
  const userContextPrompt = useMemo(() => {
    if (!goals || goals.length === 0) return "No active or completed goals yet.";
    
    const activeGoals = goals.filter(g => !g.completed);
    const completedGoals = goals.filter(g => g.completed);
    const activeStreaks = streakGoals ? streakGoals.filter(s => s.active) : [];
    
    return `User Profile Progress Context:
- Active goals: ${activeGoals.slice(0, 5).map(g => g.title).join(", ") || "None"}
- Completed goals: ${completedGoals.slice(0, 5).map(g => g.title).join(", ") || "None"}
- Streak habits currently active: ${activeStreaks.map(s => s.title).join(", ") || "None"}
- Total goals completed: ${completedGoals.length}`;
  }, [goals, streakGoals]);

  const handleSendCoachMessage = async (e?: React.SyntheticEvent) => {
    if (e) e.preventDefault();
    if (!inputMessage.trim() || isCoachLoading) return;

    const userMsg = inputMessage.trim();
    setInputMessage("");
    setMessages(prev => [...prev, { role: "user", content: userMsg }]);
    setIsCoachLoading(true);

    try {
      if (!groqApiKey) {
        throw new Error("Groq API Key is not configured. Please check your settings.");
      }

      const systemPrompt = `You are Hactiq Coach, a dedicated Habit & Productivity Coach. You ONLY help with: Habits, Productivity, Focus, Consistency, Goal tracking, Daily routines, Time management, Self-improvement, and Personal discipline.

Here is the current user progress context to personalize your advice:
${userContextPrompt}

CRITICAL RULES:
1. If the user asks about ANY unrelated topics (including coding, programming, web development, politics, current news, general knowledge, math, science, history, movies, music, or general Q&A), you MUST ignore their question and reply EXACTLY with the text below, verbatim, and NOTHING else:
I'm Hactiq Coach.

I can help with:
 Habits
 Productivity
 Focus
 Goals
 Personal growth

Please ask something related to improving your habits or productivity.

2. Do NOT answer, explain, or assist with off-topic queries under any circumstances.
3. For allowed topics, be friendly, motivational, direct, practical, action-oriented, and keep responses concise (under 3-4 sentences). Format multi-step advice, lists, or suggestions as numbered or bulleted markdown lists, and use bold formatting (**text**) for key terms to ensure scannability. Refer to their goal progress context if relevant. Never roleplay or hallucinate.`;
      
      const historyContext = messages.slice(-6).map(m => `${m.role === "user" ? "User" : "Coach"}: ${m.content}`).join("\n");
      const fullPrompt = `${historyContext}\nUser: ${userMsg}\nCoach:`;

      const response = await callGroqAPI(fullPrompt, systemPrompt, groqApiKey);
      setMessages(prev => [...prev, { role: "assistant", content: response }]);
    } catch (err: any) {
      console.error("Hactiq Coach API Error:", err);
      setMessages(prev => [
        ...prev,
        {
          role: "assistant",
          content: "Hactiq Coach is temporarily unavailable. Please try again shortly."
        }
      ]);
    } finally {
      setIsCoachLoading(false);
    }
  };

  const handleClearCoach = () => {
    setMessages([
      { role: "assistant", content: "Chat cleared. Let me know how else I can help you today!" }
    ]);
  };

  const handleLogout = async () => {
    setUserMenuOpen(false);
    
    // Clear user session in Firebase + Supabase bindings
    await logout();
    
    // Clear local storage data caches
    const cacheKeys = [
      "hactiq_current_user",
      "gt_user_profile",
      "gt_boards",
      "gt_columns",
      "gt_tasks",
      "gt_activity",
      "gt_goals",
      "gt_streak_goals",
      "gt_templates",
      "gt_metadata",
      "gt_activities",
      "hactiq_coach_messages",
      "hactiq_coach_open"
    ];
    cacheKeys.forEach(k => localStorage.removeItem(k));
    
    // Redirect to landing page
    navigate("/");
  };

  const isActive = (path: string) => location.pathname === path;
  const unreadCount = useMemo(() => activities.filter(a => !a.read).length, [activities]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendCoachMessage(e);
    }
  };

  return (
    <TooltipProvider>
      <div className="flex h-screen bg-background text-foreground overflow-hidden" style={{ fontFamily: "Inter, sans-serif" }}>
        
        {/* Backdrop for mobile drawer */}
        <div
          className={`fixed inset-0 z-40 bg-background/80 backdrop-blur-sm transition-opacity duration-300 md:hidden ${
            isMobileDrawerOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          }`}
          onClick={() => setIsMobileDrawerOpen(false)}
        />

        {/* Mobile drawer container */}
        <div
          className={`fixed inset-y-0 left-0 z-50 flex w-60 flex-col border-r border-border bg-sidebar transition-transform duration-300 ease-in-out md:hidden ${
            isMobileDrawerOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <SidebarInner
            isCollapsed={false}
            onToggleSidebar={toggleSidebar}
            isMobile={true}
            onCloseMobileDrawer={() => setIsMobileDrawerOpen(false)}
            unreadCount={unreadCount}
            isActive={isActive}
            userProfile={userProfile}
            handleLogout={handleLogout}
            navigate={navigate}
          />
        </div>

        {/* Desktop Sidebar */}
        <aside
          className={`hidden md:flex flex-col border-r border-border bg-sidebar transition-all duration-300 shrink-0 ${
            isCollapsed ? "w-16" : "w-60"
          }`}
        >
          <SidebarInner
            isCollapsed={isCollapsed}
            onToggleSidebar={toggleSidebar}
            isMobile={false}
            unreadCount={unreadCount}
            isActive={isActive}
            userProfile={userProfile}
            handleLogout={handleLogout}
            navigate={navigate}
          />
        </aside>

        {/* Main */}
        <div className="flex-1 flex flex-col min-w-0 relative bg-background">
          <Particles className="absolute inset-0 z-0 opacity-40 dark:opacity-20 pointer-events-none" />
          
          {/* Topbar */}
          <header className="flex items-center gap-2 md:gap-3 px-4 md:px-6 py-3 border-b border-border bg-background/80 backdrop-blur shrink-0 relative z-40">
            {/* Hamburger button on mobile */}
            <button
              onClick={() => setIsMobileDrawerOpen(true)}
              className="p-1.5 -ml-1 text-muted-foreground hover:text-foreground rounded-md hover:bg-sidebar-accent transition-colors cursor-pointer md:hidden shrink-0"
              aria-label="Open navigation menu"
            >
              <Menu size={20} />
            </button>

            <h1 className="font-semibold text-foreground truncate">{title}</h1>
            <div className="flex-1" />

            {/* Search */}
            <div ref={searchRef} className="relative">
              {searchOpen ? (
                <div className="flex items-center gap-2 border border-border rounded-lg px-3 py-1.5 bg-input-background">
                  <Search size={14} className="text-muted-foreground" />
                  <input autoFocus placeholder="Search tasks…" className="bg-transparent outline-none text-sm w-40" onBlur={() => setSearchOpen(false)} />
                  <button onClick={() => setSearchOpen(false)}><X size={14} className="text-muted-foreground" /></button>
                </div>
              ) : (
                <button onClick={() => setSearchOpen(true)} className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors cursor-pointer">
                  <Search size={16} />
                </button>
              )}
            </div>

            {/* Notifications */}
            <div ref={notifRef} className="relative">
              <button onClick={() => { setNotifOpen(!notifOpen); markAllActivitiesAsRead(); }} className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors relative cursor-pointer">
                <Bell size={16} />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full animate-pulse" />
                )}
              </button>
              {notifOpen && (
                <div className="absolute right-0 top-full mt-2 w-72 bg-popover border border-border rounded-lg shadow-lg z-50 py-2">
                  <p className="px-3 pb-2 text-sm font-medium border-b border-border">Notifications</p>
                  {activities.length === 0 ? (
                    <p className="text-xs text-muted-foreground text-center py-4">No recent activity</p>
                  ) : (
                    <div className="max-h-60 overflow-y-auto divide-y divide-border">
                      {activities.slice(0, 5).map((act) => (
                        <div key={act.id} className="px-3 py-2 text-xs hover:bg-accent transition-colors">
                          <p className="text-foreground leading-snug">{act.message}</p>
                          <p className="text-muted-foreground mt-0.5" style={{ fontSize: 9 }}>
                            {formatDistanceToNow(parseISO(act.timestamp), { addSuffix: true })}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="border-t border-border mt-1 pt-1 text-center">
                    <Link to="/activities" onClick={() => setNotifOpen(false)} className="text-xs text-primary hover:underline font-semibold py-1.5 block">
                      View all activities
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Theme toggle */}
            <ThemeToggle />
          </header>

          {/* Content */}
          <main className="flex-1 overflow-y-auto relative z-10 bg-transparent flex flex-col">
            <EmailVerificationBanner />
            <div className="flex-1">
              {children}
            </div>
          </main>
        </div>
      </div>



      {/* Floating Hactiq Coach Trigger Button (Intercom-like) */}
      {!isCoachOpen && (
        <button
          onClick={() => setIsCoachOpen(true)}
          className="fixed bottom-6 right-6 z-40 p-4 bg-primary text-primary-foreground rounded-full shadow-2xl hover:scale-105 transition-all duration-200 cursor-pointer flex items-center justify-center border border-primary/20 hover:bg-primary/95"
          aria-label="Open Hactiq Coach"
        >
          <Bot size={22} className="animate-pulse" />
        </button>
      )}

      {/* Sliding Hactiq Coach Panel */}
      {isCoachOpen && (
        <div ref={coachRef} className="fixed top-0 right-0 h-full w-full sm:w-[420px] bg-card border-l border-border backdrop-blur-md shadow-2xl flex flex-col z-50 animate-in slide-in-from-right duration-200">
          {/* Header */}
          <div className="p-4 border-b border-border flex items-center justify-between bg-muted/35">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-primary" />
              <div>
                <h3 className="font-semibold text-foreground text-sm leading-none">Hactiq Coach</h3>
                <p className="text-[10px] text-muted-foreground mt-1">Habits • Productivity • Goals</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleClearCoach}
                className="p-1.5 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                title="Clear conversation"
              >
                <Trash2 size={14} />
              </button>
              <button
                onClick={() => setIsCoachOpen(false)}
                className="p-1.5 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                title="Close panel"
              >
                <X size={15} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-2 duration-150`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm border transition-all duration-200 ${
                    m.role === "user"
                      ? "bg-primary text-primary-foreground border-primary rounded-br-sm shadow-md"
                      : "bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700/50 text-foreground rounded-bl-sm shadow-sm"
                  }`}
                >
                  {m.role === "user" ? (
                    <p className="whitespace-pre-wrap leading-relaxed">{m.content}</p>
                  ) : (
                    <div className="prose prose-sm dark:prose-invert max-w-none text-foreground leading-relaxed space-y-2">
                      <ReactMarkdown
                        components={{
                          p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                          ul: ({ children }) => <ul className="list-disc pl-4 mb-2 space-y-1">{children}</ul>,
                          ol: ({ children }) => <ol className="list-decimal pl-4 mb-2 space-y-1">{children}</ol>,
                          li: ({ children }) => <li className="mb-0.5">{children}</li>,
                          strong: ({ children }) => <strong className="font-semibold text-zinc-900 dark:text-white">{children}</strong>,
                        }}
                      >
                        {m.content}
                      </ReactMarkdown>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isCoachLoading && (
              <div className="flex justify-start animate-in fade-in duration-100">
                <div className="bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700/50 text-foreground rounded-2xl rounded-bl-sm px-4 py-3 text-sm max-w-[85%] flex items-center gap-2.5 shadow-sm">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
                  <span className="text-xs text-muted-foreground">Thinking...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Form */}
          <form onSubmit={handleSendCoachMessage} className="p-4 border-t border-border bg-muted/10">
            <div className="relative flex items-end gap-2">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask your coach..."
                disabled={isCoachLoading}
                rows={1}
                className="w-full min-h-[44px] max-h-28 py-3 pl-4 pr-12 bg-background border border-border rounded-xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary disabled:opacity-60 resize-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              />
              <button
                type="submit"
                disabled={!inputMessage.trim() || isCoachLoading}
                className="absolute right-2 bottom-2 p-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/95 active:scale-95 transition-all disabled:opacity-40 disabled:scale-100 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center"
              >
                <Send size={14} />
              </button>
            </div>
          </form>
        </div>
      )}
    </TooltipProvider>
  );
}

function NavItem({ to, icon, label, active, collapsed, badge, onClick }: {
  to: string; icon: React.ReactNode; label: string; active: boolean; collapsed: boolean; badge?: number; onClick?: () => void;
}) {
  const link = (
    <Link
      to={to}
      onClick={onClick}
      className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 relative ${
        collapsed ? "justify-center" : ""
      } ${
        active
          ? "bg-primary/10 text-primary border-l-2 border-primary pl-2.5"
          : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
      }`}
    >
      <div className="relative flex items-center shrink-0">
        <span>{icon}</span>
        {badge !== undefined && badge > 0 && collapsed && (
          <span className="absolute -top-1.5 -right-1.5 w-2.5 h-2.5 bg-primary rounded-full ring-2 ring-background animate-pulse" />
        )}
      </div>
      {!collapsed && <span className="flex-1 truncate">{label}</span>}
      {!collapsed && badge !== undefined && badge > 0 && (
        <span className="px-1.5 py-0.5 text-[9px] font-bold bg-primary text-primary-foreground rounded-full leading-none shrink-0">
          {badge}
        </span>
      )}
    </Link>
  );

  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          {link}
        </TooltipTrigger>
        <TooltipContent side="right">
          {label}
        </TooltipContent>
      </Tooltip>
    );
  }

  return link;
}

function EmailVerificationBanner() {
  const { user, emailVerified, creationTime, resendVerification } = useAuth();
  const [isDismissed, setIsDismissed] = useState(false);
  const [timeLeft, setTimeLeft] = useState<string>("");

  useEffect(() => {
    if (!user || emailVerified || !creationTime || isDismissed) return;

    const ONE_HOUR = 60 * 60 * 1000;
    const createdAt = new Date(creationTime).getTime();
    const expiresAt = createdAt + ONE_HOUR;

    const updateTimer = () => {
      const now = Date.now();
      const diff = expiresAt - now;

      if (diff <= 0) {
        setTimeLeft("expired");
        return;
      }

      const minutes = Math.floor(diff / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${minutes}m ${seconds}s`);
    };

    updateTimer();
    const timer = setInterval(updateTimer, 1000);
    return () => clearInterval(timer);
  }, [user, emailVerified, creationTime, isDismissed]);

  if (!user || emailVerified || !creationTime || isDismissed) return null;

  return (
    <div className="bg-amber-500/10 border-b border-amber-500/20 px-6 py-2.5 text-xs text-amber-200 flex items-center justify-between gap-4 z-30 select-none animate-in fade-in slide-in-from-top duration-250 shrink-0">
      <div className="flex items-center gap-2 flex-grow flex-wrap sm:flex-nowrap">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
          <span className="leading-snug">
            Please verify your email within <span className="font-bold text-white font-mono">{timeLeft}</span> or your account will be deleted.
          </span>
        </div>
        <button
          onClick={resendVerification}
          className="px-2 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-100 hover:text-white font-semibold transition cursor-pointer flex items-center gap-1.5 shrink-0"
        >
          <RefreshCw className="w-3 h-3" />
          <span>Resend verification email</span>
        </button>
      </div>
      <button 
        onClick={() => setIsDismissed(true)} 
        className="p-1 rounded-md hover:bg-amber-500/20 text-amber-400 hover:text-amber-200 transition cursor-pointer shrink-0"
        title="Dismiss warning"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
