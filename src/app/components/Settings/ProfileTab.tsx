// src/app/components/settings/ProfileTab.tsx
import { useState, useRef } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Textarea } from "@/app/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/app/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Label } from "@/app/components/ui/label";
import { toast } from "sonner";
import { Camera, Trash, Pencil, Mail } from "lucide-react";
import { EmailVerificationDialog } from "./EmailVerificationDialog";

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

  const handleSave = () => {
    if (!name.trim()) {
      toast.error("Name cannot be empty");
      return;
    }
    updateUserProfile({
      name: name.trim(),
      email: email.trim(),
      bio: bio.trim(),
      avatarUrl
    });
    toast.success("Profile saved successfully");
  };

  const handleSendCode = async (newEmail: string) => {
    // Simulate sending a verification code
    await new Promise((resolve) => setTimeout(resolve, 1000));
    console.log(`Verification code sent to ${newEmail}`);
  };

  const handleVerify = async (newEmail: string, code: string) => {
    // Simulate verification check
    await new Promise((resolve, reject) => {
      setTimeout(() => {
        if (code.length === 6) {
          resolve(true);
        } else {
          reject(new Error("The verification code is incorrect."));
        }
      }, 1200);
    });

    // Update email state and save changes
    setEmail(newEmail);
    updateUserProfile({
      name: name.trim(),
      email: newEmail.trim(),
      bio: bio.trim(),
      avatarUrl
    });
  };

  return (
    <>
      <Card className="border border-border bg-card">
        <CardHeader>
          <CardTitle className="text-xl font-bold tracking-tight">Profile Information</CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            Update your account details and profile photo.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Avatar Section */}
          <div className="flex flex-col sm:flex-row items-center gap-6 pb-4 border-b border-border">
            <Avatar className="w-24 h-24 border border-border shadow-sm">
              {avatarUrl ? (
                <AvatarImage src={avatarUrl} alt={name} className="object-cover" />
              ) : null}
              <AvatarFallback className="text-2xl font-semibold bg-primary text-primary-foreground">
                {userProfile.avatar}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col gap-2">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <Camera size={14} />
                  Upload Photo
                </Button>
                {avatarUrl && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleRemoveAvatar}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <Trash size={14} />
                    Remove
                  </Button>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Allowed JPG, PNG or GIF. Max size of 5MB.
              </p>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />
            </div>
          </div>

          {/* Inputs */}
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="name" className="text-sm font-semibold">Full Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Alex Chen"
                className="bg-background border-input text-foreground h-10 px-3 py-2 outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div className="grid gap-2">
              <Label className="text-sm font-semibold">Email Address</Label>
              <div
                onClick={() => setIsEmailDialogOpen(true)}
                className="flex items-center justify-between bg-muted/40 hover:bg-muted/70 transition border border-input rounded-lg h-10 px-3 py-2 cursor-pointer text-foreground text-sm select-none"
              >
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span>{email}</span>
                </div>
                <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="bio" className="text-sm font-semibold">Bio</Label>
              <Textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell your team about yourself..."
                rows={4}
                className="resize-none bg-background border-input text-foreground px-3 py-2 outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          <Button onClick={handleSave} className="w-full sm:w-auto cursor-pointer">
            Save Changes
          </Button>
        </CardContent>
      </Card>

      <EmailVerificationDialog
        open={isEmailDialogOpen}
        onOpenChange={setIsEmailDialogOpen}
        currentEmail={email}
        onSendCode={handleSendCode}
        onVerify={handleVerify}
      />
    </>
  );
}
