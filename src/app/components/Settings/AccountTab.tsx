// src/app/components/settings/AccountTab.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Download, Trash2 } from "lucide-react";
import { toast } from "sonner";

export function AccountTab() {
  return (
    <Card className="border border-border bg-card">
      <CardHeader>
        <CardTitle className="text-xl font-bold tracking-tight">Account Settings</CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          Manage your account security, data export, and deletion.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="p-4 border border-border rounded-xl bg-accent/30">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h4 className="text-sm font-semibold text-foreground">Export Account Data</h4>
              <p className="text-xs text-muted-foreground mt-0.5">
                Download all your boards, tasks, and settings as a JSON file.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => toast.success("Export started — check your email")}
              className="flex items-center gap-2 self-start sm:self-auto"
            >
              <Download size={14} /> Export Data
            </Button>
          </div>
        </div>

        <div className="p-4 border border-destructive/30 rounded-xl bg-destructive/5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h4 className="text-sm font-semibold text-destructive">Delete Account</h4>
              <p className="text-xs text-muted-foreground mt-0.5">
                Permanently delete your account and all associated data. This action is irreversible.
              </p>
            </div>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => toast.error("Account deletion requires email confirmation")}
              className="flex items-center gap-2 self-start sm:self-auto"
            >
              <Trash2 size={14} /> Delete Account
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
