// src/app/components/Settings/Profile.tsx
import { useState } from "react";
import { useApp } from "../../store";
import { toast } from "sonner";

export function Profile() {
  const { userProfile, updateUserProfile, getAvatarColor } = useApp();
  const [name, setName] = useState(userProfile.name);
  const [email, setEmail] = useState(userProfile.email);

  return (
    <div className="space-y-6">
      {/* Avatar */}
      <div className="flex items-center gap-5">
        <div 
          className="w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-semibold shrink-0"
          style={{ backgroundColor: getAvatarColor(userProfile.avatar) }}
        >
          {userProfile.avatar}
        </div>
        <div>
          <button className="px-3 py-1.5 text-sm border border-border rounded-md hover:bg-accent transition-colors">
            Upload photo
          </button>
          <p className="text-xs text-muted-foreground mt-1">JPG, PNG, or GIF up to 5MB</p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium text-foreground block mb-1.5">Full name</label>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full px-3 py-2 bg-input-background border border-border rounded-md text-sm outline-none focus:ring-2 focus:ring-ring animate-transition"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-foreground block mb-1.5">Email address</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full px-3 py-2 bg-input-background border border-border rounded-md text-sm outline-none focus:ring-2 focus:ring-ring animate-transition"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-foreground block mb-1.5">Bio</label>
          <textarea
            placeholder="Tell your team about yourself…"
            rows={3}
            className="w-full px-3 py-2 bg-input-background border border-border rounded-md text-sm outline-none focus:ring-2 focus:ring-ring resize-none animate-transition"
          />
        </div>
      </div>

      <button
        onClick={() => {
          updateUserProfile({ name, email });
          toast.success("Profile updated");
        }}
        className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity font-semibold"
      >
        Save changes
      </button>
    </div>
  );
}
