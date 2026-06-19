import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import {
  ChevronLeft, ChevronRight, ChevronDown, User, LogOut
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
              <button 
                type="button" 
                onClick={() => {
                  logout();
                  navigate("/", { replace: true });
                }}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-destructive hover:bg-accent transition-colors text-left"
              >
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

