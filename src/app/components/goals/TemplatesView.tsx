import React, { useState } from "react";
import { createPortal } from "react-dom";
import { Layout } from "../Layout";
import { useApp, Priority, GoalTemplate } from "../../store";
import { Plus, Trash2, X, Search, ChevronDown, ChevronUp, CheckSquare, Square, Pencil } from "lucide-react";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PriorityBadge } from "./Shared";
import { format } from "date-fns";

export function TemplatesView() {
  const { templates, addTemplate, updateTemplate, deleteTemplate, addGoal, customConfig } = useApp();
  
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Modal form states
  const [templateName, setTemplateName] = useState("");
  const [templateDesc, setTemplateDesc] = useState("");
  const [modalItems, setModalItems] = useState<{ id?: string; title: string; category: string; priority: Priority; notes: string }[]>([
    { title: "", category: "Work", priority: "medium", notes: "" }
  ]);

  // Page filter states
  const [searchQuery, setSearchQuery] = useState("");
  
  // Card expansion and item selection states
  const [expandedTemplates, setExpandedTemplates] = useState<Record<string, boolean>>({});
  const [selectedItems, setSelectedItems] = useState<Record<string, boolean>>({});

  const handleOpenAddModal = () => {
    setEditingId(null);
    setTemplateName("");
    setTemplateDesc("");
    setModalItems([{ title: "", category: "Work", priority: "medium", notes: "" }]);
    setShowModal(true);
  };

  const handleOpenEditModal = (template: GoalTemplate) => {
    setEditingId(template.id);
    setTemplateName(template.name);
    setTemplateDesc(template.description || "");
    setModalItems((template.items || []).map(item => ({
      id: item.id,
      title: item.title,
      category: item.category as any,
      priority: item.priority as Priority,
      notes: item.notes
    })));
    setShowModal(true);
  };

  const addGoalRow = () => {
    setModalItems(prev => [...prev, { title: "", category: "Work", priority: "medium", notes: "" }]);
  };

  const removeGoalRow = (index: number) => {
    setModalItems(prev => prev.filter((_, i) => i !== index));
  };

  const updateGoalRow = (index: number, field: string, value: any) => {
    setModalItems(prev => prev.map((item, i) => i === index ? { ...item, [field]: value } : item));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!templateName.trim()) {
      toast.error("Template name is required");
      return;
    }

    const validItems = modalItems.filter(item => item.title.trim());
    if (validItems.length === 0) {
      toast.error("At least one goal with a title is required");
      return;
    }

    if (editingId) {
      updateTemplate(editingId, templateName, templateDesc, validItems);
      toast.success("Template updated!");
    } else {
      addTemplate(templateName, templateDesc, validItems);
      toast.success("Template created!");
    }

    setShowModal(false);
  };

  const toggleTemplateExpand = (id: string) => {
    setExpandedTemplates(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleItemSelection = (itemId: string) => {
    setSelectedItems(prev => ({ ...prev, [itemId]: prev[itemId] === false ? true : false }));
  };

  const isItemSelected = (itemId: string) => {
    return selectedItems[itemId] !== false; // checked by default
  };

  const handleAddSelectedToToday = (template: GoalTemplate) => {
    const todayStr = format(new Date(), "yyyy-MM-dd");
    const itemsToAdd = (template.items || []).filter(item => isItemSelected(item.id));
    
    if (itemsToAdd.length === 0) {
      toast.error("Select at least one goal to add");
      return;
    }

    itemsToAdd.forEach(item => {
      addGoal({
        title: item.title,
        category: item.category,
        priority: item.priority,
        notes: item.notes,
        completed: false,
        date: todayStr,
        status: "todo"
      });
    });

    toast.success(`Successfully added ${itemsToAdd.length} goal(s) to Today`);
  };

  // Filter templates
  const filteredTemplates = templates.filter(t => {
    const query = searchQuery.toLowerCase();
    const nameMatch = t.name.toLowerCase().includes(query);
    const descMatch = (t.description || "").toLowerCase().includes(query);
    const itemMatch = (t.items || []).some(item => 
      item.title.toLowerCase().includes(query) || 
      item.notes.toLowerCase().includes(query)
    );
    return nameMatch || descMatch || itemMatch;
  });

  return (
    <Layout title="Goal Templates">
      <div className="p-6 max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-foreground">Goal Templates</h1>
            <p className="text-sm text-muted-foreground mt-1">Create routines or focus lists to quickly add multiple tasks to your day.</p>
          </div>
          <button 
            onClick={handleOpenAddModal}
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-2.5 px-4 rounded-lg transition flex items-center gap-2 cursor-pointer shrink-0"
          >
            <Plus size={20} /> New Template
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-md w-full">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search templates or template goals..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm bg-card border border-border rounded-lg outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all text-foreground"
          />
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.length === 0 ? (
            <div className="col-span-full text-center py-20 text-muted-foreground bg-card rounded-xl border border-dashed border-border">
              <p className="italic">No templates found. Click "New Template" to start.</p>
            </div>
          ) : (
            filteredTemplates.map(t => {
              const isExpanded = !!expandedTemplates[t.id];
              const goalCount = (t.items || []).length;
              
              return (
                <div 
                  key={t.id} 
                  className={`bg-card rounded-xl shadow-sm border border-border overflow-hidden transition-all flex flex-col justify-between ${
                    isExpanded ? "ring-1 ring-primary/20" : ""
                  }`}
                >
                  <div className="p-6 space-y-4">
                    {/* Header */}
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <h3 className="font-extrabold text-lg text-foreground leading-snug">{t.name}</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">{goalCount} {goalCount === 1 ? "goal" : "goals"}</p>
                      </div>
                      
                      {/* Action buttons */}
                      <div className="flex items-center gap-1">
                        <button 
                          onClick={() => handleOpenEditModal(t)}
                          className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition cursor-pointer"
                          title="Edit template"
                        >
                          <Pencil size={15} />
                        </button>
                        <button 
                          onClick={() => {
                            if (confirm("Delete this template? This cannot be undone.")) {
                              deleteTemplate(t.id);
                              toast.success("Template deleted");
                            }
                          }}
                          className="p-1.5 text-destructive hover:bg-destructive/10 rounded-lg transition cursor-pointer"
                          title="Delete template"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>

                    {/* Description */}
                    {t.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {t.description}
                      </p>
                    )}

                    {/* Expand/Collapse Toggle */}
                    <button
                      onClick={() => toggleTemplateExpand(t.id)}
                      className="w-full flex items-center justify-between py-2 text-xs font-semibold border-t border-border/60 text-muted-foreground hover:text-foreground transition cursor-pointer"
                    >
                      <span>{isExpanded ? "Hide Goals" : "View Goals"}</span>
                      {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>

                    {/* Goals List (Collapsible) */}
                    {isExpanded && (
                      <div className="space-y-3 pt-2 max-h-60 overflow-y-auto">
                        {(t.items || []).map(item => {
                          const isChecked = isItemSelected(item.id);
                          return (
                            <div 
                              key={item.id} 
                              onClick={() => toggleItemSelection(item.id)}
                              className="flex items-start gap-3 p-2 bg-muted/40 hover:bg-muted/80 rounded-lg border border-border/40 transition cursor-pointer"
                            >
                              <div className="mt-0.5 text-muted-foreground hover:text-foreground">
                                {isChecked ? (
                                  <CheckSquare size={16} className="text-primary fill-primary/10" />
                                ) : (
                                  <Square size={16} />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className={`text-xs font-semibold text-foreground ${!isChecked ? "line-through opacity-50" : ""}`}>
                                  {item.title}
                                </p>
                                <div className="flex gap-2 items-center mt-1 flex-wrap">
                                  <PriorityBadge priorityId={item.priority as any} customConfig={customConfig} />
                                  <span className="text-[9px] px-1 bg-background text-muted-foreground rounded uppercase font-semibold border border-border/80">
                                    {item.category}
                                  </span>
                                </div>
                                {item.notes && (
                                  <p className="text-[10px] text-muted-foreground italic mt-0.5 line-clamp-1">{item.notes}</p>
                                )}
                              </div>
                            </div>
                          );
                        })}

                        {/* Add to Today Button */}
                        <button
                          onClick={() => handleAddSelectedToToday(t)}
                          className="w-full mt-3 bg-primary text-primary-foreground text-xs font-bold py-2 rounded-lg transition hover:bg-primary/95 cursor-pointer"
                        >
                          Add Selected to Today
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Multi-Goal Template Form Modal */}
      {showModal && createPortal(
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
          <div className="bg-card rounded-xl shadow-2xl max-w-2xl w-full p-6 border border-border flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center mb-4 shrink-0">
              <h2 className="text-2xl font-bold">{editingId ? "Edit Template" : "New Template"}</h2>
              <button 
                onClick={() => setShowModal(false)} 
                className="cursor-pointer hover:opacity-75"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6 overflow-y-auto pr-1 flex-1">
              {/* Template Basic Info */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Template Name</label>
                  <input 
                    type="text" 
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value)}
                    required 
                    className="w-full px-3 py-2 bg-background border border-input rounded-lg outline-none text-foreground" 
                    placeholder="e.g. Morning Routine, Project Kickoff"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Description (Optional)</label>
                  <textarea 
                    value={templateDesc}
                    onChange={(e) => setTemplateDesc(e.target.value)}
                    rows={2} 
                    className="w-full px-3 py-2 bg-background border border-input rounded-lg outline-none text-foreground resize-none"
                    placeholder="e.g. Actions to complete every Monday morning..."
                  />
                </div>
              </div>

              {/* Dynamic Goal Rows */}
              <div className="space-y-4 border-t border-border pt-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Template Goals ({modalItems.length})</h3>
                  <button
                    type="button"
                    onClick={addGoalRow}
                    className="text-xs text-primary bg-primary/10 border border-primary/20 font-bold px-3 py-1.5 rounded-lg transition hover:bg-primary/20 flex items-center gap-1 cursor-pointer"
                  >
                    <Plus size={14} /> Add Goal
                  </button>
                </div>

                <div className="space-y-4">
                  {modalItems.map((item, index) => (
                    <div 
                      key={index} 
                      className="p-4 bg-muted/30 border border-border rounded-xl space-y-3 relative group"
                    >
                      <div className="flex justify-between items-center gap-4">
                        <span className="text-xs font-bold text-muted-foreground">Goal #{index + 1}</span>
                        {modalItems.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeGoalRow(index)}
                            className="text-destructive hover:bg-destructive/10 p-1 rounded-lg transition cursor-pointer"
                            title="Remove goal"
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>

                      <div className="space-y-3">
                        <div>
                          <label className="block text-[10px] uppercase font-bold text-muted-foreground mb-1">Goal Title</label>
                          <input
                            type="text"
                            value={item.title}
                            onChange={(e) => updateGoalRow(index, "title", e.target.value)}
                            required
                            placeholder="e.g. Plan priorities"
                            className="w-full px-3 py-1.5 text-xs bg-background border border-input rounded-lg outline-none text-foreground"
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[10px] uppercase font-bold text-muted-foreground mb-1">Category</label>
                            <Select 
                              value={item.category} 
                              onValueChange={(val: any) => updateGoalRow(index, "category", val)}
                            >
                              <SelectTrigger className="w-full bg-background text-foreground h-8 text-xs">
                                <SelectValue placeholder="Category" />
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
                            <label className="block text-[10px] uppercase font-bold text-muted-foreground mb-1">Priority</label>
                            <Select 
                              value={item.priority} 
                              onValueChange={(val: any) => updateGoalRow(index, "priority", val)}
                            >
                              <SelectTrigger className="w-full bg-background text-foreground h-8 text-xs">
                                <SelectValue placeholder="Priority" />
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
                          <label className="block text-[10px] uppercase font-bold text-muted-foreground mb-1">Notes (Optional)</label>
                          <input
                            type="text"
                            value={item.notes}
                            onChange={(e) => updateGoalRow(index, "notes", e.target.value)}
                            placeholder="e.g. Focus on draft progress"
                            className="w-full px-3 py-1.5 text-xs bg-background border border-input rounded-lg outline-none text-foreground"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </form>

            <div className="border-t border-border pt-4 mt-4 shrink-0">
              <button 
                type="button" 
                onClick={handleSubmit}
                className="w-full bg-primary text-primary-foreground font-bold py-2.5 rounded-lg transition hover:bg-primary/95 cursor-pointer text-sm"
              >
                {editingId ? "Save Changes" : "Create Template"}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </Layout>
  );
}
