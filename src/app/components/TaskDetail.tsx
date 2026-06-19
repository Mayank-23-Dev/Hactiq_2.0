import { useState } from "react";
import { createPortal } from "react-dom";
import { X, Trash2, Plus, Check, Calendar, Tag, User, Paperclip, MessageSquare, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { useApp, Task, Priority } from "../store";

interface TaskDetailProps {
  task: Task;
  onClose: () => void;
}

const PRIORITY_CONFIG: Record<Priority, { label: string; color: string; bg: string }> = {
  low: { label: "Low", color: "#10b981", bg: "#10b98120" },
  medium: { label: "Medium", color: "#f59e0b", bg: "#f59e0b20" },
  high: { label: "High", color: "#ef4444", bg: "#ef444420" },
};

const LABEL_COLORS: Record<string, string> = {
  Design: "#6366f1", UX: "#8b5cf6", Backend: "#3b82f6", Security: "#ef4444",
  Docs: "#14b8a6", DevOps: "#f59e0b", Bug: "#ef4444", Mobile: "#ec4899",
  Frontend: "#f97316", Marketing: "#10b981",
};

const ALL_ASSIGNEES = ["AC", "BK", "CL", "DM", "EW"];
const ALL_LABELS = ["Design", "UX", "Backend", "Security", "Docs", "DevOps", "Bug", "Mobile", "Frontend", "Marketing"];

export function TaskDetail({ task, onClose }: TaskDetailProps) {
  const { updateTask, deleteTask, getAvatarColor } = useApp();
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description);
  const [priority, setPriority] = useState<Priority>(task.priority);
  const [dueDate, setDueDate] = useState(task.dueDate);
  const [assignees, setAssignees] = useState<string[]>(task.assignees);
  const [labels, setLabels] = useState<string[]>(task.labels);
  const [subtasks, setSubtasks] = useState(task.subtasks);
  const [newSubtask, setNewSubtask] = useState("");
  const [showAssigneeMenu, setShowAssigneeMenu] = useState(false);
  const [showLabelMenu, setShowLabelMenu] = useState(false);
  const [showPriorityMenu, setShowPriorityMenu] = useState(false);

  const isDirty = title !== task.title || description !== task.description || priority !== task.priority ||
    dueDate !== task.dueDate || JSON.stringify(assignees) !== JSON.stringify(task.assignees) ||
    JSON.stringify(labels) !== JSON.stringify(task.labels) || JSON.stringify(subtasks) !== JSON.stringify(task.subtasks);

  const handleSave = () => {
    updateTask(task.id, { title, description, priority, dueDate, assignees, labels, subtasks });
    toast.success("Task updated");
    onClose();
  };

  const handleDelete = () => {
    deleteTask(task.id);
    toast.success("Task deleted");
    onClose();
  };

  const addSubtask = () => {
    if (!newSubtask.trim()) return;
    setSubtasks(prev => [...prev, { id: `s${Date.now()}`, title: newSubtask.trim(), done: false }]);
    setNewSubtask("");
  };

  const toggleSubtask = (id: string) => {
    setSubtasks(prev => prev.map(s => s.id === id ? { ...s, done: !s.done } : s));
  };

  const toggleAssignee = (a: string) => {
    setAssignees(prev => prev.includes(a) ? prev.filter(x => x !== a) : [...prev, a]);
  };

  const toggleLabel = (l: string) => {
    setLabels(prev => prev.includes(l) ? prev.filter(x => x !== l) : [...prev, l]);
  };

  const doneCount = subtasks.filter(s => s.done).length;
  const pCfg = PRIORITY_CONFIG[priority];

  return createPortal(
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[100] p-4" onClick={onClose}>
      <div
        className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="flex-1 font-semibold text-card-foreground bg-transparent outline-none border-b border-transparent focus:border-border mr-4"
          />
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {/* Description */}
          <div>
            <label className="text-sm font-medium text-foreground block mb-2">Description</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Add a description…"
              rows={3}
              className="w-full px-3 py-2 bg-input-background border border-border rounded-md text-sm outline-none focus:ring-2 focus:ring-ring resize-none"
            />
          </div>

          {/* Metadata row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Priority */}
            <div className="relative">
              <label className="text-sm font-medium text-foreground block mb-2">Priority</label>
              <button
                onClick={() => setShowPriorityMenu(!showPriorityMenu)}
                className="flex items-center gap-2 px-3 py-2 rounded-md border border-border text-sm w-full hover:bg-accent transition-colors"
                style={{ backgroundColor: pCfg.bg }}
              >
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: pCfg.color }} />
                <span style={{ color: pCfg.color }}>{pCfg.label}</span>
                <ChevronDown size={14} className="ml-auto text-muted-foreground" />
              </button>
              {showPriorityMenu && (
                <div className="absolute top-full left-0 mt-1 w-full bg-popover border border-border rounded-md shadow-lg z-10 py-1">
                  {(["low", "medium", "high"] as Priority[]).map(p => {
                    const cfg = PRIORITY_CONFIG[p];
                    return (
                      <button
                        key={p}
                        onClick={() => { setPriority(p); setShowPriorityMenu(false); }}
                        className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-accent transition-colors"
                      >
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cfg.color }} />
                        {cfg.label}
                        {priority === p && <Check size={13} className="ml-auto" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Due date */}
            <div>
              <label className="text-sm font-medium text-foreground block mb-2">Due date</label>
              <div className="flex items-center gap-2 px-3 py-2 border border-border rounded-md bg-input-background">
                <Calendar size={14} className="text-muted-foreground shrink-0" />
                <input
                  type="date"
                  value={dueDate}
                  onChange={e => setDueDate(e.target.value)}
                  className="bg-transparent text-sm outline-none flex-1 text-foreground"
                />
              </div>
            </div>
          </div>

          {/* Assignees */}
          <div className="relative">
            <label className="text-sm font-medium text-foreground block mb-2">Assignees</label>
            <button
              onClick={() => setShowAssigneeMenu(!showAssigneeMenu)}
              className="flex items-center gap-2 px-3 py-2 border border-border rounded-md bg-input-background w-full text-sm hover:bg-accent transition-colors"
            >
              <User size={14} className="text-muted-foreground" />
              <div className="flex gap-1.5">
                {assignees.length > 0 ? assignees.map(a => (
                  <span key={a} className="w-6 h-6 rounded-full flex items-center justify-center text-white" style={{ backgroundColor: getAvatarColor(a), fontSize: 10 }}>{a}</span>
                )) : <span className="text-muted-foreground">No assignees</span>}
              </div>
              <ChevronDown size={14} className="ml-auto text-muted-foreground" />
            </button>
            {showAssigneeMenu && (
              <div className="absolute top-full left-0 mt-1 w-full bg-popover border border-border rounded-md shadow-lg z-10 py-1">
                {ALL_ASSIGNEES.map(a => (
                  <button
                    key={a}
                    onClick={() => toggleAssignee(a)}
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-accent transition-colors"
                  >
                    <span className="w-6 h-6 rounded-full flex items-center justify-center text-white shrink-0" style={{ backgroundColor: getAvatarColor(a), fontSize: 10 }}>{a}</span>
                    <span>{a}</span>
                    {assignees.includes(a) && <Check size={13} className="ml-auto text-primary" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Labels */}
          <div className="relative">
            <label className="text-sm font-medium text-foreground block mb-2">Labels</label>
            <button
              onClick={() => setShowLabelMenu(!showLabelMenu)}
              className="flex items-center gap-2 px-3 py-2 border border-border rounded-md bg-input-background w-full text-sm hover:bg-accent transition-colors"
            >
              <Tag size={14} className="text-muted-foreground" />
              <div className="flex gap-1.5 flex-wrap">
                {labels.length > 0 ? labels.map(l => (
                  <span key={l} className="px-2 py-0.5 rounded-full text-xs text-white" style={{ backgroundColor: LABEL_COLORS[l] ?? "#6b7280" }}>{l}</span>
                )) : <span className="text-muted-foreground">No labels</span>}
              </div>
              <ChevronDown size={14} className="ml-auto text-muted-foreground" />
            </button>
            {showLabelMenu && (
              <div className="absolute top-full left-0 mt-1 w-full bg-popover border border-border rounded-md shadow-lg z-10 py-2">
                <div className="flex flex-wrap gap-2 px-3">
                  {ALL_LABELS.map(l => (
                    <button
                      key={l}
                      onClick={() => toggleLabel(l)}
                      className={`px-2.5 py-1 rounded-full text-xs text-white transition-opacity ${labels.includes(l) ? "opacity-100 ring-2 ring-offset-1 ring-ring" : "opacity-60 hover:opacity-80"}`}
                      style={{ backgroundColor: LABEL_COLORS[l] ?? "#6b7280" }}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Subtasks */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-foreground">Subtasks</label>
              {subtasks.length > 0 && (
                <span className="text-xs text-muted-foreground">{doneCount}/{subtasks.length}</span>
              )}
            </div>
            {subtasks.length > 0 && (
              <div className="mb-2 h-1.5 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${subtasks.length > 0 ? (doneCount / subtasks.length) * 100 : 0}%` }} />
              </div>
            )}
            <div className="space-y-2 mb-3">
              {subtasks.map(s => (
                <label key={s.id} className="flex items-center gap-2 cursor-pointer group">
                  <button
                    onClick={() => toggleSubtask(s.id)}
                    className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${s.done ? "bg-primary border-primary" : "border-border hover:border-primary"}`}
                  >
                    {s.done && <Check size={10} className="text-primary-foreground" />}
                  </button>
                  <span className={`text-sm ${s.done ? "line-through text-muted-foreground" : "text-foreground"}`}>{s.title}</span>
                </label>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                value={newSubtask}
                onChange={e => setNewSubtask(e.target.value)}
                onKeyDown={e => e.key === "Enter" && addSubtask()}
                placeholder="Add subtask…"
                className="flex-1 px-3 py-1.5 bg-input-background border border-border rounded-md text-sm outline-none focus:ring-2 focus:ring-ring"
              />
              <button onClick={addSubtask} className="px-3 py-1.5 bg-primary text-primary-foreground rounded-md text-sm hover:opacity-90">
                <Plus size={14} />
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="flex gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5"><MessageSquare size={14} /> {task.comments} comments</span>
            <span className="flex items-center gap-1.5"><Paperclip size={14} /> {task.attachments} attachments</span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between px-4 sm:px-6 py-4 border-t border-border shrink-0">
          <button onClick={handleDelete} className="flex items-center justify-center gap-1.5 px-3 py-2 text-sm text-destructive hover:bg-destructive/10 rounded-md transition-colors w-full sm:w-auto">
            <Trash2 size={14} /> Delete
          </button>
          <div className="flex gap-3 w-full sm:w-auto">
            <button onClick={onClose} className="flex-1 sm:flex-none px-4 py-2 text-sm border border-border rounded-md hover:bg-accent transition-colors">
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex-1 sm:flex-none px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity"
            >
              Save changes
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
