// src/app/components/HomeRoute.tsx
import { useAuth } from "../../contexts/AuthContext";
import { Loader2 } from "lucide-react";
import LandingPage from "../../pages/LandingPage";
import { Dashboard } from "./Dashboard";

export function HomeRoute() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-transparent text-foreground flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-foreground" />
        <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-mono select-none">Loading...</p>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Dashboard />;
  }

  return <LandingPage />;
}
