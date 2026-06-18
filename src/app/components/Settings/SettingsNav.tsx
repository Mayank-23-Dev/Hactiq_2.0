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
    <nav className="flex flex-row md:flex-col gap-1 w-full md:w-56 shrink-0 overflow-x-auto md:overflow-visible pb-4 md:pb-0">
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        return (
          <Button
            key={item.id}
            variant={isActive ? "secondary" : "ghost"}
            onClick={() => setActiveTab(item.id)}
            className={`justify-start gap-3 px-4 py-2.5 h-10 w-full text-sm transition-colors font-medium ${
              isActive
                ? "bg-secondary text-secondary-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            }`}
          >
            <Icon size={16} />
            <span>{item.label}</span>
          </Button>
        );
      })}
    </nav>
  );
}
