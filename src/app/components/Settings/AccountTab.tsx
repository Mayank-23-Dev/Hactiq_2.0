// src/app/components/settings/AccountTab.tsx
import { Download, Trash2, Shield } from "lucide-react";
import { toast } from "sonner";

export function AccountTab() {
  return (
    <div className="bg-card border border-border rounded-xl p-8 shadow-sm space-y-8 relative overflow-hidden">
      <div className="flex flex-col gap-2 border-b border-border/40 pb-6">
        <h2 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <Shield className="text-primary w-6 h-6" /> Account Settings
        </h2>
        <p className="text-sm text-muted-foreground">
          Manage your account security, data export, and deletion.
        </p>
      </div>

      <div className="space-y-6">
        <div className="p-5 border border-border rounded-xl bg-input-background">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h4 className="text-sm font-semibold text-foreground">Export Account Data</h4>
              <p className="text-xs text-muted-foreground mt-1">
                Download all your boards, tasks, and settings as a JSON file.
              </p>
            </div>
            <button
              onClick={() => toast.success("Export started — check your email")}
              className="flex items-center gap-2 px-4 py-2.5 bg-secondary hover:bg-secondary/80 text-secondary-foreground border border-border text-xs font-semibold rounded-lg transition-colors cursor-pointer self-start sm:self-auto"
            >
              <Download size={14} /> Export Data
            </button>
          </div>
        </div>

        <div className="p-5 border border-destructive/20 rounded-xl bg-destructive/5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h4 className="text-sm font-semibold text-destructive">Delete Account</h4>
              <p className="text-xs text-muted-foreground mt-1">
                Permanently delete your account and all associated data. This action is irreversible.
              </p>
            </div>
            <button
              onClick={() => toast.error("Account deletion requires email confirmation")}
              className="flex items-center gap-2 px-4 py-2.5 bg-destructive hover:bg-destructive/90 text-destructive-foreground text-xs font-semibold rounded-lg transition-colors cursor-pointer self-start sm:self-auto shadow-sm"
            >
              <Trash2 size={14} /> Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
