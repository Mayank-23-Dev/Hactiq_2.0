// src/app/components/settings/AppearanceTab.tsx
import { useState } from "react";
import { useApp } from "../../store";
import { Label } from "@/app/components/ui/label";
import { Switch } from "@/app/components/ui/switch";
import { ToggleGroup, ToggleGroupItem } from "../ui/toggle-group";
import { Sun, Moon, Monitor, Eye } from "lucide-react";
import { toast } from "sonner";

export function AppearanceTab() {
  const { theme, setTheme } = useApp();
  const [compact, setCompact] = useState(false);

  return (
    <div className="bg-card border border-border rounded-xl p-8 shadow-sm space-y-8 relative overflow-hidden">
      <div className="flex flex-col gap-2 border-b border-border/40 pb-6">
        <h2 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <Eye className="text-primary w-6 h-6" /> Appearance Settings
        </h2>
        <p className="text-sm text-muted-foreground">
          Customize the visual style and density of the workspace.
        </p>
      </div>

      <div className="space-y-6">
        <div className="space-y-3">
          <Label className="text-sm font-semibold text-foreground">Theme Mode</Label>
          <ToggleGroup
            type="single"
            value={theme}
            onValueChange={(val) => {
              if (val) {
                setTheme(val as "light" | "dark" | "system");
                toast.success(`${val.charAt(0).toUpperCase() + val.slice(1)} theme applied`);
              }
            }}
            className="flex w-full rounded-xl border border-border bg-input-background p-1.5 gap-2"
          >
            {([
              { id: "light", label: "Light", icon: <Sun size={18} /> },
              { id: "dark", label: "Dark", icon: <Moon size={18} /> },
              { id: "system", label: "System", icon: <Monitor size={18} /> },
            ] as const).map((t) => {
              const isActive = theme === t.id;
              return (
                <ToggleGroupItem
                  key={t.id}
                  value={t.id}
                  className={`flex-1 flex flex-col items-center gap-2 h-auto py-3 rounded-lg border transition-all cursor-pointer ${
                    isActive
                       ? "bg-primary text-primary-foreground border-primary shadow-sm font-semibold"
                       : "bg-transparent text-muted-foreground hover:text-foreground border-transparent hover:bg-muted/40"
                  }`}
                >
                  {t.icon}
                  <span className="text-xs font-medium">{t.label}</span>
                </ToggleGroupItem>
              );
            })}
          </ToggleGroup>
        </div>

        <div className="flex items-center justify-between gap-4 p-5 border border-border rounded-xl bg-input-background">
          <div className="space-y-1">
            <Label className="text-sm font-semibold text-foreground">Compact View</Label>
            <p className="text-xs text-muted-foreground">
              Reduce card padding and spacing for more information density.
            </p>
          </div>
          <Switch
            checked={compact}
            onCheckedChange={(checked) => {
              setCompact(checked);
              toast.success(checked ? "Compact view enabled" : "Compact view disabled");
            }}
            className="data-[state=checked]:bg-primary"
          />
        </div>
      </div>
    </div>
  );
}
