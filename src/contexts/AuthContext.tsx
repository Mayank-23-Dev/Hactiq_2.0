// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from "react";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithRedirect, 
  getRedirectResult, 
  signOut, 
  onAuthStateChanged, 
  updateProfile 
} from "firebase/auth";
import { auth, googleProvider } from "../lib/firebase";
import { supabase, createAuthenticatedSupabaseClient, resetSupabaseClient } from "../lib/supabase";

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
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const stored = localStorage.getItem("hactiq_current_user") || localStorage.getItem("gt_user_profile");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [isLoading, setIsLoading] = useState(() => {
    try {
      const stored = localStorage.getItem("hactiq_current_user") || localStorage.getItem("gt_user_profile");
      return !stored;
    } catch {
      return true;
    }
  });

  // Safety timeout: prevent stuck/infinite loading screen if Firebase/Supabase queries hang
  useEffect(() => {
    if (isLoading) {
      const timer = setTimeout(() => {
        console.warn("Auth loading safety timeout triggered. Forcing loading state to resolve.");
        setIsLoading(false);
      }, 5000); // 5 seconds safety timeout
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  // Helper function to upsert profile info securely in Supabase public.profiles
  const syncUserProfile = async (firebaseUser: any, supabaseClient: any) => {
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

      // Check if the profile exists to differentiate between create/update events in logs
      const { data: existingProfile } = await supabaseClient
        .from("profiles")
        .select("id")
        .eq("id", firebaseUser.uid)
        .single();

      // Upsert profile data
      const { data: profile, error: upsertError } = await supabaseClient
        .from("profiles")
        .upsert(profilePayload, { onConflict: "id" })
        .select()
        .single();

      if (upsertError) {
        console.error("Profile sync failed for UID:", firebaseUser.uid, upsertError.message);
        throw upsertError;
      }

      if (existingProfile) {
        console.log("Profile updated successfully for ID:", firebaseUser.uid);
      } else {
        console.log("Profile created successfully for ID:", firebaseUser.uid);
      }

      // Ensure user_preferences row exists for the UID
      const { data: existingPrefs } = await supabaseClient
        .from("user_preferences")
        .select("id")
        .eq("id", firebaseUser.uid)
        .single();

      if (!existingPrefs) {
        const { error: prefsError } = await supabaseClient
          .from("user_preferences")
          .upsert({
            id: firebaseUser.uid,
            theme: "system",
            email_digest: true,
            push_notifications: false,
            task_updates: true,
            custom_config: {},
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
      if (firebaseUser) {
        try {
          // Get the Firebase ID token
          const token = await firebaseUser.getIdToken();
          
          // Create the authenticated client using the token
          const authSupabase = createAuthenticatedSupabaseClient(token);

          // Sync profile to database and read updated row values using the authenticated client
          const profile = await syncUserProfile(firebaseUser, authSupabase);

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
        localStorage.removeItem("hactiq_current_user");
        localStorage.removeItem("gt_user_profile");
        setUser(null);
        resetSupabaseClient();
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Handle redirect result on mount
  useEffect(() => {
    const handleRedirect = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result) {
          console.log("Google redirect sign-in successful:", result.user);
        }
      } catch (err: any) {
        console.error("Error during Google redirect resolution:", err);
      }
    };
    handleRedirect();
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

      // Explicitly set Supabase header and session first for the insert to succeed
      const token = await firebaseUser.getIdToken();
      const authSupabase = createAuthenticatedSupabaseClient(token);

      // 3. Sync profile immediately with name override
      const updatedUser = {
        ...firebaseUser,
        displayName: name
      };
      await syncUserProfile(updatedUser, authSupabase);

    } catch (err: any) {
      setIsLoading(false);
      throw err;
    }
  };

  const loginWithGoogle = async () => {
    setIsLoading(true);
    try {
      await signInWithRedirect(auth, googleProvider);
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
