// src/app/components/settings/CustomizationTab.tsx
import React from "react";
import { useApp } from "../../store";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Label } from "@/app/components/ui/label";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select";
import { Plus, Trash2, ChevronUp, ChevronDown } from "lucide-react";

interface ConfigItem {
  id: string;
  name: string;
  order: number;
}

export function CustomizationTab() {
  const { customConfig, updateCustomConfig } = useApp();

  return (
    <Card className="border border-border bg-card">
      <CardHeader>
        <CardTitle className="text-xl font-bold tracking-tight">Customization Settings</CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          Configure categories, priorities, moods, energy levels, stages, and template personas.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-10 pb-8">
        <ConfigSection
          title="Goal Categories"
          description="Manage the categories you assign to your goals."
          items={customConfig.categories}
          onUpdate={(items) => updateCustomConfig({ categories: items })}
          renderItem={(item, onChange, onDelete) => (
            <div className="flex gap-2 w-full items-center">
              <Input
                value={item.name}
                onChange={(e) => onChange({ ...item, name: e.target.value })}
                className="flex-grow"
              />
              <Button onClick={onDelete} variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10 shrink-0">
                <Trash2 size={16} />
              </Button>
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
            <div className="flex gap-2 w-full items-center">
              <Input
                value={item.name}
                onChange={(e) => onChange({ ...item, name: e.target.value })}
                className="flex-grow"
              />
              <Select
                value={item.color}
                onValueChange={(val) => onChange({ ...item, color: val })}
              >
                <SelectTrigger className="w-32 shrink-0">
                  <SelectValue placeholder="Color" />
                </SelectTrigger>
                <SelectContent>
                  {["red", "orange", "yellow", "green", "blue", "indigo", "purple", "pink", "gray"].map((c) => (
                    <SelectItem key={c} value={c}>
                      <span className="capitalize">{c}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={onDelete} variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10 shrink-0">
                <Trash2 size={16} />
              </Button>
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
            <div className="flex gap-2 w-full items-center">
              <Input
                value={item.name}
                onChange={(e) => onChange({ ...item, name: e.target.value })}
                className="flex-grow"
              />
              <Button onClick={onDelete} variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10 shrink-0">
                <Trash2 size={16} />
              </Button>
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
            <div className="flex gap-2 w-full items-center">
              <Input
                value={item.name}
                onChange={(e) => onChange({ ...item, name: e.target.value })}
                className="flex-grow"
              />
              <Button onClick={onDelete} variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10 shrink-0">
                <Trash2 size={16} />
              </Button>
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
            <div className="flex gap-2 w-full items-center">
              <Input
                value={item.name}
                onChange={(e) => onChange({ ...item, name: e.target.value })}
                className="flex-grow"
              />
              <Button onClick={onDelete} variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10 shrink-0">
                <Trash2 size={16} />
              </Button>
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

        <div className="space-y-4 pt-4 border-t border-border">
          <div>
            <h3 className="text-lg font-bold text-foreground">Persona Templates</h3>
            <p className="text-sm text-muted-foreground">
              Manage quick-start templates for different user personas.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {customConfig.personaTemplates.map((t) => (
              <div key={t.id} className="p-4 border border-border rounded-xl bg-accent/10 space-y-3 relative group">
                <div className="flex justify-between items-start">
                  <input
                    value={t.name}
                    onChange={(e) => {
                      const newList = customConfig.personaTemplates.map((x) =>
                        x.id === t.id ? { ...x, name: e.target.value } : x
                      );
                      updateCustomConfig({ personaTemplates: newList });
                    }}
                    className="font-bold bg-transparent border-none outline-none focus:ring-0 p-0 text-foreground"
                  />
                  <Button
                    onClick={() => {
                      const newList = customConfig.personaTemplates.filter((x) => x.id !== t.id);
                      updateCustomConfig({ personaTemplates: newList });
                    }}
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition"
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-[10px] uppercase font-bold text-muted-foreground">Category</Label>
                    <select
                      value={t.defaultCategoryId}
                      onChange={(e) => {
                        const newList = customConfig.personaTemplates.map((x) =>
                          x.id === t.id ? { ...x, defaultCategoryId: e.target.value } : x
                        );
                        updateCustomConfig({ personaTemplates: newList });
                      }}
                      className="w-full px-2 py-1 bg-background border border-border rounded text-[10px] outline-none text-foreground"
                    >
                      <option value="" className="bg-background text-foreground">None</option>
                      {customConfig.categories.map((c) => (
                        <option key={c.id} value={c.id} className="bg-background text-foreground">
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] uppercase font-bold text-muted-foreground">Priority</Label>
                    <select
                      value={t.defaultPriorityId}
                      onChange={(e) => {
                        const newList = customConfig.personaTemplates.map((x) =>
                          x.id === t.id ? { ...x, defaultPriorityId: e.target.value } : x
                        );
                        updateCustomConfig({ personaTemplates: newList });
                      }}
                      className="w-full px-2 py-1 bg-background border border-border rounded text-[10px] outline-none text-foreground"
                    >
                      <option value="" className="bg-background text-foreground">None</option>
                      {customConfig.priorities.map((p) => (
                        <option key={p.id} value={p.id} className="bg-background text-foreground">
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] uppercase font-bold text-muted-foreground">Sample Title</Label>
                  <Input
                    value={t.sampleGoalTitle}
                    onChange={(e) => {
                      const newList = customConfig.personaTemplates.map((x) =>
                        x.id === t.id ? { ...x, sampleGoalTitle: e.target.value } : x
                      );
                      updateCustomConfig({ personaTemplates: newList });
                    }}
                    placeholder="e.g. Write 500 words"
                    className="h-8 text-xs"
                  />
                </div>
              </div>
            ))}
            <Button
              variant="outline"
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
              className="h-full border-2 border-dashed border-border py-8 text-muted-foreground flex flex-col justify-center gap-2 hover:bg-accent/50"
            >
              <Plus size={20} />
              Add Persona Template
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
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
      <div className="space-y-2">
        {sortedItems.map((item, idx) => (
          <div key={item.id} className="flex items-center gap-2 group">
            <div className="flex flex-col gap-0.5 opacity-0 group-hover:opacity-100 transition shrink-0">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => move(item.id, "up")}
                disabled={idx === 0}
                className="h-6 w-6 p-0 hover:bg-accent disabled:opacity-30"
              >
                <ChevronUp size={14} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => move(item.id, "down")}
                disabled={idx === sortedItems.length - 1}
                className="h-6 w-6 p-0 hover:bg-accent disabled:opacity-30"
              >
                <ChevronDown size={14} />
              </Button>
            </div>
            {renderItem(
              item,
              (updated) => onUpdate(items.map((x) => (x.id === item.id ? updated : x))),
              () => onUpdate(items.filter((x) => x.id !== item.id))
            )}
          </div>
        ))}
        <Button
          variant="link"
          onClick={() => onUpdate([...items, newItemFactory()])}
          className="flex items-center gap-1 text-xs text-primary font-bold hover:underline pl-8 h-auto py-1"
        >
          <Plus size={14} /> Add New
        </Button>
      </div>
    </div>
  );
}
