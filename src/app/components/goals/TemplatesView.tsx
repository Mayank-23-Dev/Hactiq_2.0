import React, { useState } from "react";
import { Layout } from "../Layout";
import { useApp, Priority, GoalTemplate } from "../../store";
import { Plus, Trash2, Edit2, X } from "lucide-react";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PriorityBadge } from "./Shared";

export function TemplatesView() {
  const { templates, addTemplate, deleteTemplate, customConfig } = useApp();
  const [showAddModal, setShowAddModal] = useState(false);
  
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<GoalTemplate["category"]>("Work");
  const [priority, setPriority] = useState<Priority>("medium");
  const [notes, setNotes] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addTemplate({ title, category, priority, notes });
    setShowAddModal(false);
    setTitle("");
    setNotes("");
    toast.success("Template created!");
  };

  return (
    <Layout title="Goal Templates">
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-extrabold text-foreground">Goal Templates</h1>
          <button 
            onClick={() => setShowAddModal(true)}
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-2 px-4 rounded-lg transition flex items-center gap-2"
          >
            <Plus size={20} /> New Template
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.length === 0 ? (
            <div className="col-span-full text-center py-20 text-muted-foreground italic">No templates created.</div>
          ) : (
            templates.map(t => (
              <div key={t.id} className="bg-card p-6 rounded-xl shadow-sm border border-border group relative">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-bold text-lg text-foreground">{t.title}</h3>
                  <button 
                    onClick={() => deleteTemplate(t.id)}
                    className="p-2 text-destructive hover:bg-destructive/10 rounded-lg opacity-0 group-hover:opacity-100 transition"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <PriorityBadge priorityId={t.priority} customConfig={customConfig} />
                  <span className="text-xs text-muted-foreground">{t.category}</span>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">{t.notes || "No notes"}</p>
              </div>
            ))
          )}
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
          <div className="bg-card rounded-xl shadow-2xl max-w-lg w-full p-6 border border-border">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">New Template</h2>
              <button onClick={() => setShowAddModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input 
                  type="text" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required 
                  className="w-full px-3 py-2 bg-background border border-input rounded-lg outline-none" 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Category</label>
                  <Select value={category} onValueChange={(val: any) => setCategory(val)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Health">Health</SelectItem>
                      <SelectItem value="Work">Work</SelectItem>
                      <SelectItem value="Personal">Personal</SelectItem>
                      <SelectItem value="Learning">Learning</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Priority</label>
                  <Select value={priority} onValueChange={(val: any) => setPriority(val)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Default Notes</label>
                <textarea 
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3} 
                  className="w-full px-3 py-2 bg-background border border-input rounded-lg outline-none"
                />
              </div>
              <button type="submit" className="w-full bg-primary text-primary-foreground font-bold py-2 rounded-lg transition">Create Template</button>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}
