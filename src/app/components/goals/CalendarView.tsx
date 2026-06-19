import React, { useState } from "react";
import { createPortal } from "react-dom";
import { Layout } from "../Layout";
import { useApp, Goal } from "../../store";
import { ChevronLeft, ChevronRight, X, Edit2 } from "lucide-react";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, 
  startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, 
  isSameDay, isToday, parseISO
} from "date-fns";
import { EditGoalDialog } from "./EditGoalDialog";
import { PriorityBadge } from "./Shared";

export function CalendarView() {
  const { goals, dailyMetadata, customConfig } = useApp();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);

  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const goToToday = () => setCurrentDate(new Date());

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const calendarDays = eachDayOfInterval({
    start: startDate,
    end: endDate
  });

  const getDayGoals = (date: Date) => {
    const dStr = format(date, "yyyy-MM-dd");
    return goals.filter(g => g.date === dStr);
  };

  const dayMeta = selectedDay ? dailyMetadata[selectedDay] : null;
  const dayGoals = selectedDay ? goals.filter(g => g.date === selectedDay) : [];

  return (
    <Layout title="Goal Calendar">
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <h1 className="text-3xl font-extrabold text-foreground">Goal Calendar</h1>
          <div className="flex items-center space-x-2">
            <button onClick={prevMonth} className="p-2 hover:bg-accent rounded-full transition"><ChevronLeft size={20} /></button>
            <h2 className="text-xl font-bold w-48 text-center">{format(currentDate, "MMMM yyyy")}</h2>
            <button onClick={nextMonth} className="p-2 hover:bg-accent rounded-full transition"><ChevronRight size={20} /></button>
            <button onClick={goToToday} className="ml-4 bg-secondary hover:bg-secondary/80 text-secondary-foreground font-semibold py-1.5 px-4 rounded-lg transition text-sm">Today</button>
          </div>
        </div>

        <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
          <div className="grid grid-cols-7 bg-accent/50 border-b border-border">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
              <div key={day} className="py-3 text-center text-xs font-bold text-muted-foreground uppercase tracking-wider">
                <span className="hidden sm:inline">{day}</span>
                <span className="sm:hidden">{day.substring(0, 1)}</span>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {calendarDays.map((day, idx) => {
              const dStr = format(day, "yyyy-MM-dd");
              const dGoals = getDayGoals(day);
              const isCurrentMonth = isSameMonth(day, monthStart);
              const isDayToday = isToday(day);
              
              let statusClass = "";
              if (dGoals.length > 0) {
                statusClass = dGoals.every(g => g.completed) ? "bg-green-500/10 dark:bg-green-500/20" : "bg-red-500/10 dark:bg-red-500/20";
              }

              return (
                <div 
                  key={idx}
                  onClick={() => setSelectedDay(dStr)}
                  className={`h-16 sm:h-32 border-r border-b border-border p-1.5 sm:p-2 cursor-pointer hover:bg-accent/50 transition relative ${!isCurrentMonth ? "opacity-30" : ""} ${statusClass}`}
                >
                  <span className={`text-xs sm:text-sm font-bold w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center rounded-full ${isDayToday ? "bg-primary text-primary-foreground" : "text-foreground"}`}>
                    {format(day, "d")}
                  </span>
                  {dGoals.length > 0 && (
                    <div className="mt-1 sm:mt-2 text-[9px] sm:text-[10px] font-medium text-muted-foreground hidden sm:block">{dGoals.length} Goals</div>
                  )}
                  <div className="mt-1 flex gap-0.5 flex-wrap">
                    {dGoals.map(g => (
                      <div key={g.id} className={`w-1.5 h-1.5 rounded-full ${g.completed ? "bg-green-500" : "bg-red-400"}`} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Day Details Modal */}
      {selectedDay && createPortal(
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4" onClick={() => setSelectedDay(null)}>
          <div className="bg-card rounded-xl shadow-2xl max-w-lg w-full p-6 border border-border" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">{format(parseISO(selectedDay), "EEEE, MMMM do")}</h2>
              <button onClick={() => setSelectedDay(null)} className="text-muted-foreground hover:text-foreground transition"><X size={20} /></button>
            </div>
            
            <div className="bg-accent/30 p-4 rounded-lg mb-6 flex justify-between">
              <div><span className="text-xs uppercase font-bold text-muted-foreground">Mood</span><div className="font-semibold">{dayMeta?.mood || "N/A"}</div></div>
              <div><span className="text-xs uppercase font-bold text-muted-foreground">Energy</span><div className="font-semibold">{dayMeta?.energy || "N/A"}</div></div>
              <div><span className="text-xs uppercase font-bold text-muted-foreground">Completion</span><div className="font-semibold">{dayGoals.length > 0 ? Math.round((dayGoals.filter(g => g.completed).length / dayGoals.length) * 100) : 0}%</div></div>
            </div>

            <div className="space-y-3 mb-6">
              <h3 className="font-bold text-sm text-muted-foreground uppercase">Goals</h3>
              {dayGoals.length === 0 ? (
                <p className="text-muted-foreground italic">No goals this day.</p>
              ) : (
                dayGoals.map(g => (
                  <div key={g.id} className="flex items-center justify-between p-2 border border-border rounded-lg bg-background group">
                    <span className={g.completed ? "line-through text-muted-foreground" : "font-medium"}>{g.title}</span>
                    <div className="flex items-center gap-2">
                      <PriorityBadge priorityId={g.priority} customConfig={customConfig} />
                      <button onClick={() => setEditingGoal(g)} className="p-1.5 text-muted-foreground hover:bg-accent rounded-md md:opacity-0 md:group-hover:opacity-100 transition-opacity" title="Edit Goal">
                        <Edit2 size={14} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="pt-4 border-t border-border">
              <button 
                onClick={() => setSelectedDay(null)}
                className="w-full bg-primary text-primary-foreground font-bold py-2 rounded-lg transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
      <EditGoalDialog 
        goal={editingGoal} 
        open={!!editingGoal} 
        onOpenChange={(open) => !open && setEditingGoal(null)} 
      />
    </Layout>
  );
}
