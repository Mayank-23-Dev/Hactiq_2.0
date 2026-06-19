// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from "react";

export interface UserProfile {
  name: string;
  email: string;
  avatar: string;
  bio?: string;
  avatarUrl?: string;
}

interface AuthContextType {
  userProfile: UserProfile;
  updateUserProfile: (updates: Partial<UserProfile>) => void;
  isAuthenticated: boolean;
  login: () => void;
  logout: () => void;
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
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem("gt_isAuthenticated") === "true";
  });

  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    try {
      const stored = localStorage.getItem("gt_user_profile");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && typeof parsed === "object") {
          return { ...DEFAULT_PROFILE, ...parsed };
        }
      }
    } catch (e) {
      console.error("Failed to parse user profile", e);
    }
    return DEFAULT_PROFILE;
  });

  const login = () => {
    setIsAuthenticated(true);
    localStorage.setItem("gt_isAuthenticated", "true");
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem("gt_isAuthenticated");
    localStorage.removeItem("gt_user_profile");
    setUserProfile(DEFAULT_PROFILE);
  };

  const updateUserProfile = (updates: Partial<UserProfile>) => {
    setUserProfile(prev => {
      const updated = { ...prev, ...updates };
      if (updates.name) {
        const parts = updates.name.trim().split(/\s+/);
        const initials = parts.filter(Boolean).map(p => p[0]).join("").toUpperCase().slice(0, 2);
        updated.avatar = initials || "U";
      }
      localStorage.setItem("gt_user_profile", JSON.stringify(updated));
      return updated;
    });
  };

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "gt_user_profile" && e.newValue) {
        try {
          setUserProfile(JSON.parse(e.newValue));
        } catch (err) {
          console.error(err);
        }
      }
      if (e.key === "gt_isAuthenticated") {
        setIsAuthenticated(e.newValue === "true");
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  return (
    <AuthContext.Provider value={{ userProfile, updateUserProfile, isAuthenticated, login, logout }}>
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
