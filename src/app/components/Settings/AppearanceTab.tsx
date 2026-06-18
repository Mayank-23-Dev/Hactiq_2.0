// src/app/components/settings/AppearanceTab.tsx
import { useState } from "react";
import { useApp } from "../../store";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Label } from "@/app/components/ui/label";
import { Switch } from "@/app/components/ui/switch";
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
          <div className="grid grid-cols-3 gap-3">
            {([
              { id: "light", label: "Light", icon: <Sun size={18} /> },
              { id: "dark", label: "Dark", icon: <Moon size={18} /> },
              { id: "system", label: "System", icon: <Monitor size={18} /> },
            ] as const).map((t) => (
              <Button
                key={t.id}
                variant="outline"
                className={`flex flex-col items-center gap-2 h-auto py-4 rounded-xl border-2 transition-all ${
                  theme === t.id
                    ? "border-primary bg-muted text-foreground"
                    : "border-input hover:border-muted-foreground text-muted-foreground hover:text-foreground bg-background"
                }`}
                onClick={() => {
                  setTheme(t.id);
                  toast.success(`${t.label} theme applied`);
                }}
              >
                {t.icon}
                <span className="text-xs font-medium">{t.label}</span>
              </Button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between gap-4 p-4 border border-border rounded-lg bg-muted/30">
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
