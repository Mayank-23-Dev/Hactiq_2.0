import { BrowserRouter, Routes, Route } from "react-router";
import { Toaster } from "sonner";
import { AppProvider } from "./store";
import { AuthProvider } from "../contexts/AuthContext";
import { Dashboard } from "./components/Dashboard";
import { BoardPage } from "./components/Board";
import Settings from "../pages/Settings";
import { GoalTracker } from "./components/goals/GoalTracker";
import { YesterdayView } from "./components/goals/YesterdayView";
import { CalendarView } from "./components/goals/CalendarView";
import { StatsView } from "./components/goals/StatsView";
import { GoalDatabase } from "./components/goals/GoalDatabase";
import { TemplatesView } from "./components/goals/TemplatesView";
import { StreakGoals } from "./components/goals/StreakGoals";
import { GoalBoard } from "./components/goals/GoalBoard";
import { BackgroundParticles } from "../components/layout/BackgroundParticles";

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <BackgroundParticles className="fixed inset-0 pointer-events-none z-0" />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/board/:id" element={<BoardPage />} />
            <Route path="/settings" element={<Settings />} />
            
            {/* Goal Tracker Routes */}
            <Route path="/goals" element={<GoalTracker />} />
            <Route path="/goal-board" element={<GoalBoard />} />
            <Route path="/goals/streaks" element={<StreakGoals />} />
            <Route path="/goals/yesterday" element={<YesterdayView />} />
            <Route path="/goals/calendar" element={<CalendarView />} />
            <Route path="/goals/stats" element={<StatsView />} />
            <Route path="/goals/database" element={<GoalDatabase />} />
            <Route path="/goals/templates" element={<TemplatesView />} />
          </Routes>
        </BrowserRouter>
        <Toaster position="bottom-right" richColors />
      </AppProvider>
    </AuthProvider>
  );
}
