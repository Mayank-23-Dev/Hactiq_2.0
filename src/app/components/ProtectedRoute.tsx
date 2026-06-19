// src/app/components/ProtectedRoute.tsx
import { Navigate, Outlet } from "react-router";
import { useAuth } from "../../contexts/AuthContext";
import { Loader2 } from "lucide-react";

export function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-transparent text-foreground flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-foreground" />
        <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-mono select-none">Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
