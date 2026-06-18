import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import {
  LayoutDashboard, Settings, Trello, ChevronLeft, ChevronRight, Target,
  History, Calendar, BarChart2, Database, FileText, ChevronDown, User, LogOut
} from "lucide-react";
import { useApp } from "../store";
import { useAuth } from "../../contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/app/components/ui/avatar";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "./ui/tooltip";

export function Sidebar() {
  const { boards, activities } = useApp();
  const { userProfile } = useAuth();
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

  const [boardsExpanded, setBoardsExpanded] = useState(true);
  const [goalsExpanded, setGoalsExpanded] = useState(true);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;
  const unreadCount = activities.filter(a => !a.read).length;

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
          <NavItem to="/" icon={<LayoutDashboard size={16} />} label="Dashboard" active={isActive("/")} collapsed={isCollapsed} />
          <NavItem to="/activities" icon={<Bell size={16} />} label="Activities" active={isActive("/activities")} collapsed={isCollapsed} badge={unreadCount} />

          {/* Goal Tracker Section */}
          {isCollapsed ? (
            <>
              <NavItem to="/goals" icon={<Target size={16} className="text-primary" />} label="Goal Tracker" active={isActive("/goals")} collapsed={isCollapsed} />
              <NavItem to="/goal-board" icon={<Trello size={16} />} label="Goal Board" active={isActive("/goal-board")} collapsed={isCollapsed} />
            </>
          ) : (
            <div>
              <button
                type="button"
                onClick={() => setGoalsExpanded(!goalsExpanded)}
                className="flex items-center gap-2 w-full px-2 py-1.5 rounded-md text-sm text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
              >
                <Target size={16} className="shrink-0 text-primary" />
                <span className="flex-1 text-left font-medium">Goal Tracker</span>
                <ChevronDown size={14} className={`transition-transform ${goalsExpanded ? "rotate-180" : ""}`} />
              </button>
              {goalsExpanded && (
                <div className="ml-4 mt-1 space-y-0.5">
                  <SubNavItem to="/goals" icon={<Target size={14} />} label="Today" active={isActive("/goals")} />
                  <SubNavItem to="/goal-board" icon={<Trello size={14} />} label="Goal Board" active={isActive("/goal-board")} />
                  <SubNavItem to="/goals/streaks" icon={<Target size={14} />} label="Streak Goals" active={isActive("/goals/streaks")} />
                  <SubNavItem to="/goals/yesterday" icon={<History size={14} />} label="Yesterday" active={isActive("/goals/yesterday")} />
                  <SubNavItem to="/goals/calendar" icon={<Calendar size={14} />} label="Calendar" active={isActive("/goals/calendar")} />
                  <SubNavItem to="/goals/stats" icon={<BarChart2 size={14} />} label="Stats" active={isActive("/goals/stats")} />
                  <SubNavItem to="/goals/database" icon={<Database size={14} />} label="All Goals" active={isActive("/goals/database")} />
                  <SubNavItem to="/goals/templates" icon={<FileText size={14} />} label="Templates" active={isActive("/goals/templates")} />
                </div>
              )}
            </div>
          )}

          {/* Boards Section */}
          {isCollapsed ? (
            boards.map(board => (
              <Tooltip key={board.id}>
                <TooltipTrigger asChild>
                  <Link
                    to={`/board/${board.id}`}
                    className={`flex items-center justify-center px-2 py-1.5 rounded-md text-sm transition-colors ${
                      location.pathname === `/board/${board.id}`
                        ? "bg-sidebar-accent text-sidebar-primary"
                        : "text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent"
                    }`}
                  >
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: board.color }} />
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">
                  {board.name}
                </TooltipContent>
              </Tooltip>
            ))
          ) : (
            <div>
              <button
                type="button"
                onClick={() => setBoardsExpanded(!boardsExpanded)}
                className="flex items-center gap-2 w-full px-2 py-1.5 rounded-md text-sm text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
              >
                <Trello size={16} className="shrink-0" />
                <span className="flex-1 text-left">Boards</span>
                <ChevronDown size={14} className={`transition-transform ${boardsExpanded ? "rotate-180" : ""}`} />
              </button>
              {boardsExpanded && (
                <div className="ml-4 mt-1 space-y-0.5">
                  {boards.map(board => (
                    <button
                      key={board.id}
                      type="button"
                      onClick={() => navigate(`/board/${board.id}`)}
                      className={`flex items-center gap-2 w-full px-2 py-1.5 rounded-md text-sm transition-colors ${
                        location.pathname === `/board/${board.id}`
                          ? "bg-sidebar-accent text-sidebar-primary"
                          : "text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent"
                      }`}
                    >
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: board.color }} />
                      <span className="truncate">{board.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          <NavItem to="/settings" icon={<Settings size={16} />} label="Settings" active={isActive("/settings")} collapsed={isCollapsed} />
        </nav>

        {/* User */}
        <div className="p-2 border-t border-border relative">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className={`flex items-center gap-2 w-full px-2 py-2 rounded-md hover:bg-sidebar-accent transition-colors ${isCollapsed ? "justify-center" : ""}`}
              >
                <Avatar className="w-7 h-7 shrink-0">
                  {userProfile.avatarUrl ? (
                    <AvatarImage src={userProfile.avatarUrl} alt={userProfile.name} className="object-cover" />
                  ) : null}
                  <AvatarFallback className="text-[10px] font-semibold bg-muted dark:bg-gray-800 text-foreground">
                    {userProfile.avatar}
                  </AvatarFallback>
                </Avatar>
                {!isCollapsed && (
                  <>
                    <div className="flex-1 text-left overflow-hidden">
                      <p className="text-sm font-medium text-sidebar-foreground truncate">{userProfile.name}</p>
                      <p className="text-muted-foreground truncate" style={{ fontSize: 11 }}>{userProfile.email}</p>
                    </div>
                    <ChevronDown size={14} className="text-muted-foreground" />
                  </>
                )}
              </button>
            </TooltipTrigger>
            {isCollapsed && (
              <TooltipContent side="right">
                {userProfile.name}
              </TooltipContent>
            )}
          </Tooltip>
          {userMenuOpen && (
            <div className="absolute bottom-full left-2 right-2 mb-1 bg-popover border border-border rounded-lg shadow-lg py-1 z-50">
              <button 
                type="button"
                onClick={() => { navigate("/settings"); setUserMenuOpen(false); }}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-accent transition-colors text-left"
              >
                <User size={14} /> Profile
              </button>
              <div className="my-1 border-t border-border" />
              <button type="button" className="flex items-center gap-2 w-full px-3 py-2 text-sm text-destructive hover:bg-accent transition-colors text-left">
                <LogOut size={14} /> Log out
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
      className={`flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors ${
        collapsed ? "justify-center" : ""
      } ${
        active
          ? "bg-sidebar-accent text-sidebar-primary font-medium"
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

function SubNavItem({ to, icon, label, active }: {
  to: string; icon: React.ReactNode; label: string; active: boolean;
}) {
  return (
    <Link
      to={to}
      className={`flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors ${
        active
          ? "bg-sidebar-accent text-sidebar-primary font-medium"
          : "text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent"
      }`}
    >
      <span className="shrink-0">{icon}</span>
      <span className="truncate">{label}</span>
    </Link>
  );
}
