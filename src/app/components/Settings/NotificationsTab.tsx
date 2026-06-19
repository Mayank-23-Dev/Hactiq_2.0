// src/app/components/settings/NotificationsTab.tsx
import { useState, useEffect } from "react";
import { Label } from "@/app/components/ui/label";
import { Switch } from "@/app/components/ui/switch";
import { toast } from "sonner";
import { Bell, Save } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { auth } from "@/lib/firebase";

export function NotificationsTab() {
  const [emailDigest, setEmailDigest] = useState(true);
  const [pushNotifs, setPushNotifs] = useState(false);
  const [taskUpdates, setTaskUpdates] = useState(true);
  const [loading, setLoading] = useState(true);

  // Load preferences from Supabase
  useEffect(() => {
    const loadPreferences = async () => {
      const userId = auth.currentUser?.uid;
      if (!userId) {
        setLoading(false);
        return;
      }
      try {
        const { data, error } = await supabase
          .from("user_preferences")
          .select("email_digest, push_notifications, task_updates")
          .eq("id", userId)
          .single();

        if (data) {
          setEmailDigest(data.email_digest ?? true);
          setPushNotifs(data.push_notifications ?? false);
          setTaskUpdates(data.task_updates ?? true);
        }
      } catch (err) {
        console.error("Error loading notification preferences:", err);
      } finally {
        setLoading(false);
      }
    };

    loadPreferences();
  }, []);

  const handleSave = async () => {
    const userId = auth.currentUser?.uid;
    if (!userId) {
      toast.error("You must be logged in to save preferences.");
      return;
    }
    try {
      const { error } = await supabase.from("user_preferences").upsert({
        id: userId,
        email_digest: emailDigest,
        push_notifications: pushNotifs,
        task_updates: taskUpdates
      });

      if (error) throw error;
      toast.success("Notification preferences saved successfully");
    } catch (err: any) {
      toast.error(err.message || "Failed to save preferences");
    }
  };

  if (loading) {
    return (
      <div className="bg-card border border-border rounded-xl p-8 shadow-sm flex items-center justify-center min-h-[200px]">
        <span className="text-sm text-muted-foreground">Loading preferences...</span>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-xl p-8 shadow-sm space-y-8 relative overflow-hidden">
      <div className="flex flex-col gap-2 border-b border-border/40 pb-6">
        <h2 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <Bell className="text-primary w-6 h-6" /> Notification Settings
        </h2>
        <p className="text-sm text-muted-foreground">
          Choose how you want to be notified about workspace updates.
        </p>
      </div>

      <div className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4 p-5 border border-border rounded-xl bg-input-background">
            <div className="space-y-1">
              <Label className="text-sm font-semibold text-foreground">Email Digest</Label>
              <p className="text-xs text-muted-foreground">
                Receive a daily summary of your board activity via email.
              </p>
            </div>
            <Switch checked={emailDigest} onCheckedChange={setEmailDigest} className="data-[state=checked]:bg-primary" />
          </div>

          <div className="flex items-center justify-between gap-4 p-5 border border-border rounded-xl bg-input-background">
            <div className="space-y-1">
              <Label className="text-sm font-semibold text-foreground">Desktop Push Notifications</Label>
              <p className="text-xs text-muted-foreground">
                Get notified in your browser when tasks are assigned to you.
              </p>
            </div>
            <Switch checked={pushNotifs} onCheckedChange={setPushNotifs} className="data-[state=checked]:bg-primary" />
          </div>

          <div className="flex items-center justify-between gap-4 p-5 border border-border rounded-xl bg-input-background">
            <div className="space-y-1">
              <Label className="text-sm font-semibold text-foreground">Task Updates</Label>
              <p className="text-xs text-muted-foreground">
                Be notified when tasks you're assigned to are moved or updated.
              </p>
            </div>
            <Switch checked={taskUpdates} onCheckedChange={setTaskUpdates} className="data-[state=checked]:bg-primary" />
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <button
            onClick={handleSave}
            className="w-full sm:w-auto px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-lg flex items-center justify-center gap-2 shadow-sm transition-all duration-200 cursor-pointer text-sm"
          >
            <Save className="w-4 h-4" /> Save Preferences
          </button>
        </div>
      </div>
    </div>
  );
}

