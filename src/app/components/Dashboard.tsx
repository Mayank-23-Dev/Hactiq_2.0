import { useState } from "react";
import { useNavigate } from "react-router";
import { Plus, MoreHorizontal, Calendar, CheckSquare, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { useApp } from "../store";
import { Layout } from "./Layout";
import { RecentActivity } from "./RecentActivity";

const COLORS = [
  "#5B4BFF", "#ec4899", "#f59e0b", "#10b981", "#3b82f6", "#8b5cf6", "#ef4444", "#14b8a6",
];

export function Dashboard() {
  const { boards, columns, tasks, createBoard, deleteBoard, userProfile } = useApp();
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
      <div className="p-8 max-w-7xl mx-auto space-y-8">
        {/* Welcome Block */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-6">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight text-white mb-2">
              {getGreeting()}, {userProfile.name}
            </h2>
            <p className="text-sm text-muted-foreground">
              You have <span className="text-primary font-semibold">{tasks.filter(t => t.dueDate && t.dueDate <= new Date().toISOString().split("T")[0]).length} overdue tasks</span> across your boards.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          {/* Boards grid */}
          <div className="lg:col-span-3 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-white tracking-tight">Your Boards</h3>
              <button
                onClick={() => setShowCreate(true)}
                className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/95 text-primary-foreground text-xs font-semibold rounded-lg shadow-sm transition-all cursor-pointer"
              >
                <Plus size={16} /> New Board
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {boards.map(board => {
                const count = getTaskCount(board.id);
                const boardCols = columns.filter(c => c.boardId === board.id);
                const done = tasks.filter(t => t.boardId === board.id && boardCols.find(c => c.id === t.columnId)?.title === "Done").length;
                return (
                  <div
                    key={board.id}
                    onClick={() => navigate(`/board/${board.id}`)}
                    className="group relative glass-panel rounded-2xl p-6 cursor-pointer hover:scale-[1.02] hover:border-primary/30 transition-all duration-250 flex flex-col justify-between min-h-[180px] shadow-xl"
                  >
                    {/* Top line with Accent color */}
                    <div className="absolute top-0 left-0 right-0 h-1.5 rounded-t-2xl" style={{ backgroundColor: board.color }} />

                    <div className="space-y-3 mt-2">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-base font-bold text-white tracking-tight group-hover:text-primary transition-colors leading-snug">
                          {board.name}
                        </h4>
                        <button
                          onClick={(e) => handleDelete(e, board.id, board.name)}
                          className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all cursor-pointer"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>

                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                        {board.description || "No description provided."}
                      </p>
                    </div>

                    {/* Footer & Progress details */}
                    <div className="space-y-4 mt-6">
                      {count > 0 && (
                        <div className="space-y-1">
                          <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full rounded-full transition-all" style={{ width: `${(done / count) * 100}%`, backgroundColor: board.color }} />
                          </div>
                          <p className="text-[10px] text-muted-foreground text-right font-medium">
                            {done}/{count} completed
                          </p>
                        </div>
                      )}

                      <div className="flex items-center justify-between text-[11px] text-muted-foreground border-t border-white/[0.04] pt-3">
                        <span className="flex items-center gap-1.5"><CheckSquare size={13} className="text-primary" /> {count} tasks</span>
                        <span className="flex items-center gap-1.5"><Calendar size={13} /> {board.lastModified}</span>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Create new board block */}
              <button
                onClick={() => setShowCreate(true)}
                className="border border-dashed border-white/10 hover:border-primary/50 hover:bg-white/[0.01] rounded-2xl p-6 text-muted-foreground hover:text-white transition-all duration-200 flex flex-col items-center justify-center gap-3 min-h-[180px] cursor-pointer"
              >
                <div className="w-10 h-10 rounded-full bg-white/[0.02] border border-white/10 flex items-center justify-center group-hover:border-primary/30 transition-all">
                  <Plus size={18} className="text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <span className="text-xs font-semibold">Create new board</span>
              </button>
            </div>
          </div>

          {/* Activity feed */}
          <div className="lg:col-span-1 glass-panel rounded-2xl p-6 shadow-2xl space-y-4">
            <RecentActivity limit={6} showSeeAll={true} />
          </div>
        </div>
      </div>

      {/* Create Board Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm" onClick={() => setShowCreate(false)}>
          <div className="glass-panel border border-white/10 rounded-2xl shadow-2xl w-full max-w-md p-8 animate-in fade-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-white tracking-tight">Create New Board</h3>
              <button onClick={() => setShowCreate(false)} className="text-muted-foreground hover:text-white p-1 rounded-lg hover:bg-white/[0.04] transition cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-white uppercase tracking-wider block">Board name</label>
                <input
                  autoFocus
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleCreate()}
                  placeholder="e.g. Q4 Roadmap"
                  className="w-full px-3.5 py-2.5 bg-white/[0.02] border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-white uppercase tracking-wider block">Description <span className="text-muted-foreground font-normal lowercase">(optional)</span></label>
                <textarea
                  value={newDesc}
                  onChange={e => setNewDesc(e.target.value)}
                  placeholder="What's this board for?"
                  rows={2}
                  className="w-full px-3.5 py-2.5 bg-white/[0.02] border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all resize-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-white uppercase tracking-wider block">Color Accent</label>
                <div className="flex gap-2.5 flex-wrap">
                  {COLORS.map(c => (
                    <button
                      key={c}
                      onClick={() => setNewColor(c)}
                      className={`w-7 h-7 rounded-full transition-transform cursor-pointer ${newColor === c ? "scale-110 ring-2 ring-offset-2 ring-offset-hactiq-dark-1 ring-primary" : "hover:scale-105"}`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button onClick={() => setShowCreate(false)} className="flex-1 py-2.5 text-xs font-semibold border border-white/10 hover:bg-white/[0.04] text-white rounded-lg transition-colors cursor-pointer">
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={!newName.trim()}
                className="flex-1 py-2.5 text-xs font-semibold bg-primary hover:bg-primary/95 text-primary-foreground rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
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
