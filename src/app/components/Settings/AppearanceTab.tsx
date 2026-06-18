// src/app/components/settings/AppearanceTab.tsx
import { useState } from "react";
import { useApp } from "../../store";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Label } from "@/app/components/ui/label";
import { Switch } from "@/app/components/ui/switch";
import { ToggleGroup, ToggleGroupItem } from "../ui/toggle-group";
import { Sun, Moon, Monitor } from "lucide-react";
import { toast } from "sonner";

export function AppearanceTab() {
  const { theme, setTheme } = useApp();
  const [compact, setCompact] = useState(false);

  return (
    <Card className="border border-border bg-card">
      <CardHeader>
        <CardTitle className="text-xl font-bold tracking-tight">Appearance Settings</CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          Customize the visual style and density of the workspace.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <Label className="text-sm font-semibold">Theme Mode</Label>
          <ToggleGroup
            type="single"
            value={theme}
            onValueChange={(val) => {
              if (val) {
                setTheme(val as "light" | "dark" | "system");
                toast.success(`${val.charAt(0).toUpperCase() + val.slice(1)} theme applied`);
              }
            }}
            className="flex w-full rounded-xl border border-border bg-muted/50 p-1.5 gap-2"
          >
            {([
              { id: "light", label: "Light", icon: <Sun size={18} /> },
              { id: "dark", label: "Dark", icon: <Moon size={18} /> },
              { id: "system", label: "System", icon: <Monitor size={18} /> },
            ] as const).map((t) => (
              <ToggleGroupItem
                key={t.id}
                value={t.id}
                className={`flex-1 flex flex-col items-center gap-2 h-auto py-3 rounded-lg border transition-all cursor-pointer ${
                  theme === t.id
                    ? "bg-background text-foreground border-border shadow-xs font-semibold"
                    : "bg-transparent text-muted-foreground hover:text-foreground border-transparent"
                }`}
              >
                {t.icon}
                <span className="text-xs font-medium">{t.label}</span>
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>

        <div className="flex items-center justify-between gap-4 p-4 border border-border rounded-xl bg-muted/50">
          <div className="space-y-0.5">
            <Label className="text-sm font-semibold">Compact View</Label>
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
          />
        </div>
      </CardContent>
    </Card>
  );
}
