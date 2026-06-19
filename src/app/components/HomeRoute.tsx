// src/app/components/HomeRoute.tsx
import { useAuth } from "../../contexts/AuthContext";
import { Loader2 } from "lucide-react";
import LandingPage from "../../pages/LandingPage";
import { Dashboard } from "./Dashboard";

export function HomeRoute() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#030213] text-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Dashboard />;
  }

  return <LandingPage />;
}
