// src/app/components/Sidebar.tsx
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import {
  ChevronLeft, ChevronRight, User, LogOut, Bot
} from "lucide-react";
import { useApp } from "../store";
import { useAuth } from "../../contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/app/components/ui/avatar";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "./ui/tooltip";
import { navItems } from "../../config/navigation";

export function Sidebar() {
  const { activities } = useApp();
  const { userProfile, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem("hactiq_sidebar_collapsed") === "true";
  });

  const toggleSidebar = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("hactiq_sidebar_collapsed", String(next));
      return next;
    });
  };

  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;
  const unreadCount = activities.filter(a => !a.read).length;

  const handleLogout = async () => {
    setUserMenuOpen(false);
    await logout();
    
    // Clear local storage caches
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
    
    navigate("/");
  };

  return (
    <TooltipProvider>
      <aside
        className={`relative z-30 flex flex-col border-r border-border bg-sidebar transition-all duration-300 shrink-0 ${
          isCollapsed ? "w-16" : "w-60"
        }`}
      >
        {/* Logo and Toggle */}
        <div className={`flex ${!isCollapsed ? "items-center justify-between px-4" : "flex-col items-center gap-3 px-2"} py-4 border-b border-border`}>
          <img src="/logo.svg" alt="Hactiq Logo" className="w-8 h-8 shrink-0 object-contain" />
          {!isCollapsed && (
            <span className="font-semibold text-sidebar-foreground truncate mr-auto ml-2">Hactiq</span>
          )}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={toggleSidebar}
                className="text-muted-foreground hover:text-foreground transition-colors p-1.5 rounded-md hover:bg-sidebar-accent shrink-0"
                aria-label={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
              >
                {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">
              {isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
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
                collapsed={isCollapsed}
                badge={badge}
              />
            );
          })}

          {/* Hactiq Coach Trigger in Sidebar */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={() => {
                  // Toggle Hactiq Coach panel by writing to localstorage and triggering layout updates
                  const prev = localStorage.getItem("hactiq_coach_open") === "true";
                  localStorage.setItem("hactiq_coach_open", String(!prev));
                  window.dispatchEvent(new Event("storage"));
                }}
                className={`group flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 relative cursor-pointer ${
                  isCollapsed ? "justify-center" : ""
                } text-muted-foreground hover:text-foreground hover:bg-muted/40`}
                aria-label="Toggle Hactiq Coach"
              >
                <div className="relative flex items-center shrink-0">
                  <Bot size={16} />
                </div>
                {!isCollapsed && <span className="flex-1 truncate">Hactiq Coach</span>}
              </button>
            </TooltipTrigger>
            {isCollapsed && (
              <TooltipContent side="right">
                Hactiq Coach
              </TooltipContent>
            )}
          </Tooltip>
        </nav>

        {/* User Profile Section */}
        <div className="p-2 border-t border-border relative">
          {isCollapsed ? (
            // Collapsed: Avatar only, click opens popover options
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
            // Expanded: Avatar, Name, Email, and a Logout button directly available
            <div className="flex items-center gap-2 w-full px-2 py-2 rounded-md bg-sidebar-accent/30 border border-border/40">
              <button
                type="button"
                onClick={() => navigate("/settings")}
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
      </aside>
    </TooltipProvider>
  );
}

function NavItem({ to, icon, label, active, collapsed, badge }: {
  to: string; icon: React.ReactNode; label: string; active: boolean; collapsed: boolean; badge?: number;
}) {
  const link = (
    <Link
      to={to}
      className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 relative ${
        collapsed ? "justify-center" : ""
      } ${
        active
          ? "bg-sidebar-accent text-sidebar-primary font-medium border-l-2 border-primary pl-2.5"
          : "text-sidebar-foreground hover:bg-sidebar-accent"
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
