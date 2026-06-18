// src/app/components/settings/AiTab.tsx
import { useState } from "react";
import { useApp } from "../../store";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Label } from "@/app/components/ui/label";
import { Input } from "@/app/components/ui/input";
import { Switch } from "@/app/components/ui/switch";
import { Button } from "@/app/components/ui/button";
import { Bot, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { callGroqAPI } from "../../../lib/groq";

export function AiTab() {
  const { groqApiKey, setGroqApiKey, aiFeaturesConfig, toggleAiFeature } = useApp();
  const [tempApiKey, setTempApiKey] = useState(groqApiKey);
  const [isTesting, setIsTesting] = useState(false);

  const handleTestConnection = async () => {
    if (!tempApiKey) {
      toast.error("Please enter an API key first");
      return;
    }
    setIsTesting(true);
    try {
      await callGroqAPI("Say 'hello world'", "You are a helpful assistant.", tempApiKey);
      toast.success("Connection successful!");
      setGroqApiKey(tempApiKey);
    } catch (e: any) {
      toast.error(e.message || "Failed to connect to Groq API");
    } finally {
      setIsTesting(false);
    }
  };

  const handleSaveApiKey = () => {
    setGroqApiKey(tempApiKey);
    toast.success("API Key saved");
  };

  return (
    <Card className="border border-border bg-card">
      <CardHeader>
        <CardTitle className="text-xl font-bold tracking-tight flex items-center gap-2">
          <Bot size={20} className="text-primary" />
          AI Integrations
        </CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          Configure your AI API keys and toggle intelligent assistant features.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="p-4 border border-border rounded-xl bg-accent/10 space-y-4">
          <div className="space-y-1">
            <h4 className="text-sm font-semibold text-foreground">Groq API Key</h4>
            <p className="text-xs text-muted-foreground">
              Enter your Groq API key to enable Llama and Mixtral-powered inference directly in your browser.
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <Input
              type="password"
              value={tempApiKey}
              onChange={(e) => setTempApiKey(e.target.value)}
              placeholder="gsk_..."
              className="font-mono text-sm"
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleSaveApiKey}>
                Save Key
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleTestConnection}
                disabled={isTesting || !tempApiKey}
                className="flex items-center gap-2"
              >
                {isTesting ? "Testing..." : <><CheckCircle size={14} /> Test Connection</>}
              </Button>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <Label className="text-sm font-semibold block mb-2">AI Feature Toggles</Label>
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
              <div key={f.id} className="flex items-center justify-between gap-4 p-3 border border-border rounded-lg bg-card">
                <div className="space-y-0.5">
                  <span className="text-xs font-semibold text-foreground block">{f.label}</span>
                  <span className="text-[11px] text-muted-foreground">{f.description}</span>
                </div>
                <Switch
                  checked={aiFeaturesConfig[f.id] ?? false}
                  onCheckedChange={(val) => toggleAiFeature(f.id, val)}
                />
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
