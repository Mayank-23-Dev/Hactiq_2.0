import { useState } from "react";
import { useNavigate } from "react-router";
import { Plus, Trash2, Calendar, CheckSquare, X, Grid3x3 } from "lucide-react";
import { toast } from "sonner";
import { useApp } from "../app/store";
import { Layout } from "../app/components/Layout";

const COLORS = [
  "#6366f1", "#ec4899", "#f59e0b", "#10b981", "#3b82f6", "#8b5cf6", "#ef4444", "#14b8a6",
];

export default function WorkspacesPage() {
  const { boards, columns, tasks, createBoard, deleteBoard } = useApp();
  const navigate = useNavigate();
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newColor, setNewColor] = useState(COLORS[0]);

  const handleCreate = () => {
    if (!newName.trim()) return;
    createBoard(newName.trim(), newDesc.trim(), newColor);
    toast.success(`Workspace "${newName}" created`);
    setNewName("");
    setNewDesc("");
    setNewColor(COLORS[0]);
    setShowCreate(false);
  };

  const handleDelete = (e: React.MouseEvent, id: string, name: string) => {
    e.stopPropagation();
    deleteBoard(id);
    toast.success(`Workspace "${name}" deleted`);
  };

  const getTaskCount = (boardId: string) => tasks.filter(t => t.boardId === boardId).length;

  return (
    <Layout title="Workspaces">
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
              <Grid3x3 className="w-8 h-8 text-primary" />
              Workspaces
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage your projects, task boards, and collaborative workspaces.
            </p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground font-semibold rounded-lg hover:opacity-90 transition shadow-sm"
          >
            <Plus size={16} /> New Workspace
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {boards.map(board => {
            const count = getTaskCount(board.id);
            const boardCols = columns.filter(c => c.boardId === board.id);
            const done = tasks.filter(t => t.boardId === board.id && boardCols.find(c => c.id === t.columnId)?.title === "Done").length;
            return (
              <div
                key={board.id}
                onClick={() => navigate(`/board/${board.id}`)}
                className="group relative bg-card border border-border rounded-xl p-5 cursor-pointer hover:shadow-md hover:scale-[1.01] transition-all duration-150 flex flex-col justify-between min-h-[180px]"
              >
                <div>
                  {/* Color bar */}
                  <div className="w-full h-1.5 rounded-full mb-4" style={{ backgroundColor: board.color }} />

                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-card-foreground text-base leading-snug group-hover:text-primary transition-colors truncate">{board.name}</h4>
                    <button
                      onClick={(e) => handleDelete(e, board.id, board.name)}
                      className="opacity-0 group-hover:opacity-100 p-1.5 rounded hover:bg-destructive/10 hover:text-destructive transition-all"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{board.description || "No description provided."}</p>
                </div>

                <div>
                  {/* Progress */}
                  {count > 0 && (
                    <div className="mb-4">
                      <div className="h-1 bg-muted rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all" style={{ width: `${(done / count) * 100}%`, backgroundColor: board.color }} />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1.5">{done}/{count} completed</p>
                    </div>
                  )}

                  <div className="flex items-center gap-3 text-xs text-muted-foreground border-t border-border/55 pt-3">
                    <span className="flex items-center gap-1"><CheckSquare size={12} /> {count} tasks</span>
                    <span className="flex items-center gap-1"><Calendar size={12} /> {board.lastModified}</span>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Create new card */}
          <button
            onClick={() => setShowCreate(true)}
            className="border-2 border-dashed border-border bg-card/30 rounded-xl p-5 text-muted-foreground hover:border-primary hover:text-primary transition-colors flex flex-col items-center justify-center gap-2.5 min-h-[180px]"
          >
            <Plus size={24} />
            <span className="text-sm font-semibold">Create new workspace</span>
          </button>
        </div>
      </div>

      {/* Create Board Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setShowCreate(false)}>
          <div className="bg-card border border-border rounded-xl shadow-xl w-full max-w-md p-6 animate-in zoom-in-95 duration-150" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5 border-b border-border pb-3">
              <h3 className="font-bold text-card-foreground text-lg">Create New Workspace</h3>
              <button onClick={() => setShowCreate(false)} className="text-muted-foreground hover:text-foreground">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground block mb-1.5">Workspace name</label>
                <input
                  autoFocus
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleCreate()}
                  placeholder="e.g. Q4 Roadmap"
                  className="w-full px-3 py-2 bg-muted/40 border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-ring text-foreground"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground block mb-1.5">Description <span className="text-muted-foreground font-normal">(optional)</span></label>
                <textarea
                  value={newDesc}
                  onChange={e => setNewDesc(e.target.value)}
                  placeholder="What's this workspace for?"
                  rows={3}
                  className="w-full px-3 py-2 bg-muted/40 border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-ring text-foreground resize-none"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground block mb-2">Color Theme</label>
                <div className="flex gap-2.5 flex-wrap">
                  {COLORS.map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setNewColor(c)}
                      className={`w-7 h-7 rounded-full transition-transform ${newColor === c ? "scale-125 ring-2 ring-offset-2 ring-ring" : "hover:scale-110"}`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6 border-t border-border pt-4">
              <button type="button" onClick={() => setShowCreate(false)} className="flex-1 px-4 py-2 text-sm border border-border rounded-lg hover:bg-accent transition text-foreground">
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreate}
                disabled={!newName.trim()}
                className="flex-1 px-4 py-2 text-sm bg-primary text-primary-foreground font-semibold rounded-lg hover:opacity-90 transition disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Create Workspace
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
