import React, { createContext, useContext, useState, useEffect } from "react";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged, 
  updateProfile,
  sendEmailVerification,
  deleteUser
} from "firebase/auth";
import { auth, googleProvider } from "../lib/firebase";
import { supabase } from "../lib/supabase";
import { toast } from "sonner";

export interface UserProfile {
  name: string;
  email: string;
  avatar: string;
  bio?: string;
  avatarUrl?: string;
}

export interface AuthContextType {
  user: UserProfile | null;
  userProfile: UserProfile;
  isAuthenticated: boolean;
  isLoading: boolean;
  loading: boolean;
  uid: string | null;
  emailVerified: boolean;
  creationTime: string | null;
  resendVerification: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfile: (updates: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

const DEFAULT_PROFILE: UserProfile = {
  name: "Alex Chen",
  email: "alex@company.co",
  avatar: "AC",
  bio: "Product Designer & Developer",
  avatarUrl: ""
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const stored = localStorage.getItem("hactiq_current_user") || localStorage.getItem("gt_user_profile");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [uid, setUid] = useState<string | null>(null);
  const [emailVerified, setEmailVerified] = useState(false);
  const [creationTime, setCreationTime] = useState<string | null>(null);

  // Periodic check for email verification / expiry
  useEffect(() => {
    const currentUser = auth.currentUser;
    if (!currentUser || currentUser.emailVerified) return;

    const checkExpiry = async () => {
      try {
        await currentUser.reload();
      } catch (err) {
        console.error("Failed to reload user metadata:", err);
      }

      if (currentUser.emailVerified) {
        setEmailVerified(true);
        return;
      }

      const creationTimeStr = currentUser.metadata.creationTime;
      const createdAt = creationTimeStr ? new Date(creationTimeStr).getTime() : Date.now();
      const now = Date.now();
      const ONE_HOUR = 60 * 60 * 1000;

      if (now - createdAt > ONE_HOUR) {
        console.log("Unverified account expired (periodic check), deleting user:", currentUser.uid);
        try {
          await deleteUser(currentUser);
        } catch (err) {
          await signOut(auth);
        }
        await supabase.from("profiles").delete().eq("id", currentUser.uid);
        setUser(null);
        setEmailVerified(false);
        setCreationTime(null);
        toast.error("Your account was not verified in time and has been removed. Please sign up again.");
      }
    };

    const interval = setInterval(checkExpiry, 60000); // Check every 60 seconds
    return () => clearInterval(interval);
  }, [user, emailVerified]);

  // Safety timeout: prevent stuck/infinite loading screen if Firebase/Supabase queries hang
  useEffect(() => {
    if (loading) {
      const timer = setTimeout(() => {
        console.warn("Auth loading safety timeout triggered. Forcing loading state to resolve.");
        setLoading(false);
      }, 5000); // 5 seconds safety timeout
      return () => clearTimeout(timer);
    }
  }, [loading]);

  // Helper function to upsert profile info securely in Supabase public.profiles
  const syncUserProfile = async (firebaseUser: any) => {
    try {
      const name = firebaseUser.displayName ?? "User";
      const email = firebaseUser.email ?? "";
      const avatarUrl = firebaseUser.photoURL ?? null;
      const fallbackAvatar = firebaseUser.displayName?.charAt(0).toUpperCase() || "U";

      const profilePayload = {
        id: firebaseUser.uid,
        name,
        email,
        avatar_url: avatarUrl,
        avatar: fallbackAvatar,
        bio: "Product Designer & Developer"
      };

      // Check if the profile exists
      const { data: existingProfile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", firebaseUser.uid)
        .single();

      if (existingProfile) {
        console.log("Profile loaded successfully for ID:", firebaseUser.uid);
        return existingProfile;
      }

      // Upsert profile data
      const { data: profile, error: upsertError } = await supabase
        .from("profiles")
        .upsert(profilePayload, { onConflict: "id" })
        .select()
        .single();

      if (upsertError) {
        console.error("Profile sync failed for UID:", firebaseUser.uid, upsertError.message);
        throw upsertError;
      }

      console.log("Profile created successfully for ID:", firebaseUser.uid);

      // Check if user already has templates to prevent duplicate seeding
      const { data: existingTemplates } = await supabase
        .from("goal_templates")
        .select("id")
        .eq("user_id", firebaseUser.uid)
        .limit(1);

      if (!existingTemplates || existingTemplates.length === 0) {
        // Seed default multi-goal starter templates for new user
        const t1Id = `seed-essentials-${firebaseUser.uid}`;
        const t2Id = `seed-quickwins-${firebaseUser.uid}`;
        const t3Id = `seed-focusblock-${firebaseUser.uid}`;

        const starterTemplates = [
          { id: t1Id, user_id: firebaseUser.uid, name: "Daily Essentials", description: "Core habits to anchor your day" },
          { id: t2Id, user_id: firebaseUser.uid, name: "Quick Wins", description: "Small tasks that build momentum" },
          { id: t3Id, user_id: firebaseUser.uid, name: "Focus Block", description: "Deep work and recovery" }
        ];

        const starterItems = [
          // Daily Essentials
          { id: `seed-ess1-${firebaseUser.uid}`, template_id: t1Id, title: "Plan top 3 priorities for today", category: "Work", priority: "high", notes: "" },
          { id: `seed-ess2-${firebaseUser.uid}`, template_id: t1Id, title: "Drink 8 glasses of water", category: "Health", priority: "medium", notes: "" },
          { id: `seed-ess3-${firebaseUser.uid}`, template_id: t1Id, title: "10-minute evening reflection", category: "Personal", priority: "low", notes: "" },
          
          // Quick Wins
          { id: `seed-qw1-${firebaseUser.uid}`, template_id: t2Id, title: "Clear inbox to zero", category: "Work", priority: "medium", notes: "" },
          { id: `seed-qw2-${firebaseUser.uid}`, template_id: t2Id, title: "Tidy workspace for 5 minutes", category: "Personal", priority: "low", notes: "" },
          { id: `seed-qw3-${firebaseUser.uid}`, template_id: t2Id, title: "Reply to one pending message", category: "Work", priority: "medium", notes: "" },

          // Focus Block
          { id: `seed-fb1-${firebaseUser.uid}`, template_id: t3Id, title: "Deep work session — 45 minutes, no distractions", category: "Work", priority: "high", notes: "" },
          { id: `seed-fb2-${firebaseUser.uid}`, template_id: t3Id, title: "Take a 10-minute walk break", category: "Health", priority: "medium", notes: "" },
          { id: `seed-fb3-${firebaseUser.uid}`, template_id: t3Id, title: "Review tomorrow's calendar", category: "Work", priority: "low", notes: "" }
        ];

        try {
          const { error: seedError } = await supabase.from("goal_templates").insert(starterTemplates);
          if (seedError) {
            console.error("Failed to seed starter templates:", seedError.message);
          } else {
            const { error: itemsError } = await supabase.from("goal_template_items").insert(starterItems);
            if (itemsError) {
              console.error("Failed to seed starter template items:", itemsError.message);
            } else {
              console.log("Starter templates seeded successfully for user:", firebaseUser.uid);
            }
          }
        } catch (err) {
          console.error("Error during template seeding:", err);
        }
      }

      // Ensure user_preferences row exists for the UID
      const { data: existingPrefs } = await supabase
        .from("user_preferences")
        .select("id")
        .eq("id", firebaseUser.uid)
        .single();

      if (!existingPrefs) {
        const { error: prefsError } = await supabase
          .from("user_preferences")
          .upsert({
            id: firebaseUser.uid,
            theme: "system",
            email_digest: true,
            push_notifications: false,
            task_updates: true,
            custom_config: !existingProfile ? {
              boardStages: [
                { id: "todo", name: "todo", order: 1 },
                { id: "in-progress", name: "Inprogress", order: 2 },
                { id: "done", name: "Done", order: 3 }
              ]
            } : {},
            ai_features: {},
            groq_api_key: ""
          });
        if (prefsError) {
          console.error("Failed to initialize user preferences:", prefsError.message);
        }
      }

      return profile;
    } catch (err: any) {
      console.error("Profile sync failed:", err.message || err);
      throw err;
    }
  };

  // Sync state with Firebase Auth changes (Session Persistence)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      const hasCached = !!localStorage.getItem("hactiq_current_user") || !!localStorage.getItem("gt_user_profile");
      if (!hasCached) {
        setIsLoading(true);
      }
      try {
        if (firebaseUser) {
          setUid(firebaseUser.uid);
          // Check if unverified and expired
          if (!firebaseUser.emailVerified) {
            const creationTimeStr = firebaseUser.metadata.creationTime;
            const createdAt = creationTimeStr ? new Date(creationTimeStr).getTime() : Date.now();
            const now = Date.now();
            const ONE_HOUR = 60 * 60 * 1000;

            if (now - createdAt > ONE_HOUR) {
              console.log("Unverified account expired, deleting user:", firebaseUser.uid);
              try {
                await deleteUser(firebaseUser);
              } catch (err) {
                await signOut(auth);
              }
              await supabase.from("profiles").delete().eq("id", firebaseUser.uid);
              setUser(null);
              setEmailVerified(false);
              setCreationTime(null);
              setIsLoading(false);
              setLoading(false);
              toast.error("Your account was not verified in time and has been removed. Please sign up again.");
              return;
            }
          }

          setEmailVerified(firebaseUser.emailVerified);
          setCreationTime(firebaseUser.metadata.creationTime || null);

          try {
            // Sync profile to database and read updated row values
            const profile = await syncUserProfile(firebaseUser);

            if (profile) {
              const userProfileData: UserProfile = {
                name: profile.name,
                email: profile.email,
                avatar: profile.avatar || "U",
                bio: profile.bio || "",
                avatarUrl: profile.avatar_url || ""
              };

              // Save in localStorage for legacy code compatibility
              localStorage.setItem("hactiq_current_user", JSON.stringify(userProfileData));
              localStorage.setItem("gt_user_profile", JSON.stringify(userProfileData));

              setUser(userProfileData);
            }
          } catch (err) {
            console.error("Failed to load or initialize user profile:", err);
          }
        } else {
          setUid(null);
          localStorage.removeItem("hactiq_current_user");
          localStorage.removeItem("gt_user_profile");
          setUser(null);
          setEmailVerified(false);
          setCreationTime(null);
        }
      } finally {
        setIsLoading(false);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      setIsLoading(false);
      throw err;
    }
  };

  const signup = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      // 1. Create firebase user credentials
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      // 2. Send verification email
      await sendEmailVerification(firebaseUser);
      toast.info("Verification email sent. Please verify within 1 hour or your account will be removed.", {
        duration: 8000,
      });

      // 3. Set Firebase Auth display name
      await updateProfile(firebaseUser, { displayName: name });

      // 4. Sync profile immediately with name override
      const updatedUser = {
        ...firebaseUser,
        displayName: name
      };
      await syncUserProfile(updatedUser);

    } catch (err: any) {
      setIsLoading(false);
      throw err;
    }
  };

  const loginWithGoogle = async () => {
    setIsLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      setIsLoading(false);
      throw err;
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      // Clear Firebase session
      await signOut(auth);
    } catch (err: any) {
      console.error("Error signing out:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserProfile = async (updates: Partial<UserProfile>) => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    try {
      if (updates.name) {
        await updateProfile(currentUser, { displayName: updates.name });
      }

      let avatar = user?.avatar;
      if (updates.name) {
        const parts = updates.name.trim().split(/\s+/);
        avatar = parts.filter(Boolean).map(p => p[0]).join("").toUpperCase().slice(0, 2) || "U";
      }

      const { error } = await supabase
        .from("profiles")
        .update({
          name: updates.name,
          email: updates.email,
          bio: updates.bio,
          avatar_url: updates.avatarUrl,
          avatar: avatar
        })
        .eq("id", currentUser.uid);

      if (error) throw error;

      setUser(prev => prev ? {
        ...prev,
        ...updates,
        avatar: avatar || prev.avatar
      } : null);
      
    } catch (err) {
      console.error("Failed to update user profile:", err);
      throw err;
    }
  };

  const resendVerification = async () => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      const lastSent = localStorage.getItem("hactiq_last_verification_sent");
      const now = Date.now();
      if (lastSent && now - parseInt(lastSent) < 60 * 1000) {
        toast.warning("Please wait 1 minute before resending verification email.");
        return;
      }
      try {
        await sendEmailVerification(currentUser);
        localStorage.setItem("hactiq_last_verification_sent", now.toString());
        toast.success("Verification email sent!");
      } catch (err: any) {
        toast.error(err.message || "Failed to send verification email.");
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile: user || DEFAULT_PROFILE,
        isAuthenticated: !!user,
        isLoading,
        loading,
        uid,
        emailVerified,
        creationTime,
        resendVerification,
        login,
        signup,
        loginWithGoogle,
        logout,
        updateUserProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
