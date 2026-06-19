// src/app/components/settings/SettingsNav.tsx
import { User, Sun, Bell, Sliders, Shield, Bot } from "lucide-react";
import { Button } from "@/app/components/ui/button";

export type TabType = "profile" | "appearance" | "notifications" | "customization" | "account" | "ai";

interface SettingsNavProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}

export function SettingsNav({ activeTab, setActiveTab }: SettingsNavProps) {
  const items = [
    { id: "profile", label: "Profile", icon: User },
    { id: "appearance", label: "Appearance", icon: Sun },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "customization", label: "Customization", icon: Sliders },
    { id: "account", label: "Account", icon: Shield },
    { id: "ai", label: "AI Integrations", icon: Bot },
  ] as const;

  return (
    <nav className="flex flex-row md:flex-col gap-1.5 w-full md:w-64 shrink-0 overflow-x-auto md:overflow-visible pb-4 md:pb-0 border-b md:border-b-0 md:border-r border-border/40 pr-0 md:pr-4">
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-150 text-left whitespace-nowrap w-auto md:w-full cursor-pointer ${
              isActive
                ? "bg-primary/10 text-primary border-l-2 border-primary pl-3.5"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
            }`}
          >
            <Icon size={16} className={`${isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"}`} />
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
