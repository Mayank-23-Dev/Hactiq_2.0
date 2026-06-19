// src/app/components/TodayDashboard.tsx
import { useState } from "react";
import { useNavigate } from "react-router";
import { Plus, CheckSquare, Calendar, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { useApp } from "../store";
import { Layout } from "./Layout";

const COLORS = [
  "#6366f1", "#ec4899", "#f59e0b", "#10b981", "#3b82f6", "#8b5cf6", "#ef4444", "#14b8a6",
];

export function TodayDashboard() {
  const { boards, columns, tasks, activity, createBoard, deleteBoard, userProfile } = useApp();
  const navigate = useNavigate();
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newColor, setNewColor] = useState(COLORS[0]);

  const handleCreate = () => {
    if (!newName.trim()) return;
    createBoard(newName.trim(), newDesc.trim(), newColor);
    toast.success(`Board "${newName}" created`);
    setNewName("");
    setNewDesc("");
    setNewColor(COLORS[0]);
    setShowCreate(false);
  };

  const handleDelete = (e: React.MouseEvent, id: string, name: string) => {
    e.stopPropagation();
    deleteBoard(id);
    toast.success(`Board "${name}" deleted`);
  };

  const getTaskCount = (boardId: string) => tasks.filter(t => t.boardId === boardId).length;

  const getGreeting = () => {
    const hr = new Date().getHours();
    if (hr < 12) return "Good morning";
    if (hr < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <Layout title="Dashboard">
      <div className="p-6 max-w-7xl mx-auto">
        {/* Welcome */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-foreground mb-1">{getGreeting()}, {userProfile.name}</h2>
            <p className="text-sm text-muted-foreground font-medium">You have {tasks.filter(t => t.dueDate && t.dueDate <= new Date().toISOString().split("T")[0]).length} overdue tasks across your boards.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Boards grid */}
          <div className="lg:col-span-3">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-foreground">Your Boards</h3>
              <button
                onClick={() => setShowCreate(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity"
              >
                <Plus size={14} /> New Board
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {boards.map(board => {
                const count = getTaskCount(board.id);
                const boardCols = columns.filter(c => c.boardId === board.id);
                const done = tasks.filter(t => t.boardId === board.id && boardCols.find(c => c.id === t.columnId)?.title === "Done").length;
                return (
                  <div
                    key={board.id}
                    onClick={() => navigate(`/board/${board.id}`)}
                    className="group relative bg-card border border-border rounded-xl p-4 cursor-pointer hover:shadow-md hover:scale-[1.01] transition-all duration-150"
                  >
                    {/* Color bar */}
                    <div className="w-full h-1.5 rounded-full mb-4" style={{ backgroundColor: board.color }} />

                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-card-foreground leading-snug">{board.name}</h4>
                      <button
                        onClick={(e) => handleDelete(e, board.id, board.name)}
                        className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-destructive/10 hover:text-destructive transition-all"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>

                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{board.description}</p>

                    {/* Progress */}
                    {count > 0 && (
                      <div className="mb-3">
                        <div className="h-1 bg-muted rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all" style={{ width: `${(done / count) * 100}%`, backgroundColor: board.color }} />
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{done}/{count} completed</p>
                      </div>
                    )}

                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><CheckSquare size={11} /> {count} tasks</span>
                      <span className="flex items-center gap-1"><Calendar size={11} /> {board.lastModified}</span>
                    </div>
                  </div>
                );
              })}

              {/* Create new card */}
              <button
                onClick={() => setShowCreate(true)}
                className="border-2 border-dashed border-border rounded-xl p-4 text-muted-foreground hover:border-primary hover:text-primary transition-colors flex flex-col items-center justify-center gap-2 min-h-32"
              >
                <Plus size={20} />
                <span className="text-sm">Create new board</span>
              </button>
            </div>
          </div>

          {/* Activity feed */}
          <div className="lg:col-span-1">
            <h3 className="font-medium text-foreground mb-4">Recent Activity</h3>
            <div className="space-y-3">
              {activity.map(item => (
                <div key={item.id} className="flex gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 shrink-0" />
                  <div>
                    <p className="text-sm text-foreground leading-snug">{item.text}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{item.boardName} · {item.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Create Board Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setShowCreate(false)}>
          <div className="bg-card border border-border rounded-xl shadow-xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-card-foreground">Create New Board</h3>
              <button onClick={() => setShowCreate(false)} className="text-muted-foreground hover:text-foreground">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground block mb-1.5">Board name</label>
                <input
                  autoFocus
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleCreate()}
                  placeholder="e.g. Q4 Roadmap"
                  className="w-full px-3 py-2 bg-input-background border border-border rounded-md text-sm outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground block mb-1.5">Description <span className="text-muted-foreground font-normal">(optional)</span></label>
                <textarea
                  value={newDesc}
                  onChange={e => setNewDesc(e.target.value)}
                  placeholder="What's this board for?"
                  rows={2}
                  className="w-full px-3 py-2 bg-input-background border border-border rounded-md text-sm outline-none focus:ring-2 focus:ring-ring resize-none"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground block mb-2">Color</label>
                <div className="flex gap-2 flex-wrap">
                  {COLORS.map(c => (
                    <button
                      key={c}
                      onClick={() => setNewColor(c)}
                      className={`w-7 h-7 rounded-full transition-transform ${newColor === c ? "scale-125 ring-2 ring-offset-2 ring-ring" : "hover:scale-110"}`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowCreate(false)} className="flex-1 px-4 py-2 text-sm border border-border rounded-md hover:bg-accent transition-colors">
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={!newName.trim()}
                className="flex-1 px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Create Board
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
