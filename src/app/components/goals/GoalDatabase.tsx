import React, { useState } from "react";
import { Layout } from "../Layout";
import { useApp, Priority, Goal } from "../../store";
import { Search, Trash2, CheckCircle, Circle, Bot, Sparkles, Network, Edit2, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { decomposeGoal } from "../../../lib/groq";
import { format } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EditGoalDialog } from "./EditGoalDialog";
import { PriorityBadge } from "./Shared";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function GoalDatabase() {
  const { goals, deleteGoal, toggleGoal, addGoal, groqApiKey, aiFeaturesConfig, customConfig } = useApp();
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterPriority, setFilterPriority] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isDecomposing, setIsDecomposing] = useState<string | null>(null);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredGoals = goals.filter(g => {
    const matchesSearch = g.title.toLowerCase().includes(search.toLowerCase());
    const matchesCat = !filterCategory || g.category === filterCategory;
    const matchesPrio = !filterPriority || g.priority === filterPriority;
    const matchesStatus = !filterStatus || (filterStatus === "completed" ? g.completed : !g.completed);
    return matchesSearch && matchesCat && matchesPrio && matchesStatus;
  });

  const totalPages = Math.ceil(filteredGoals.length / itemsPerPage);
  const currentGoals = filteredGoals.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const toggleSelectAll = () => {
    if (selectedIds.length === currentGoals.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(currentGoals.map(g => g.id));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const batchDelete = () => {
    if (selectedIds.length === 0) return;
    if (window.confirm(`Delete ${selectedIds.length} goals?`)) {
      selectedIds.forEach(id => deleteGoal(id));
      setSelectedIds([]);
      toast.success("Batch delete successful");
    }
  };

  const handleDecompose = async (goalId: string, title: string, category: string, priority: Priority) => {
    if (!groqApiKey) return toast.error("Groq API key required");
    setIsDecomposing(goalId);
    try {
      const subtasks = await decomposeGoal(title, groqApiKey);
      if (!Array.isArray(subtasks)) throw new Error("Invalid format from AI");
      
      const todayStr = format(new Date(), "yyyy-MM-dd");
      subtasks.forEach(t => {
        addGoal({
          title: `↳ ${t}`, // visual indicator
          category: category as any,
          priority,
          notes: `Subtask of: ${title}`,
          completed: false,
          date: todayStr,
          status: "todo"
        });
      });
      toast.success(`Generated ${subtasks.length} subtasks!`);
    } catch (e: any) {
      toast.error("Failed to decompose: " + e.message);
    } finally {
      setIsDecomposing(null);
    }
  };

  return (
    <Layout title="All Goals Database">
      <div className="p-6 max-w-7xl mx-auto flex flex-col min-h-[calc(100vh-4rem)]">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 shrink-0">
          <h1 className="text-3xl font-extrabold text-foreground">All Goals Database</h1>
          <button 
            onClick={batchDelete}
            disabled={selectedIds.length === 0}
            className="bg-destructive/10 hover:bg-destructive/20 text-destructive font-bold py-2 px-4 rounded-lg transition text-sm disabled:opacity-50"
          >
            Delete Selected ({selectedIds.length})
          </button>
        </div>

        {/* Filters */}
        <div className="bg-card p-4 rounded-xl shadow-sm border border-border mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
            <input 
              type="text" 
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              placeholder="Search goals..." 
              className="w-full pl-10 pr-3 py-2 bg-transparent border border-input rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <Select value={filterCategory} onValueChange={(v) => { setFilterCategory(v); setCurrentPage(1); }}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {customConfig.categories.map(c => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterPriority} onValueChange={(v) => { setFilterPriority(v); setCurrentPage(1); }}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="All Priorities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              {customConfig.priorities.map(p => (
                <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={(v) => { setFilterStatus(v); setCurrentPage(1); }}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="bg-card rounded-xl shadow-sm border border-border flex-1 flex flex-col overflow-hidden">
          <div className="overflow-x-auto flex-1">
            <Table>
              <TableHeader className="bg-accent/30 sticky top-0 z-10">
                <TableRow>
                  <TableHead className="w-12">
                    <input 
                      type="checkbox" 
                      checked={selectedIds.length === currentGoals.length && currentGoals.length > 0}
                      onChange={toggleSelectAll}
                      className="rounded border-input text-primary focus:ring-primary"
                    />
                  </TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Goal</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentGoals.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-32 text-center text-muted-foreground italic">
                      No goals match your filters.
                    </TableCell>
                  </TableRow>
                ) : (
                  currentGoals.map(g => (
                    <TableRow key={g.id} className="group cursor-default">
                      <TableCell>
                        <input 
                          type="checkbox" 
                          checked={selectedIds.includes(g.id)}
                          onChange={() => toggleSelect(g.id)}
                          className="rounded border-input text-primary focus:ring-primary"
                        />
                      </TableCell>
                      <TableCell className="text-muted-foreground whitespace-nowrap">{g.date}</TableCell>
                      <TableCell className="font-medium max-w-xs truncate" title={g.title}>{g.title}</TableCell>
                      <TableCell className="text-muted-foreground">{g.category}</TableCell>
                      <TableCell>
                        <PriorityBadge priorityId={g.priority} customConfig={customConfig} />
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${g.completed ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"}`}>
                          {g.completed ? "Completed" : "Pending"}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {!g.completed && aiFeaturesConfig.goalDecomposition && (
                            <button 
                              onClick={() => handleDecompose(g.id, g.title, g.category, g.priority)}
                              disabled={isDecomposing === g.id}
                              className="p-1.5 text-primary hover:bg-primary/10 rounded-md disabled:opacity-50"
                              title="Break down with AI"
                            >
                              {isDecomposing === g.id ? <Sparkles className="animate-spin" size={16} /> : <Network size={16} />}
                            </button>
                          )}
                          <button onClick={() => toggleGoal(g.id)} className="p-1.5 text-primary hover:bg-primary/10 rounded-md" title="Toggle Status">
                            <CheckCircle size={16} />
                          </button>
                          <button onClick={() => setEditingGoal(g)} className="p-1.5 text-muted-foreground hover:bg-accent rounded-md" title="Edit Goal">
                            <Edit2 size={16} />
                          </button>
                          <button onClick={() => deleteGoal(g.id)} className="p-1.5 text-destructive hover:bg-destructive/10 rounded-md" title="Delete Goal">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination Controls */}
          <div className="border-t border-border p-4 flex items-center justify-between shrink-0 bg-card">
            <span className="text-sm text-muted-foreground">
              Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredGoals.length)} of {filteredGoals.length} results
            </span>
            <div className="flex gap-2">
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 border border-border rounded-md hover:bg-accent disabled:opacity-50 transition"
              >
                <ChevronLeft size={16} />
              </button>
              <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages || totalPages === 0}
                className="p-1.5 border border-border rounded-md hover:bg-accent disabled:opacity-50 transition"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <EditGoalDialog 
        goal={editingGoal} 
        open={!!editingGoal} 
        onOpenChange={(open) => !open && setEditingGoal(null)} 
      />
    </Layout>
  );
}