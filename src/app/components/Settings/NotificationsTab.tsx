// src/app/components/settings/NotificationsTab.tsx
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Label } from "@/app/components/ui/label";
import { Switch } from "@/app/components/ui/switch";
import { Button } from "@/app/components/ui/button";
import { toast } from "sonner";

export function NotificationsTab() {
  const [emailDigest, setEmailDigest] = useState(true);
  const [pushNotifs, setPushNotifs] = useState(false);
  const [taskUpdates, setTaskUpdates] = useState(true);

  const handleSave = () => {
    toast.success("Notification preferences saved successfully");
  };

  return (
    <Card className="border border-border bg-card">
      <CardHeader>
        <CardTitle className="text-xl font-bold tracking-tight">Notification Settings</CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          Choose how you want to be notified about workspace updates.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4 p-4 border border-border rounded-lg bg-accent/10">
            <div className="space-y-0.5">
              <Label className="text-sm font-semibold">Email Digest</Label>
              <p className="text-xs text-muted-foreground">
                Receive a daily summary of your board activity via email.
              </p>
            </div>
            <Switch checked={emailDigest} onCheckedChange={setEmailDigest} />
          </div>

          <div className="flex items-center justify-between gap-4 p-4 border border-border rounded-lg bg-accent/10">
            <div className="space-y-0.5">
              <Label className="text-sm font-semibold">Desktop Push Notifications</Label>
              <p className="text-xs text-muted-foreground">
                Get notified in your browser when tasks are assigned to you.
              </p>
            </div>
            <Switch checked={pushNotifs} onCheckedChange={setPushNotifs} />
          </div>

          <div className="flex items-center justify-between gap-4 p-4 border border-border rounded-lg bg-accent/10">
            <div className="space-y-0.5">
              <Label className="text-sm font-semibold">Task Updates</Label>
              <p className="text-xs text-muted-foreground">
                Be notified when tasks you're assigned to are moved or updated.
              </p>
            </div>
            <Switch checked={taskUpdates} onCheckedChange={setTaskUpdates} />
          </div>
        </div>

        <Button onClick={handleSave} className="w-full sm:w-auto">
          Save Preferences
        </Button>
      </CardContent>
    </Card>
  );
}
