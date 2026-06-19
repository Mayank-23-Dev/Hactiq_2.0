// src/app/components/settings/CustomizationTab.tsx
import React from "react";
import { useApp } from "../../store";
import { Label } from "@/app/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/app/components/ui/select";
import { Plus, Trash2, ChevronUp, ChevronDown, Sliders } from "lucide-react";

interface ConfigItem {
  id: string;
  name: string;
  order: number;
}

export function CustomizationTab() {
  const { customConfig, updateCustomConfig } = useApp();

  return (
    <div className="bg-card border border-border rounded-xl p-8 shadow-sm space-y-10 relative overflow-hidden">
      <div className="flex flex-col gap-2 border-b border-border/40 pb-6">
        <h2 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <Sliders className="text-primary w-6 h-6" /> Customization Settings
        </h2>
        <p className="text-sm text-muted-foreground">
          Configure categories, priorities, moods, energy levels, stages, and template personas.
        </p>
      </div>

      <div className="space-y-10">
        <ConfigSection
          title="Goal Categories"
          description="Manage the categories you assign to your goals."
          items={customConfig.categories}
          onUpdate={(items) => updateCustomConfig({ categories: items })}
          renderItem={(item, onChange, onDelete) => (
            <div className="flex gap-3 w-full items-center">
              <input
                value={item.name}
                onChange={(e) => onChange({ ...item, name: e.target.value })}
                className="flex-grow h-10 px-3 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              />
              <button onClick={onDelete} className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors shrink-0 cursor-pointer">
                <Trash2 size={16} />
              </button>
            </div>
          )}
          newItemFactory={() => ({
            id: `cat-${Date.now()}`,
            name: "New Category",
            order: customConfig.categories.length + 1,
          })}
        />

        <ConfigSection
          title="Priority Levels"
          description="Customize priority labels and their associated colors."
          items={customConfig.priorities}
          onUpdate={(items) => updateCustomConfig({ priorities: items })}
          renderItem={(item, onChange, onDelete) => (
            <div className="flex gap-3 w-full items-center">
              <input
                value={item.name}
                onChange={(e) => onChange({ ...item, name: e.target.value })}
                className="flex-grow h-10 px-3 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              />
              <select
                value={item.color}
                onChange={(e) => onChange({ ...item, color: e.target.value })}
                className="w-32 h-10 px-2 bg-input-background border border-border rounded-lg text-sm text-foreground outline-none focus:border-primary transition-all"
              >
                {["red", "orange", "yellow", "green", "blue", "indigo", "purple", "pink", "gray"].map((c) => (
                  <option key={c} value={c} className="bg-card text-foreground">
                    {c.charAt(0).toUpperCase() + c.slice(1)}
                  </option>
                ))}
              </select>
              <button onClick={onDelete} className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors shrink-0 cursor-pointer">
                <Trash2 size={16} />
              </button>
            </div>
          )}
          newItemFactory={() => ({
            id: `prio-${Date.now()}`,
            name: "New Priority",
            color: "blue",
            order: customConfig.priorities.length + 1,
          })}
        />

        <ConfigSection
          title="Custom Moods"
          description="Define the moods you can select for your daily log."
          items={customConfig.moods}
          onUpdate={(items) => updateCustomConfig({ moods: items })}
          renderItem={(item, onChange, onDelete) => (
            <div className="flex gap-3 w-full items-center">
              <input
                value={item.name}
                onChange={(e) => onChange({ ...item, name: e.target.value })}
                className="flex-grow h-10 px-3 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              />
              <button onClick={onDelete} className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors shrink-0 cursor-pointer">
                <Trash2 size={16} />
              </button>
            </div>
          )}
          newItemFactory={() => ({
            id: `mood-${Date.now()}`,
            name: "New Mood",
            order: customConfig.moods.length + 1,
          })}
        />

        <ConfigSection
          title="Energy Levels"
          description="Define the energy level options for your daily log."
          items={customConfig.energies}
          onUpdate={(items) => updateCustomConfig({ energies: items })}
          renderItem={(item, onChange, onDelete) => (
            <div className="flex gap-3 w-full items-center">
              <input
                value={item.name}
                onChange={(e) => onChange({ ...item, name: e.target.value })}
                className="flex-grow h-10 px-3 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              />
              <button onClick={onDelete} className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors shrink-0 cursor-pointer">
                <Trash2 size={16} />
              </button>
            </div>
          )}
          newItemFactory={() => ({
            id: `energy-${Date.now()}`,
            name: "New Energy",
            order: customConfig.energies.length + 1,
          })}
        />

        <ConfigSection
          title="Goal Board Stages"
          description="Define columns for your Kanban Goal Board."
          items={customConfig.boardStages}
          onUpdate={(items) => updateCustomConfig({ boardStages: items })}
          renderItem={(item, onChange, onDelete) => (
            <div className="flex gap-3 w-full items-center">
              <input
                value={item.name}
                onChange={(e) => onChange({ ...item, name: e.target.value })}
                className="flex-grow h-10 px-3 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              />
              <button onClick={onDelete} className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors shrink-0 cursor-pointer">
                <Trash2 size={16} />
              </button>
            </div>
          )}
          newItemFactory={() => {
            const name = "New Stage";
            return {
              id: name.toLowerCase().replace(/\s+/g, "-"),
              name,
              order: customConfig.boardStages.length + 1,
            };
          }}
        />

        <div className="space-y-4 pt-8 border-t border-border">
          <div>
            <h3 className="text-lg font-bold text-foreground">Persona Templates</h3>
            <p className="text-sm text-muted-foreground">
              Manage quick-start templates for different user personas.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {customConfig.personaTemplates.map((t) => (
              <div key={t.id} className="p-5 border border-border rounded-xl bg-input-background space-y-3.5 relative group">
                <div className="flex justify-between items-start">
                  <input
                    value={t.name}
                    onChange={(e) => {
                      const newList = customConfig.personaTemplates.map((x) =>
                        x.id === t.id ? { ...x, name: e.target.value } : x
                      );
                      updateCustomConfig({ personaTemplates: newList });
                    }}
                    className="font-bold bg-transparent border-none outline-none focus:ring-0 p-0 text-foreground text-base"
                  />
                  <button
                    onClick={() => {
                      const newList = customConfig.personaTemplates.filter((x) => x.id !== t.id);
                      updateCustomConfig({ personaTemplates: newList });
                    }}
                    className="h-8 w-8 flex items-center justify-center text-destructive hover:bg-destructive/10 rounded-lg opacity-0 group-hover:opacity-100 transition cursor-pointer"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-[10px] uppercase font-bold text-muted-foreground">Category</Label>
                    <Select
                      value={t.defaultCategoryId || "none"}
                      onValueChange={(val) => {
                        const newList = customConfig.personaTemplates.map((x) =>
                          x.id === t.id ? { ...x, defaultCategoryId: val === "none" ? "" : val } : x
                        );
                        updateCustomConfig({ personaTemplates: newList });
                      }}
                    >
                      <SelectTrigger className="w-full h-8 text-[10px] px-2 bg-background border-border rounded text-foreground focus:border-primary">
                        <SelectValue placeholder="None" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {customConfig.categories.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] uppercase font-bold text-muted-foreground">Priority</Label>
                    <Select
                      value={t.defaultPriorityId || "none"}
                      onValueChange={(val) => {
                        const newList = customConfig.personaTemplates.map((x) =>
                          x.id === t.id ? { ...x, defaultPriorityId: val === "none" ? "" : val } : x
                        );
                        updateCustomConfig({ personaTemplates: newList });
                      }}
                    >
                      <SelectTrigger className="w-full h-8 text-[10px] px-2 bg-background border-border rounded text-foreground focus:border-primary">
                        <SelectValue placeholder="None" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {customConfig.priorities.map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] uppercase font-bold text-muted-foreground">Sample Title</Label>
                  <input
                    value={t.sampleGoalTitle}
                    onChange={(e) => {
                      const newList = customConfig.personaTemplates.map((x) =>
                        x.id === t.id ? { ...x, sampleGoalTitle: e.target.value } : x
                      );
                      updateCustomConfig({ personaTemplates: newList });
                    }}
                    placeholder="e.g. Write 500 words"
                    className="w-full h-8 px-3.5 bg-background border border-border rounded text-xs text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  />
                </div>
              </div>
            ))}
            <button
              onClick={() => {
                const newItem = {
                  id: `persona-${Date.now()}`,
                  name: "New Persona",
                  defaultCategoryId: "",
                  defaultPriorityId: "",
                  sampleGoalTitle: "",
                };
                updateCustomConfig({ personaTemplates: [...customConfig.personaTemplates, newItem] });
              }}
              className="h-full border border-dashed border-border py-8 text-muted-foreground flex flex-col items-center justify-center gap-2 hover:bg-input-background hover:text-foreground rounded-xl transition duration-150 cursor-pointer"
            >
              <Plus size={20} />
              <span className="text-xs font-semibold">Add Persona Template</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ConfigSection<T extends { id: string; order: number }>({
  title,
  description,
  items,
  onUpdate,
  renderItem,
  newItemFactory,
}: {
  title: string;
  description: string;
  items: T[];
  onUpdate: (items: T[]) => void;
  renderItem: (item: T, onChange: (item: T) => void, onDelete: () => void) => React.ReactNode;
  newItemFactory: () => T;
}) {
  const sortedItems = [...items].sort((a, b) => a.order - b.order);

  const move = (id: string, direction: "up" | "down") => {
    const idx = sortedItems.findIndex((x) => x.id === id);
    if (direction === "up" && idx > 0) {
      const newItems = [...sortedItems];
      const temp = newItems[idx].order;
      newItems[idx].order = newItems[idx - 1].order;
      newItems[idx - 1].order = temp;
      onUpdate(newItems);
    } else if (direction === "down" && idx < sortedItems.length - 1) {
      const newItems = [...sortedItems];
      const temp = newItems[idx].order;
      newItems[idx].order = newItems[idx + 1].order;
      newItems[idx + 1].order = temp;
      onUpdate(newItems);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h4 className="text-base font-semibold text-foreground">{title}</h4>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <div className="space-y-3">
        {sortedItems.map((item, idx) => (
          <div key={item.id} className="flex items-center gap-2 group">
            <div className="flex flex-col gap-0.5 opacity-0 group-hover:opacity-100 transition shrink-0">
              <button
                onClick={() => move(item.id, "up")}
                disabled={idx === 0}
                className="h-6 w-6 p-0 flex items-center justify-center hover:bg-input-background text-gray-400 disabled:opacity-30 rounded cursor-pointer"
              >
                <ChevronUp size={14} />
              </button>
              <button
                onClick={() => move(item.id, "down")}
                disabled={idx === sortedItems.length - 1}
                className="h-6 w-6 p-0 flex items-center justify-center hover:bg-input-background text-gray-400 disabled:opacity-30 rounded cursor-pointer"
              >
                <ChevronDown size={14} />
              </button>
            </div>
            {renderItem(
              item,
              (updated) => onUpdate(items.map((x) => (x.id === item.id ? updated : x))),
              () => onUpdate(items.filter((x) => x.id !== item.id))
            )}
          </div>
        ))}
        <button
          onClick={() => onUpdate([...items, newItemFactory()])}
          className="flex items-center gap-1 text-xs text-primary font-bold hover:underline pl-8 h-auto py-1.5 cursor-pointer"
        >
          <Plus size={14} /> Add New
        </button>
      </div>
    </div>
  );
}
