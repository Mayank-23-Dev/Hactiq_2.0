import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import {
  LayoutDashboard, Settings, Bell, Search, Sun, Moon, Menu, X,
  ChevronDown, LogOut, User, Trello, ChevronRight, Target,
  History, Calendar, BarChart2, Database, FileText
} from "lucide-react";
import { useApp } from "../store";
import { ThemeToggle } from "../../components/ThemeToggle";

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
}

export function Layout({ children, title = "Dashboard" }: LayoutProps) {
  const { boards, theme, setTheme } = useApp();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [boardsExpanded, setBoardsExpanded] = useState(true);
  const [goalsExpanded, setGoalsExpanded] = useState(true);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden" style={{ fontFamily: "Inter, sans-serif" }}>
      {/* Sidebar */}
      <aside
        className={`flex flex-col border-r border-border bg-sidebar transition-all duration-300 shrink-0 ${
          sidebarOpen ? "w-60" : "w-14"
        }`}
      >
        {/* Logo */}
        <div className="flex items-center gap-2 px-3 py-4 border-b border-border">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary shrink-0">
            <Trello size={16} className="text-primary-foreground" />
          </div>
          {sidebarOpen && (
            <span className="font-semibold text-sidebar-foreground truncate">Hactiq</span>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="ml-auto text-muted-foreground hover:text-foreground transition-colors"
          >
            {sidebarOpen ? <ChevronRight size={16} /> : <Menu size={16} />}
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
          <NavItem to="/" icon={<LayoutDashboard size={16} />} label="Dashboard" active={isActive("/")} collapsed={!sidebarOpen} />

          {/* Goal Tracker dropdown */}
          <div>
            <button
              onClick={() => setGoalsExpanded(!goalsExpanded)}
              className={`flex items-center gap-2 w-full px-2 py-1.5 rounded-md text-sm text-sidebar-foreground hover:bg-sidebar-accent transition-colors ${!sidebarOpen ? "justify-center" : ""}`}
            >
              <Target size={16} className="shrink-0 text-primary" />
              {sidebarOpen && (
                <>
                  <span className="flex-1 text-left font-medium">Goal Tracker</span>
                  <ChevronDown size={14} className={`transition-transform ${goalsExpanded ? "rotate-180" : ""}`} />
                </>
              )}
            </button>
            {sidebarOpen && goalsExpanded && (
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

          {/* Boards dropdown */}
          <div>
            <button
              onClick={() => setBoardsExpanded(!boardsExpanded)}
              className={`flex items-center gap-2 w-full px-2 py-1.5 rounded-md text-sm text-sidebar-foreground hover:bg-sidebar-accent transition-colors ${!sidebarOpen ? "justify-center" : ""}`}
            >
              <Trello size={16} className="shrink-0" />
              {sidebarOpen && (
                <>
                  <span className="flex-1 text-left">Boards</span>
                  <ChevronDown size={14} className={`transition-transform ${boardsExpanded ? "rotate-180" : ""}`} />
                </>
              )}
            </button>
            {sidebarOpen && boardsExpanded && (
              <div className="ml-4 mt-1 space-y-0.5">
                {boards.map(board => (
                  <button
                    key={board.id}
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

          <NavItem to="/settings" icon={<Settings size={16} />} label="Settings" active={isActive("/settings")} collapsed={!sidebarOpen} />
        </nav>

        {/* User */}
        <div className="p-2 border-t border-border relative">
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center gap-2 w-full px-2 py-2 rounded-md hover:bg-sidebar-accent transition-colors"
          >
            <div className="w-7 h-7 rounded-full bg-indigo-500 flex items-center justify-center text-white shrink-0" style={{ fontSize: 11 }}>
              AC
            </div>
            {sidebarOpen && (
              <>
                <div className="flex-1 text-left overflow-hidden">
                  <p className="text-sm font-medium text-sidebar-foreground truncate">Alex Chen</p>
                  <p className="text-muted-foreground truncate" style={{ fontSize: 11 }}>alex@company.co</p>
                </div>
                <ChevronDown size={14} className="text-muted-foreground" />
              </>
            )}
          </button>
          {userMenuOpen && (
            <div className="absolute bottom-full left-2 right-2 mb-1 bg-popover border border-border rounded-lg shadow-lg py-1 z-50">
              <button className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-accent transition-colors">
                <User size={14} /> Profile
              </button>
              <div className="my-1 border-t border-border" />
              <button className="flex items-center gap-2 w-full px-3 py-2 text-sm text-destructive hover:bg-accent transition-colors">
                <LogOut size={14} /> Log out
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="flex items-center gap-3 px-6 py-3 border-b border-border bg-background shrink-0">
          <h1 className="font-semibold text-foreground">{title}</h1>
          <div className="flex-1" />

          {/* Search */}
          <div className="relative">
            {searchOpen ? (
              <div className="flex items-center gap-2 border border-border rounded-lg px-3 py-1.5 bg-input-background">
                <Search size={14} className="text-muted-foreground" />
                <input autoFocus placeholder="Search tasks…" className="bg-transparent outline-none text-sm w-40" onBlur={() => setSearchOpen(false)} />
                <button onClick={() => setSearchOpen(false)}><X size={14} className="text-muted-foreground" /></button>
              </div>
            ) : (
              <button onClick={() => setSearchOpen(true)} className="p-2 rounded-md hover:bg-accent transition-colors text-muted-foreground hover:text-foreground">
                <Search size={16} />
              </button>
            )}
          </div>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setNotifOpen(!notifOpen)}
              className="p-2 rounded-md hover:bg-accent transition-colors text-muted-foreground hover:text-foreground relative"
            >
              <Bell size={16} />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-indigo-500 rounded-full" />
            </button>
            {notifOpen && (
              <div className="absolute right-0 top-full mt-2 w-72 bg-popover border border-border rounded-lg shadow-lg z-50 py-2">
                <p className="px-3 pb-2 text-sm font-medium border-b border-border">Notifications</p>
                {[
                  "Alex moved a task to Done",
                  "BK commented on Onboarding flow",
                  "New board 'Q4 Planning' was created",
                ].map((n, i) => (
                  <div key={i} className="px-3 py-2 text-sm hover:bg-accent cursor-pointer">
                    <p>{n}</p>
                    <p className="text-muted-foreground" style={{ fontSize: 11 }}>{i === 0 ? "5 min ago" : i === 1 ? "1 hr ago" : "3 hrs ago"}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Theme toggle */}
          <ThemeToggle />
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

function NavItem({ to, icon, label, active, collapsed }: {
  to: string; icon: React.ReactNode; label: string; active: boolean; collapsed: boolean;
}) {
  return (
    <Link
      to={to}
      className={`flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors ${
        collapsed ? "justify-center" : ""
      } ${
        active
          ? "bg-sidebar-accent text-sidebar-primary font-medium"
          : "text-sidebar-foreground hover:bg-sidebar-accent"
      }`}
      title={collapsed ? label : undefined}
    >
      <span className="shrink-0">{icon}</span>
      {!collapsed && <span>{label}</span>}
    </Link>
  );
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
