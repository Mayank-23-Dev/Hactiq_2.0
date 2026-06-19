import { BrowserRouter, Routes, Route, useLocation } from "react-router";
import { Toaster } from "sonner";
import { AppProvider } from "./store";
import { AuthProvider } from "../contexts/AuthContext";
import { BoardPage } from "./components/Board";
import Settings from "../pages/Settings";
import { GoalTracker } from "./components/goals/GoalTracker";
import { YesterdayView } from "./components/goals/YesterdayView";
import { CalendarView } from "./components/goals/CalendarView";
import { TemplatesView } from "./components/goals/TemplatesView";
import { StreakGoals } from "./components/goals/StreakGoals";
import { GoalBoard } from "./components/goals/GoalBoard";
import { BackgroundParticles } from "../components/layout/BackgroundParticles";
import ActivitiesPage from "../pages/ActivitiesPage";
import WorkspacesPage from "../pages/WorkspacesPage";
import StatsView from "../pages/StatsView";
import ArchivePage from "../pages/ArchivePage";
import LandingPage from "../pages/LandingPage";
import LoginPage from "../pages/LoginPage";
import SignupPage from "../pages/SignupPage";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { HomeRoute } from "./components/HomeRoute";

function AppBackground() {
  const location = useLocation();
  const isLandingPage = ["/", "/login", "/register"].includes(location.pathname);
  
  return (
    <BackgroundParticles 
      className="fixed inset-0 pointer-events-none z-0" 
      color={isLandingPage ? "#ffffff" : undefined}
      quantity={isLandingPage ? 140 : 80}
      size={isLandingPage ? 0.6 : 0.4}
    />
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <BrowserRouter>
          <AppBackground />
          <Routes>
            {/* Public/Home Routes */}
            <Route path="/" element={<HomeRoute />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<SignupPage />} />

            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/board/:id" element={<BoardPage />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/activities" element={<ActivitiesPage />} />
              <Route path="/boards" element={<WorkspacesPage />} />
              
              {/* Flat navigation routes */}
              <Route path="/today" element={<GoalTracker />} />
              <Route path="/goal-board" element={<GoalBoard />} />
              <Route path="/streak-goals" element={<StreakGoals />} />
              <Route path="/yesterday" element={<YesterdayView />} />
              <Route path="/calendar" element={<CalendarView />} />
              <Route path="/stats" element={<StatsView />} />
              <Route path="/archive" element={<ArchivePage />} />
              <Route path="/templates" element={<TemplatesView />} />
              
              {/* Fallback routes for legacy paths */}
              <Route path="/goals" element={<GoalTracker />} />
              <Route path="/goals/streaks" element={<StreakGoals />} />
              <Route path="/goals/yesterday" element={<YesterdayView />} />
              <Route path="/goals/calendar" element={<CalendarView />} />
              <Route path="/goals/stats" element={<StatsView />} />
              <Route path="/goals/database" element={<ArchivePage />} />
              <Route path="/goals/templates" element={<TemplatesView />} />
              <Route path="/all-goals" element={<ArchivePage />} />
            </Route>
          </Routes>
        </BrowserRouter>
        <Toaster position="bottom-right" richColors />
      </AppProvider>
    </AuthProvider>
  );
}

