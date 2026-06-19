// src/app/components/settings/AiTab.tsx
import { useApp } from "../../store";
import { Label } from "@/app/components/ui/label";
import { Switch } from "@/app/components/ui/switch";
import { Bot } from "lucide-react";

export function AiTab() {
  const { aiFeaturesConfig, toggleAiFeature } = useApp();


  return (
    <div className="bg-card border border-border rounded-xl p-4 sm:p-8 shadow-sm space-y-8 relative overflow-hidden">
      <div className="flex flex-col gap-2 border-b border-border/40 pb-6">
        <h2 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <Bot className="text-primary w-6 h-6" /> AI Integrations
        </h2>
        <p className="text-sm text-muted-foreground">
          Toggle Hactiq intelligent assistant features powered by Groq Llama and Mixtral.
        </p>
      </div>

      <div className="space-y-8">

        {/* Feature Toggles */}
        <div className="space-y-4">
          <Label className="text-sm font-semibold text-foreground block mb-2">AI Feature Toggles</Label>
          <div className="grid gap-3">
            {[
              { id: "naturalLanguageEntry", label: "Natural Language Entry", description: "Parse unstructured text into goals using AI" },
              { id: "voiceEntry", label: "Voice Entry", description: "Use microphone to dictate and parse goals" },
              { id: "autoCategorization", label: "Auto-Categorization", description: "AI suggests category based on goal title" },
              { id: "dailyBriefing", label: "Daily AI Briefing", description: "Receive a morning summary and advice" },
              { id: "smartRescheduling", label: "Smart Rescheduling", description: "AI suggests whether to carry forward or break down failed goals" },
              { id: "autoReflection", label: "Auto-Reflection", description: "Generate a positive insight when completing a goal" },
              { id: "aiInsights", label: "AI Insights in Stats", description: "AI coach analyzes 30-day trends and gives actionable advice" },
              { id: "smartTemplates", label: "Smart Template Generation", description: "Suggests creating a template when a goal is completed 3 times" },
              { id: "goalDecomposition", label: "Goal Decomposition", description: "Break down complex goals into smaller subtasks" },
              { id: "predictiveAlert", label: "Predictive Streak Alert", description: "Warns if there's a high chance of breaking your streak tomorrow" }
            ].map((f) => (
              <div key={f.id} className="flex items-center justify-between gap-4 p-4 border border-border rounded-xl bg-input-background">
                <div className="space-y-0.5">
                  <span className="text-xs font-semibold text-foreground block">{f.label}</span>
                  <span className="text-[11px] text-muted-foreground">{f.description}</span>
                </div>
                <Switch
                  checked={aiFeaturesConfig[f.id] ?? false}
                  onCheckedChange={(val) => toggleAiFeature(f.id, val)}
                  className="data-[state=checked]:bg-primary"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
