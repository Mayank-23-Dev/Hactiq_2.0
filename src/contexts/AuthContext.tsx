// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from "react";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged, 
  updateProfile 
} from "firebase/auth";
import { auth, googleProvider } from "../lib/firebase";
import { supabase, setSupabaseAuth } from "../lib/supabase";

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
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Sync state with Firebase Auth changes (Session Persistence)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setIsLoading(true);
      if (firebaseUser) {
        // Set the active headers for Supabase RLS policies
        setSupabaseAuth(firebaseUser.uid);

        try {
          // Fetch user profile from Supabase
          let { data: profile, error } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", firebaseUser.uid)
            .single();

          if (error || !profile) {
            // Fallback to creating a profile if it doesn't exist yet
            const name = firebaseUser.displayName || "User";
            const email = firebaseUser.email || "";
            const initials = name.split(/\s+/).map(p => p[0]).join("").toUpperCase().slice(0, 2) || "U";
            
            const newProfile = {
              id: firebaseUser.uid,
              name,
              email,
              avatar: initials,
              bio: "Product Designer & Developer",
              avatar_url: firebaseUser.photoURL || ""
            };

            const { error: insertError } = await supabase.from("profiles").insert(newProfile);
            if (insertError) console.error("Error creating profile in Supabase:", insertError);

            // Create default preferences
            await supabase.from("user_preferences").insert({
              id: firebaseUser.uid,
              theme: "system",
              email_digest: true,
              push_notifications: false,
              task_updates: true,
              custom_config: {},
              ai_features: {},
              groq_api_key: ""
            });

            profile = newProfile;
          }

          if (profile) {
            let needsUpdate = false;
            const updates: any = {};

            // Sync Google avatar photoURL if different
            if (firebaseUser.photoURL && profile.avatar_url !== firebaseUser.photoURL) {
              updates.avatar_url = firebaseUser.photoURL;
              profile.avatar_url = firebaseUser.photoURL;
              needsUpdate = true;
            }

            // Sync verified email from Firebase Auth link verification
            if (firebaseUser.email && profile.email !== firebaseUser.email) {
              updates.email = firebaseUser.email;
              profile.email = firebaseUser.email;
              needsUpdate = true;
            }

            if (needsUpdate) {
              const { error: updateError } = await supabase
                .from("profiles")
                .update(updates)
                .eq("id", firebaseUser.uid);
              if (updateError) console.error("Error syncing profile updates to Supabase:", updateError);
            }
          }

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
        } catch (err) {
          console.error("Failed to load or initialize user profile:", err);
        }
      } else {
        localStorage.removeItem("hactiq_current_user");
        localStorage.removeItem("gt_user_profile");
        setUser(null);
        setSupabaseAuth("");
      }
      setIsLoading(false);
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

      // 2. Set Firebase Auth display name
      await updateProfile(firebaseUser, { displayName: name });

      // 3. Create profile in Supabase (will trigger state update in onAuthStateChanged)
      const initials = name.split(/\s+/).map(p => p[0]).join("").toUpperCase().slice(0, 2) || "U";
      
      // Explicitly set Supabase header first for the insert to succeed
      setSupabaseAuth(firebaseUser.uid);

      const newProfile = {
        id: firebaseUser.uid,
        name,
        email,
        avatar: initials,
        bio: "Product Designer & Developer",
        avatar_url: ""
      };

      const { error: insertError } = await supabase.from("profiles").insert(newProfile);
      if (insertError) throw insertError;

      // Create default preferences
      await supabase.from("user_preferences").insert({
        id: firebaseUser.uid,
        theme: "system",
        email_digest: true,
        push_notifications: false,
        task_updates: true,
        custom_config: {},
        ai_features: {},
        groq_api_key: ""
      });

    } catch (err: any) {
      setIsLoading(false);
      throw err;
    }
  };

  const loginWithGoogle = async () => {
    setIsLoading(true);
    try {
      const userCredential = await signInWithPopup(auth, googleProvider);
      const firebaseUser = userCredential.user;
      
      // Ensure Supabase headers are configured
      setSupabaseAuth(firebaseUser.uid);

      // Check if profile exists
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", firebaseUser.uid)
        .single();

      if (!profile) {
        const name = firebaseUser.displayName || "Google User";
        const email = firebaseUser.email || "";
        const initials = name.split(/\s+/).map(p => p[0]).join("").toUpperCase().slice(0, 2) || "U";

        const newProfile = {
          id: firebaseUser.uid,
          name,
          email,
          avatar: initials,
          bio: "Product Designer & Developer",
          avatar_url: firebaseUser.photoURL || ""
        };

        await supabase.from("profiles").insert(newProfile);

        // Insert preferences
        await supabase.from("user_preferences").insert({
          id: firebaseUser.uid,
          theme: "system",
          email_digest: true,
          push_notifications: false,
          task_updates: true,
          custom_config: {},
          ai_features: {},
          groq_api_key: ""
        });
      }
    } catch (err: any) {
      setIsLoading(false);
      throw err;
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
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

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile: user || DEFAULT_PROFILE,
        isAuthenticated: !!user,
        isLoading,
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

