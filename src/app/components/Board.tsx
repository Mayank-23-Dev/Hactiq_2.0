import { useState, useRef } from "react";
import { useParams, useNavigate } from "react-router";
import {
  Plus, MoreHorizontal, Calendar, MessageSquare, Paperclip, ArrowLeft,
  Filter, UserPlus, Pencil, Trash2, MoveRight, X, Check,
} from "lucide-react";
import { toast } from "sonner";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { useApp, Task, Priority } from "../store";
import { TaskDetail } from "./TaskDetail";
import { Layout } from "./Layout";

const PRIORITY_CONFIG: Record<Priority, { color: string; bg: string; label: string }> = {
  low: { color: "#10b981", bg: "#10b98118", label: "Low" },
  medium: { color: "#f59e0b", bg: "#f59e0b18", label: "Medium" },
  high: { color: "#ef4444", bg: "#ef444418", label: "High" },
};

const LABEL_COLORS: Record<string, string> = {
  Design: "#6366f1", UX: "#8b5cf6", Backend: "#3b82f6", Security: "#ef4444",
  Docs: "#14b8a6", DevOps: "#f59e0b", Bug: "#ef4444", Mobile: "#ec4899",
  Frontend: "#f97316", Marketing: "#10b981",
};

const DRAG_TYPE = "TASK";

function TaskCard({ task, onClick }: { task: Task; onClick: () => void }) {
  const { getAvatarColor } = useApp();
  const ref = useRef<HTMLDivElement>(null);
  const [{ isDragging }, drag] = useDrag({
    type: DRAG_TYPE,
    item: { id: task.id, columnId: task.columnId },
    collect: monitor => ({ isDragging: monitor.isDragging() }),
  });
  drag(ref);

  const pc = PRIORITY_CONFIG[task.priority];
  const today = new Date().toISOString().split("T")[0];
  const isOverdue = task.dueDate && task.dueDate < today;

  return (
    <div
      ref={ref}
      onClick={onClick}
      className={`bg-card border border-border rounded-lg p-3 cursor-pointer hover:shadow-sm hover:border-primary/30 transition-all group ${isDragging ? "opacity-40 rotate-1" : ""}`}
    >
      {/* Labels */}
      {task.labels.length > 0 && (
        <div className="flex gap-1 flex-wrap mb-2">
          {task.labels.slice(0, 3).map(l => (
            <span key={l} className="px-1.5 py-0.5 rounded text-white" style={{ backgroundColor: LABEL_COLORS[l] ?? "#6b7280", fontSize: 10 }}>{l}</span>
          ))}
        </div>
      )}

      <p className="text-sm font-medium text-card-foreground leading-snug mb-2">{task.title}</p>

      {task.description && (
        <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{task.description}</p>
      )}

      {/* Priority */}
      <div className="flex items-center gap-1.5 mb-2">
        <span className="px-2 py-0.5 rounded-full text-xs" style={{ color: pc.color, backgroundColor: pc.bg }}>
          {pc.label}
        </span>
        {task.dueDate && (
          <span className={`flex items-center gap-1 text-xs ${isOverdue ? "text-destructive" : "text-muted-foreground"}`}>
            <Calendar size={10} /> {task.dueDate}
          </span>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        {/* Assignees */}
        <div className="flex -space-x-1">
          {task.assignees.slice(0, 3).map(a => (
            <div key={a} className="w-5 h-5 rounded-full border border-card flex items-center justify-center text-white" style={{ backgroundColor: getAvatarColor(a), fontSize: 9 }}>
              {a}
            </div>
          ))}
          {task.assignees.length > 3 && (
            <div className="w-5 h-5 rounded-full border border-card bg-muted flex items-center justify-center text-muted-foreground" style={{ fontSize: 9 }}>
              +{task.assignees.length - 3}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          {task.comments > 0 && <span className="flex items-center gap-0.5" style={{ fontSize: 11 }}><MessageSquare size={10} /> {task.comments}</span>}
          {task.attachments > 0 && <span className="flex items-center gap-0.5" style={{ fontSize: 11 }}><Paperclip size={10} /> {task.attachments}</span>}
        </div>
      </div>
    </div>
  );
}

function Column({
  columnId, title, tasks, boardId, onAddTask, onEditTitle, onDelete, onTaskClick,
}: {
  columnId: string; title: string; tasks: Task[]; boardId: string;
  onAddTask: () => void; onEditTitle: (t: string) => void; onDelete: () => void;
  onTaskClick: (t: Task) => void;
}) {
  const { moveTask } = useApp();
  const [menuOpen, setMenuOpen] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleVal, setTitleVal] = useState(title);
  const ref = useRef<HTMLDivElement>(null);

  const [{ isOver }, drop] = useDrop({
    accept: DRAG_TYPE,
    drop: (item: { id: string; columnId: string }) => {
      if (item.columnId !== columnId) {
        moveTask(item.id, columnId);
        toast.success(`Task moved to ${title}`);
      }
    },
    collect: monitor => ({ isOver: monitor.isOver() }),
  });
  drop(ref);

  const submitTitle = () => {
    if (titleVal.trim()) onEditTitle(titleVal.trim());
    setEditingTitle(false);
  };

  return (
    <div
      ref={ref}
      className={`flex flex-col bg-muted/50 rounded-xl min-w-72 w-72 shrink-0 transition-colors ${isOver ? "bg-primary/5 ring-2 ring-primary/20" : ""}`}
    >
      {/* Column header */}
      <div className="flex items-center gap-2 px-3 py-3">
        {editingTitle ? (
          <input
            autoFocus
            value={titleVal}
            onChange={e => setTitleVal(e.target.value)}
            onBlur={submitTitle}
            onKeyDown={e => { if (e.key === "Enter") submitTitle(); if (e.key === "Escape") setEditingTitle(false); }}
            className="flex-1 text-sm font-medium bg-transparent border-b border-border outline-none"
          />
        ) : (
          <h4 className="flex-1 text-sm font-medium text-foreground">{title}</h4>
        )}
        <span className="text-xs text-muted-foreground bg-muted rounded-full px-2 py-0.5">{tasks.length}</span>
        <button onClick={onAddTask} className="text-muted-foreground hover:text-foreground transition-colors">
          <Plus size={15} />
        </button>
        <div className="relative">
          <button onClick={() => setMenuOpen(!menuOpen)} className="text-muted-foreground hover:text-foreground transition-colors">
            <MoreHorizontal size={15} />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-full mt-1 w-44 bg-popover border border-border rounded-lg shadow-lg z-20 py-1">
              <button onClick={() => { setEditingTitle(true); setMenuOpen(false); }} className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-accent transition-colors">
                <Pencil size={13} /> Edit title
              </button>
              <button onClick={() => { onDelete(); setMenuOpen(false); }} className="flex items-center gap-2 w-full px-3 py-2 text-sm text-destructive hover:bg-accent transition-colors">
                <Trash2 size={13} /> Delete column
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Tasks */}
      <div className="flex-1 px-3 pb-3 space-y-2 overflow-y-auto max-h-[calc(100vh-220px)]">
        {tasks.map(task => (
          <TaskCard key={task.id} task={task} onClick={() => onTaskClick(task)} />
        ))}
      </div>

      {/* Add card button */}
      <button
        onClick={onAddTask}
        className="flex items-center gap-2 mx-3 mb-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
      >
        <Plus size={14} /> Add card
      </button>
    </div>
  );
}

export function BoardPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { boards, columns, tasks, createTask, updateColumn, deleteColumn } = useApp();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [addingInColumn, setAddingInColumn] = useState<string | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState("");

  const board = boards.find(b => b.id === id);
  const boardColumns = columns.filter(c => c.boardId === id);

  if (!board) {
    return (
      <Layout title="Board not found">
        <div className="flex flex-col items-center justify-center h-full gap-4">
          <p className="text-muted-foreground">This board doesn't exist.</p>
          <button onClick={() => navigate("/")} className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm">
            Back to Dashboard
          </button>
        </div>
      </Layout>
    );
  }

  const submitNewTask = (columnId: string) => {
    if (!newTaskTitle.trim()) { setAddingInColumn(null); return; }
    const task = createTask(board.id, columnId, newTaskTitle.trim());
    toast.success("Task created");
    setNewTaskTitle("");
    setAddingInColumn(null);
    setSelectedTask(task);
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <Layout title={board.name}>
        <div className="flex flex-col h-full">
          {/* Board topbar */}
          <div className="flex items-center gap-3 px-6 py-3 border-b border-border bg-background shrink-0">
            <button onClick={() => navigate("/")} className="text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft size={16} />
            </button>
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: board.color }} />
            <span className="text-sm text-muted-foreground">{board.description}</span>
            <div className="flex-1" />
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-border rounded-md hover:bg-accent transition-colors">
              <Filter size={13} /> Filter
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity">
              <UserPlus size={13} /> Invite
            </button>
          </div>

          {/* Columns */}
          <div className="flex-1 overflow-x-auto">
            <div className="flex gap-4 p-6 h-full items-start">
              {boardColumns.map(col => {
                const colTasks = tasks.filter(t => t.columnId === col.id);
                return (
                  <div key={col.id} className="flex flex-col gap-2">
                    <Column
                      columnId={col.id}
                      title={col.title}
                      tasks={colTasks}
                      boardId={board.id}
                      onAddTask={() => { setAddingInColumn(col.id); setNewTaskTitle(""); }}
                      onEditTitle={(t) => updateColumn(col.id, t)}
                      onDelete={() => { deleteColumn(col.id); toast.success("Column deleted"); }}
                      onTaskClick={setSelectedTask}
                    />
                    {/* Inline new task input */}
                    {addingInColumn === col.id && (
                      <div className="w-72 bg-card border border-primary/40 rounded-lg p-3 shadow-sm">
                        <textarea
                          autoFocus
                          value={newTaskTitle}
                          onChange={e => setNewTaskTitle(e.target.value)}
                          onKeyDown={e => {
                            if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submitNewTask(col.id); }
                            if (e.key === "Escape") setAddingInColumn(null);
                          }}
                          placeholder="Task title…"
                          rows={2}
                          className="w-full bg-transparent text-sm outline-none resize-none text-foreground placeholder:text-muted-foreground"
                        />
                        <div className="flex gap-2 mt-2">
                          <button
                            onClick={() => submitNewTask(col.id)}
                            className="flex items-center gap-1 px-3 py-1.5 text-xs bg-primary text-primary-foreground rounded-md hover:opacity-90"
                          >
                            <Check size={12} /> Add
                          </button>
                          <button onClick={() => setAddingInColumn(null)} className="p-1.5 text-muted-foreground hover:text-foreground rounded-md hover:bg-accent">
                            <X size={14} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Task detail modal */}
        {selectedTask && (
          <TaskDetail task={selectedTask} onClose={() => setSelectedTask(null)} />
        )}
      </Layout>
    </DndProvider>
  );
}
