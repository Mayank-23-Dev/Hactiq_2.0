import {
  LayoutDashboard,
  CalendarCheck2,
  Kanban,
  Flame,
  ArrowLeft,
  Calendar,
  BarChart3,
  Archive,
  FileText,
  Grid3x3,
  Bell,
  Settings
} from "lucide-react";

export const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/" },
  { label: "Task", icon: CalendarCheck2, path: "/today" },
  { label: "Kanban", icon: Kanban, path: "/goal-board" },
  { label: "Habits", icon: Flame, path: "/streak-goals" },
  { label: "Review", icon: ArrowLeft, path: "/yesterday" },
  { label: "Calendar", icon: Calendar, path: "/calendar" },
  { label: "Insights", icon: BarChart3, path: "/stats" },
  { label: "Archive", icon: Archive, path: "/archive" },
  { label: "Templates", icon: FileText, path: "/templates" },
  { label: "Workspaces", icon: Grid3x3, path: "/boards" },
  { label: "Activities", icon: Bell, path: "/activities" },
  { label: "Settings", icon: Settings, path: "/settings" },
];
