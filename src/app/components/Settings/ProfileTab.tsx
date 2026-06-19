// src/app/components/settings/ProfileTab.tsx
import { useState, useRef } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/app/components/ui/avatar";
import { Label } from "@/app/components/ui/label";
import { toast } from "sonner";
import { Camera, Trash, Mail, User, Info, Save } from "lucide-react";
import { EmailVerificationDialog } from "./EmailVerificationDialog";
import { verifyBeforeUpdateEmail } from "firebase/auth";
import { auth } from "@/lib/firebase";

export function ProfileTab() {
  const { userProfile, updateUserProfile } = useAuth();
  const [name, setName] = useState(userProfile.name);
  const [email, setEmail] = useState(userProfile.email);
  const [bio, setBio] = useState(userProfile.bio || "");
  const [avatarUrl, setAvatarUrl] = useState(userProfile.avatarUrl || "");
  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be under 5MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveAvatar = () => {
    setAvatarUrl("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("Name cannot be empty");
      return;
    }
    try {
      await updateUserProfile({
        name: name.trim(),
        email: email.trim(),
        bio: bio.trim(),
        avatarUrl
      });
      toast.success("Profile saved successfully");
    } catch (err: any) {
      console.error("Failed to save profile:", err);
      toast.error(err.message || "Failed to save profile changes.");
    }
  };

  const handleSendCode = async (newEmail: string) => {
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error("No authenticated user found.");
    
    try {
      // Trigger Firebase email address change verification link
      await verifyBeforeUpdateEmail(currentUser, newEmail.trim());
    } catch (err: any) {
      if (err.code === "auth/requires-recent-login") {
        throw new Error("This operation is sensitive and requires a recent login. Please sign out, sign back in, and try again.");
      }
      throw err;
    }
  };

  const handleVerify = async (newEmail: string, code: string) => {
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error("No authenticated user found.");

    // Reload the user credentials to check if they have clicked the link
    await currentUser.reload();
    const updatedUser = auth.currentUser;

    if (updatedUser && updatedUser.email?.toLowerCase() === newEmail.trim().toLowerCase()) {
      // Complete update on Supabase profile
      await updateUserProfile({
        name: name.trim(),
        email: newEmail.trim(),
        bio: bio.trim(),
        avatarUrl
      });
      setEmail(newEmail.trim());
    } else {
      throw new Error("Please click the verification link sent to your new email inbox first, then click Verify & Save.");
    }
  };

  return (
    <div className="space-y-6 w-full">
      {/* Redesigned Profile Card */}
      <div className="bg-card border border-border rounded-xl p-4 sm:p-8 shadow-sm relative overflow-hidden">
        <div className="flex flex-col gap-2 mb-8 border-b border-border/40 pb-6">
          <h2 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <User className="text-primary w-6 h-6" /> Profile Settings
          </h2>
          <p className="text-sm text-muted-foreground">
            Customize your identity and visual display settings within Hactiq.
          </p>
        </div>

        {/* Two-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Avatar & Mini Bio card */}
          <div className="lg:col-span-4 flex flex-col items-center justify-center p-6 bg-input-background border border-border rounded-2xl text-center">
            <div className="relative group mb-6">
              <Avatar className="w-32 h-32 border-2 border-primary/40 shadow-xl group-hover:border-primary transition-all duration-300">
                {avatarUrl ? (
                  <AvatarImage src={avatarUrl} alt={name} className="object-cover" />
                ) : null}
                <AvatarFallback className="text-4xl font-bold bg-primary/20 text-primary">
                  {userProfile.avatar}
                </AvatarFallback>
              </Avatar>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer"
              >
                <Camera className="w-6 h-6 text-white" />
              </button>
            </div>

            <div className="flex flex-col gap-2 w-full">
              <div className="flex gap-2 justify-center">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 text-xs font-semibold bg-primary hover:bg-primary/95 text-primary-foreground rounded-lg transition-colors cursor-pointer"
                >
                  Change Photo
                </button>
                {avatarUrl && (
                  <button
                    onClick={handleRemoveAvatar}
                    className="px-3 py-1.5 text-xs font-semibold bg-destructive/10 hover:bg-destructive/20 text-destructive rounded-lg transition-colors cursor-pointer"
                  >
                    <Trash className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <p className="text-[11px] text-muted-foreground mt-2">
                JPG, PNG or GIF. Max 5MB.
              </p>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />
            </div>

            {/* Quick Status */}
            <div className="w-full mt-6 pt-6 border-t border-border/40 text-left space-y-2.5">
              <div className="text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">Joined:</span> Active Session
              </div>
              <div className="text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">Status:</span> Connected
              </div>
            </div>
          </div>

          {/* Right Column: Form Inputs */}
          <div className="lg:col-span-8 space-y-6">
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="name" className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                  Full Name
                </Label>
                <input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Alex Chen"
                  className="w-full h-11 px-4 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-150"
                />
              </div>

              <div className="grid gap-2">
                <Label className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                  Email Address
                </Label>
                <div
                  onClick={() => setIsEmailDialogOpen(true)}
                  className="flex items-center justify-between bg-input-background hover:bg-muted/40 transition border border-border rounded-lg h-11 px-4 cursor-pointer text-foreground text-sm select-none"
                >
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span>{email}</span>
                  </div>
                  <span className="text-xs font-semibold text-primary hover:underline">Verify Change</span>
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="bio" className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                  Bio
                </Label>
                <textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell your team about yourself..."
                  rows={4}
                  className="w-full p-4 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-150 resize-none"
                />
              </div>
            </div>

            {/* Prominent Action Bar */}
            <div className="pt-4 flex justify-end">
              <button
                onClick={handleSave}
                className="w-full sm:w-auto px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-lg flex items-center justify-center gap-2 shadow-sm transition-all duration-200 cursor-pointer text-sm"
              >
                <Save className="w-4 h-4" /> Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>

      <EmailVerificationDialog
        open={isEmailDialogOpen}
        onOpenChange={setIsEmailDialogOpen}
        currentEmail={email}
        onSendCode={handleSendCode}
        onVerify={handleVerify}
      />
    </div>
  );
}
