import { useState } from "react";
import { Sun, Moon, Monitor, Bell, Shield, User, Download, Trash2, Bot, CheckCircle, Sliders, Plus, ChevronUp, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { useApp } from "../store";
import { Layout } from "./Layout";
import { callGroqAPI } from "../../lib/groq";

type Tab = "profile" | "appearance" | "notifications" | "account" | "ai" | "customization";

export function Settings() {
  const { theme, setTheme, groqApiKey, setGroqApiKey, aiFeaturesConfig, toggleAiFeature, customConfig, updateCustomConfig } = useApp();
  const [activeTab, setActiveTab] = useState<Tab>("profile");
  const [name, setName] = useState("Alex Chen");
  const [email, setEmail] = useState("alex@company.co");
  const [compact, setCompact] = useState(false);
  const [emailDigest, setEmailDigest] = useState(true);
  const [pushNotifs, setPushNotifs] = useState(false);
  const [taskUpdates, setTaskUpdates] = useState(true);
  
  const [tempApiKey, setTempApiKey] = useState(groqApiKey);
  const [isTesting, setIsTesting] = useState(false);

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "profile", label: "Profile", icon: <User size={15} /> },
    { id: "appearance", label: "Appearance", icon: <Sun size={15} /> },
    { id: "notifications", label: "Notifications", icon: <Bell size={15} /> },
    { id: "customization", label: "Customization", icon: <Sliders size={15} /> },
    { id: "account", label: "Account", icon: <Shield size={15} /> },
    { id: "ai", label: "AI Integrations", icon: <Bot size={15} /> },
  ];

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
    <Layout title="Settings">
      <div className="max-w-3xl mx-auto p-6">
        <div className="flex gap-1 mb-8 border-b border-border overflow-x-auto">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm transition-colors border-b-2 -mb-px whitespace-nowrap ${
                activeTab === t.id
                  ? "border-primary text-foreground font-medium"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {activeTab === "profile" && (
          <div className="space-y-6">
            {/* Avatar */}
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-full bg-indigo-500 flex items-center justify-center text-white text-xl font-semibold">
                AC
              </div>
              <div>
                <button className="px-3 py-1.5 text-sm border border-border rounded-md hover:bg-accent transition-colors">
                  Upload photo
                </button>
                <p className="text-xs text-muted-foreground mt-1">JPG, PNG, or GIF up to 5MB</p>
              </div>
            </div>

            <FormField label="Full name">
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-3 py-2 bg-input-background border border-border rounded-md text-sm outline-none focus:ring-2 focus:ring-ring"
              />
            </FormField>

            <FormField label="Email address">
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-3 py-2 bg-input-background border border-border rounded-md text-sm outline-none focus:ring-2 focus:ring-ring"
              />
            </FormField>

            <FormField label="Bio">
              <textarea
                placeholder="Tell your team about yourself…"
                rows={3}
                className="w-full px-3 py-2 bg-input-background border border-border rounded-md text-sm outline-none focus:ring-2 focus:ring-ring resize-none"
              />
            </FormField>

            <button
              onClick={() => toast.success("Profile updated")}
              className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity"
            >
              Save changes
            </button>
          </div>
        )}

        {activeTab === "appearance" && (
          <div className="space-y-6">
            <div>
              <label className="text-sm font-medium text-foreground block mb-3">Theme</label>
              <div className="grid grid-cols-3 gap-3">
                {([
                  { id: "light", label: "Light", icon: <Sun size={18} /> },
                  { id: "dark", label: "Dark", icon: <Moon size={18} /> },
                  { id: "system", label: "System", icon: <Monitor size={18} /> },
                ] as const).map(t => (
                  <button
                    key={t.id}
                    onClick={() => { setTheme(t.id); toast.success(`${t.label} theme applied`); }}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                      theme === t.id ? "border-primary bg-primary/5" : "border-border hover:border-muted-foreground"
                    }`}
                  >
                    <div className={`${theme === t.id ? "text-primary" : "text-muted-foreground"}`}>{t.icon}</div>
                    <span className={`text-sm ${theme === t.id ? "text-primary font-medium" : "text-muted-foreground"}`}>{t.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <Toggle
              label="Compact view"
              description="Reduce card padding and spacing for more information density"
              value={compact}
              onChange={setCompact}
            />
          </div>
        )}

        {activeTab === "notifications" && (
          <div className="space-y-5">
            <Toggle
              label="Email digest"
              description="Receive a daily summary of your board activity via email"
              value={emailDigest}
              onChange={setEmailDigest}
            />
            <div className="border-t border-border pt-5">
              <Toggle
                label="Desktop push notifications"
                description="Get notified in your browser when tasks are assigned to you"
                value={pushNotifs}
                onChange={setPushNotifs}
              />
            </div>
            <div className="border-t border-border pt-5">
              <Toggle
                label="Task updates"
                description="Be notified when tasks you're assigned to are moved or updated"
                value={taskUpdates}
                onChange={setTaskUpdates}
              />
            </div>
            <button onClick={() => toast.success("Notification preferences saved")} className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity">
              Save preferences
            </button>
          </div>
        )}

        {activeTab === "account" && (
          <div className="space-y-6">
            <div className="p-4 border border-border rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-foreground">Export data</h4>
                  <p className="text-sm text-muted-foreground mt-0.5">Download all your boards and tasks as JSON</p>
                </div>
                <button
                  onClick={() => toast.success("Export started — check your email")}
                  className="flex items-center gap-2 px-3 py-2 text-sm border border-border rounded-md hover:bg-accent transition-colors"
                >
                  <Download size={14} /> Export
                </button>
              </div>
            </div>

            <div className="p-4 border border-destructive/30 rounded-xl bg-destructive/5">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-destructive">Delete account</h4>
                  <p className="text-sm text-muted-foreground mt-0.5">Permanently delete your account and all data. This cannot be undone.</p>
                </div>
                <button
                  onClick={() => toast.error("Account deletion requires email confirmation")}
                  className="flex items-center gap-2 px-3 py-2 text-sm bg-destructive text-white rounded-md hover:opacity-90 transition-opacity"
                >
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === "ai" && (
          <div className="space-y-6">
            <div className="p-4 border border-border rounded-xl bg-card">
              <h3 className="font-semibold text-lg mb-2 flex items-center gap-2"><Bot size={18} /> Groq API Settings</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Enter your Groq API key to enable AI features. We use Llama 3 70B and Mixtral for blazing-fast inference directly from your browser.
              </p>
              
              <FormField label="Groq API Key">
                <input
                  type="password"
                  value={tempApiKey}
                  onChange={e => setTempApiKey(e.target.value)}
                  placeholder="gsk_..."
                  className="w-full px-3 py-2 bg-input-background border border-border rounded-md text-sm outline-none focus:ring-2 focus:ring-primary font-mono"
                />
              </FormField>
              
              <div className="flex gap-3 mt-4">
                <button
                  onClick={handleSaveApiKey}
                  className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity"
                >
                  Save Key
                </button>
                <button
                  onClick={handleTestConnection}
                  disabled={isTesting || !tempApiKey}
                  className="px-4 py-2 text-sm border border-border rounded-md hover:bg-accent transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {isTesting ? "Testing..." : <><CheckCircle size={14} /> Test Connection</>}
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <h3 className="font-semibold text-lg mb-4 mt-8">AI Feature Toggles</h3>
              
              <div className="grid gap-4">
                <Toggle
                  label="Natural Language Entry"
                  description="Parse unstructured text into goals using AI"
                  value={aiFeaturesConfig.naturalLanguageEntry}
                  onChange={(v) => toggleAiFeature("naturalLanguageEntry", v)}
                />
                <Toggle
                  label="Voice Entry"
                  description="Use microphone to dictate and parse goals"
                  value={aiFeaturesConfig.voiceEntry}
                  onChange={(v) => toggleAiFeature("voiceEntry", v)}
                />
                <Toggle
                  label="Auto-Categorization"
                  description="AI suggests category based on goal title"
                  value={aiFeaturesConfig.autoCategorization}
                  onChange={(v) => toggleAiFeature("autoCategorization", v)}
                />
                <Toggle
                  label="Daily AI Briefing"
                  description="Receive a morning summary and advice"
                  value={aiFeaturesConfig.dailyBriefing}
                  onChange={(v) => toggleAiFeature("dailyBriefing", v)}
                />
                <Toggle
                  label="Smart Rescheduling"
                  description="AI suggests whether to carry forward or break down failed goals"
                  value={aiFeaturesConfig.smartRescheduling}
                  onChange={(v) => toggleAiFeature("smartRescheduling", v)}
                />
                <Toggle
                  label="Auto-Reflection"
                  description="Generate a positive insight when completing a goal"
                  value={aiFeaturesConfig.autoReflection}
                  onChange={(v) => toggleAiFeature("autoReflection", v)}
                />
                <Toggle
                  label="AI Insights in Stats"
                  description="AI coach analyzes 30-day trends and gives actionable advice"
                  value={aiFeaturesConfig.aiInsights}
                  onChange={(v) => toggleAiFeature("aiInsights", v)}
                />
                <Toggle
                  label="Smart Template Generation"
                  description="Suggests creating a template when a goal is completed 3 times"
                  value={aiFeaturesConfig.smartTemplates}
                  onChange={(v) => toggleAiFeature("smartTemplates", v)}
                />
                <Toggle
                  label="Goal Decomposition"
                  description="Break down complex goals into smaller subtasks"
                  value={aiFeaturesConfig.goalDecomposition}
                  onChange={(v) => toggleAiFeature("goalDecomposition", v)}
                />
                <Toggle
                  label="Predictive Streak Alert"
                  description="Warns if there's a high chance of breaking your streak tomorrow"
                  value={aiFeaturesConfig.predictiveAlert}
                  onChange={(v) => toggleAiFeature("predictiveAlert", v)}
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === "customization" && (
          <div className="space-y-10 pb-20">
            <ConfigSection
              title="Goal Categories"
              description="Manage the categories you assign to your goals."
              items={customConfig.categories}
              onUpdate={(items) => updateCustomConfig({ categories: items })}
              renderItem={(item, onChange, onDelete) => (
                <div className="flex gap-2 w-full">
                  <input
                    value={item.name}
                    onChange={(e) => onChange({ ...item, name: e.target.value })}
                    className="flex-1 px-3 py-1 bg-transparent border border-border rounded text-sm outline-none focus:ring-1 focus:ring-primary"
                  />
                  <button onClick={onDelete} className="p-1 text-destructive hover:bg-destructive/10 rounded"><Trash2 size={14}/></button>
                </div>
              )}
              newItemFactory={() => ({ id: `cat-${Date.now()}`, name: "New Category", order: customConfig.categories.length + 1 })}
            />

            <ConfigSection
              title="Priority Levels"
              description="Customize priority labels and their associated colors."
              items={customConfig.priorities}
              onUpdate={(items) => updateCustomConfig({ priorities: items })}
              renderItem={(item, onChange, onDelete) => (
                <div className="flex gap-2 w-full">
                  <input
                    value={item.name}
                    onChange={(e) => onChange({ ...item, name: e.target.value })}
                    className="flex-1 px-3 py-1 bg-transparent border border-border rounded text-sm outline-none"
                  />
                  <select
                    value={item.color}
                    onChange={(e) => onChange({ ...item, color: e.target.value })}
                    className="px-2 py-1 bg-background border border-border rounded text-xs outline-none"
                  >
                    {["red", "orange", "yellow", "green", "blue", "indigo", "purple", "pink", "gray"].map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                  <button onClick={onDelete} className="p-1 text-destructive hover:bg-destructive/10 rounded"><Trash2 size={14}/></button>
                </div>
              )}
              newItemFactory={() => ({ id: `prio-${Date.now()}`, name: "New Priority", color: "blue", order: customConfig.priorities.length + 1 })}
            />

            <ConfigSection
              title="Custom Moods"
              description="Define the moods you can select for your daily log."
              items={customConfig.moods}
              onUpdate={(items) => updateCustomConfig({ moods: items })}
              renderItem={(item, onChange, onDelete) => (
                <div className="flex gap-2 w-full">
                  <input
                    value={item.name}
                    onChange={(e) => onChange({ ...item, name: e.target.value })}
                    className="flex-1 px-3 py-1 bg-transparent border border-border rounded text-sm outline-none"
                  />
                  <button onClick={onDelete} className="p-1 text-destructive hover:bg-destructive/10 rounded"><Trash2 size={14}/></button>
                </div>
              )}
              newItemFactory={() => ({ id: `mood-${Date.now()}`, name: "New Mood", order: customConfig.moods.length + 1 })}
            />

            <ConfigSection
              title="Energy Levels"
              description="Define the energy level options for your daily log."
              items={customConfig.energies}
              onUpdate={(items) => updateCustomConfig({ energies: items })}
              renderItem={(item, onChange, onDelete) => (
                <div className="flex gap-2 w-full">
                  <input
                    value={item.name}
                    onChange={(e) => onChange({ ...item, name: e.target.value })}
                    className="flex-1 px-3 py-1 bg-transparent border border-border rounded text-sm outline-none"
                  />
                  <button onClick={onDelete} className="p-1 text-destructive hover:bg-destructive/10 rounded"><Trash2 size={14}/></button>
                </div>
              )}
              newItemFactory={() => ({ id: `energy-${Date.now()}`, name: "New Energy", order: customConfig.energies.length + 1 })}
            />

            <ConfigSection
              title="Goal Board Stages"
              description="Define columns for your Kanban Goal Board."
              items={customConfig.boardStages}
              onUpdate={(items) => updateCustomConfig({ boardStages: items })}
              renderItem={(item, onChange, onDelete) => (
                <div className="flex gap-2 w-full">
                  <input
                    value={item.name}
                    onChange={(e) => onChange({ ...item, name: e.target.value })}
                    className="flex-1 px-3 py-1 bg-transparent border border-border rounded text-sm outline-none"
                  />
                  <button onClick={onDelete} className="p-1 text-destructive hover:bg-destructive/10 rounded"><Trash2 size={14}/></button>
                </div>
              )}
              newItemFactory={() => {
                const name = "New Stage";
                return { id: name.toLowerCase().replace(/\s+/g, '-'), name, order: customConfig.boardStages.length + 1 };
              }}
            />

            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-bold">Persona Templates</h3>
                <p className="text-sm text-muted-foreground">Manage quick-start templates for different user personas.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {customConfig.personaTemplates.map(t => (
                  <div key={t.id} className="p-4 border border-border rounded-xl bg-card space-y-3 relative group">
                    <div className="flex justify-between items-start">
                      <input
                        value={t.name}
                        onChange={(e) => {
                          const newList = customConfig.personaTemplates.map(x => x.id === t.id ? { ...x, name: e.target.value } : x);
                          updateCustomConfig({ personaTemplates: newList });
                        }}
                        className="font-bold bg-transparent border-none outline-none focus:ring-0 p-0 text-foreground"
                      />
                      <button 
                        onClick={() => {
                          const newList = customConfig.personaTemplates.filter(x => x.id !== t.id);
                          updateCustomConfig({ personaTemplates: newList });
                        }}
                        className="p-1.5 text-destructive hover:bg-destructive/10 rounded-md opacity-0 group-hover:opacity-100 transition"
                      >
                        <Trash2 size={14}/>
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold text-muted-foreground">Category</label>
                        <select
                          value={t.defaultCategoryId}
                          onChange={(e) => {
                            const newList = customConfig.personaTemplates.map(x => x.id === t.id ? { ...x, defaultCategoryId: e.target.value } : x);
                            updateCustomConfig({ personaTemplates: newList });
                          }}
                          className="w-full px-2 py-1 bg-background border border-border rounded text-[10px] outline-none"
                        >
                          <option value="">None</option>
                          {customConfig.categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold text-muted-foreground">Priority</label>
                        <select
                          value={t.defaultPriorityId}
                          onChange={(e) => {
                            const newList = customConfig.personaTemplates.map(x => x.id === t.id ? { ...x, defaultPriorityId: e.target.value } : x);
                            updateCustomConfig({ personaTemplates: newList });
                          }}
                          className="w-full px-2 py-1 bg-background border border-border rounded text-[10px] outline-none"
                        >
                          <option value="">None</option>
                          {customConfig.priorities.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-muted-foreground">Sample Title</label>
                      <input
                        value={t.sampleGoalTitle}
                        onChange={(e) => {
                          const newList = customConfig.personaTemplates.map(x => x.id === t.id ? { ...x, sampleGoalTitle: e.target.value } : x);
                          updateCustomConfig({ personaTemplates: newList });
                        }}
                        placeholder="e.g. Write 500 words"
                        className="w-full px-2 py-1 bg-background border border-border rounded text-xs outline-none"
                      />
                    </div>
                  </div>
                ))}
                <button
                  onClick={() => {
                    const newItem = { id: `persona-${Date.now()}`, name: "New Persona", defaultCategoryId: "", defaultPriorityId: "", sampleGoalTitle: "" };
                    updateCustomConfig({ personaTemplates: [...customConfig.personaTemplates, newItem] });
                  }}
                  className="w-full py-6 border-2 border-dashed border-border rounded-xl text-sm font-medium text-muted-foreground hover:bg-accent transition flex items-center justify-center gap-2"
                >
                  <Plus size={16}/> Add Persona Template
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-sm font-medium text-foreground block mb-1.5">{label}</label>
      {children}
    </div>
  );
}

function Toggle({ label, description, value, onChange }: {
  label: string; description: string; value: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 p-3 border border-border rounded-lg bg-card">
      <div>
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
      </div>
      <button
        onClick={() => onChange(!value)}
        className={`relative w-10 h-6 rounded-full transition-colors shrink-0 ${value ? "bg-primary" : "bg-muted"}`}
      >
        <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${value ? "translate-x-4" : ""}`} />
      </button>
    </div>
  );
}

function ConfigSection<T extends { id: string; order: number }>({
  title, description, items, onUpdate, renderItem, newItemFactory
}: {
  title: string; description: string; items: T[]; onUpdate: (items: T[]) => void;
  renderItem: (item: T, onChange: (item: T) => void, onDelete: () => void) => React.ReactNode;
  newItemFactory: () => T;
}) {
  const sortedItems = [...items].sort((a, b) => a.order - b.order);

  const move = (id: string, direction: 'up' | 'down') => {
    const idx = sortedItems.findIndex(x => x.id === id);
    if (direction === 'up' && idx > 0) {
      const newItems = [...sortedItems];
      const temp = newItems[idx].order;
      newItems[idx].order = newItems[idx-1].order;
      newItems[idx-1].order = temp;
      onUpdate(newItems);
    } else if (direction === 'down' && idx < sortedItems.length - 1) {
      const newItems = [...sortedItems];
      const temp = newItems[idx].order;
      newItems[idx].order = newItems[idx+1].order;
      newItems[idx+1].order = temp;
      onUpdate(newItems);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-bold">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <div className="space-y-2">
        {sortedItems.map((item, idx) => (
          <div key={item.id} className="flex items-center gap-2 group">
            <div className="flex flex-col gap-0.5 opacity-0 group-hover:opacity-100 transition">
              <button onClick={() => move(item.id, 'up')} disabled={idx === 0} className="p-0.5 hover:bg-accent rounded disabled:opacity-30"><ChevronUp size={12}/></button>
              <button onClick={() => move(item.id, 'down')} disabled={idx === sortedItems.length - 1} className="p-0.5 hover:bg-accent rounded disabled:opacity-30"><ChevronDown size={12}/></button>
            </div>
            {renderItem(
              item,
              (updated) => onUpdate(items.map(x => x.id === item.id ? updated : x)),
              () => onUpdate(items.filter(x => x.id !== item.id))
            )}
          </div>
        ))}
        <button
          onClick={() => onUpdate([...items, newItemFactory()])}
          className="flex items-center gap-2 text-xs text-primary font-bold hover:underline pl-6"
        >
          <Plus size={14}/> Add New
        </button>
      </div>
    </div>
  );
}
