// src/app/components/goals/GoalBoard.tsx
import React, { useState, useMemo, useRef, useEffect } from "react";
import { Layout } from "../Layout";
import { useApp, Goal } from "../../store";
import { EditGoalDialog } from "./EditGoalDialog";
import { 
  Plus, 
  Trash2, 
  Edit2, 
  Calendar as CalendarIcon, 
  ChevronRight, 
  ChevronLeft, 
  CheckCircle, 
  Circle, 
  Repeat,
  MoreHorizontal
} from "lucide-react";
import { format } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { PriorityBadge } from "./Shared";
import { 
  DndContext, 
  closestCorners, 
  DragEndEvent, 
  DragStartEvent, 
  useDroppable, 
  useSensor, 
  useSensors, 
  PointerSensor, 
  KeyboardSensor,
  TouchSensor,
  DragOverlay
} from "@dnd-kit/core";
import { 
  SortableContext, 
  verticalListSortingStrategy, 
  useSortable,
  sortableKeyboardCoordinates
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent
} from "@/app/components/ui/dropdown-menu";
import { toast } from "sonner";

// Helpers for card details
const getChecklistProgress = (notes: string) => {
  if (!notes) return null;
  const lines = notes.split("\n");
  const checklistLines = lines.filter(line => /^\s*-\s*\[[ xX]\]/.test(line));
  if (checklistLines.length === 0) return null;
  const completed = checklistLines.filter(line => /^\s*-\s*\[[xX]\]/.test(line)).length;
  const total = checklistLines.length;
  return { completed, total, percent: Math.round((completed / total) * 100) };
};

const getStreakInfoForCard = (streakId: string | undefined, streakGoals: any[], goals: Goal[], dateStr: string) => {
  if (!streakId) return null;
  const streak = streakGoals.find(s => s.id === streakId);
  if (!streak) return null;
  
  const streakInstances = goals
    .filter(g => g.streakId === streakId && g.date <= dateStr)
    .sort((a, b) => b.date.localeCompare(a.date));

  let count = 0;
  for (const instance of streakInstances) {
    if (instance.completed) {
      count++;
    } else {
      if (instance.date !== dateStr) {
        break;
      }
    }
  }
  return { streak, count };
};

export function GoalBoard() {
  const { 
    goals, 
    addGoal, 
    toggleGoal, 
    deleteGoal, 
    updateGoal, 
    customConfig, 
    streakGoals 
  } = useApp();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const dateStr = format(selectedDate, "yyyy-MM-dd");
  
  const dayGoals = useMemo(() => {
    return goals.filter(g => g.date === dateStr);
  }, [goals, dateStr]);

  const moveGoal = (id: string, newStatus: string) => {
    const lastStageId = customConfig.boardStages[customConfig.boardStages.length - 1]?.id;
    updateGoal(id, { status: newStatus, completed: newStatus === lastStageId });
  };

  const handleAddNew = (status: string) => {
    const lastStageId = customConfig.boardStages[customConfig.boardStages.length - 1]?.id;
    addGoal({
      title: "New Goal",
      category: customConfig.categories[0]?.id || "work",
      priority: customConfig.priorities[1]?.id || "medium",
      notes: "",
      completed: status === lastStageId,
      date: dateStr,
      status
    });
  };

  const handleQuickAdd = (title: string, status: string) => {
    const lastStageId = customConfig.boardStages[customConfig.boardStages.length - 1]?.id;
    addGoal({
      title,
      category: customConfig.categories[0]?.id || "work",
      priority: customConfig.priorities[1]?.id || "medium",
      notes: "",
      completed: status === lastStageId,
      date: dateStr,
      status
    });
    toast.success(`Created goal in '${customConfig.boardStages.find(s => s.id === status)?.name}'`);
  };

  const handleArchive = (id: string) => {
    const goal = goals.find(g => g.id === id);
    if (goal) {
      updateGoal(id, { status: "archived" });
      toast.success(`'${goal.title}' archived`);
    }
  };

  const sortedStages = useMemo(() => {
    return [...customConfig.boardStages].sort((a, b) => a.order - b.order);
  }, [customConfig.boardStages]);

  // Setup dnd-kit sensors with touch and pointer configurations
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;
    if (!over) return;

    const goalId = active.id as string;
    const overId = over.id as string;

    const activeGoal = goals.find(g => g.id === goalId);
    if (!activeGoal) return;

    let targetStageId = "";

    const isStage = customConfig.boardStages.some(s => s.id === overId);
    if (isStage) {
      targetStageId = overId;
    } else {
      const overGoal = goals.find(g => g.id === overId);
      if (overGoal) {
        targetStageId = overGoal.status;
      }
    }

    if (targetStageId && targetStageId !== activeGoal.status) {
      moveGoal(goalId, targetStageId);
    }
  };

  const handleDragCancel = () => {
    setActiveId(null);
  };

  // Date Navigation handlers
  const handlePrevDay = () => {
    const prev = new Date(selectedDate);
    prev.setDate(prev.getDate() - 1);
    setSelectedDate(prev);
  };

  const handleNextDay = () => {
    const next = new Date(selectedDate);
    next.setDate(next.getDate() + 1);
    setSelectedDate(next);
  };

  const handleGoToToday = () => {
    setSelectedDate(new Date());
  };

  // Mouse wheel horizontal navigation support
  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;

    const handleWheel = (e: WheelEvent) => {
      if (e.deltaY !== 0 && (e.shiftKey || Math.abs(e.deltaX) === 0)) {
        e.preventDefault();
        el.scrollBy({
          left: e.deltaY * 1.5,
          behavior: "auto"
        });
      }
    };

    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      el.removeEventListener("wheel", handleWheel);
    };
  }, []);

  const activeGoal = activeId ? goals.find(g => g.id === activeId) : null;

  return (
    <Layout title="Goal Board">
      <div className="p-4 sm:p-6 w-full max-w-full lg:px-8 xl:max-w-[1600px] mx-auto h-[calc(100vh-4rem)] flex flex-col">
        {/* Header and Integrated Date Selector */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-5 shrink-0">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Goal Board</h1>
            <p className="text-sm text-muted-foreground mt-0.5 font-medium">Spacious board dashboard matching Hactiq aesthetic.</p>
          </div>
          
          {/* Enhanced date navigation control */}
          <div className="flex items-center gap-2">
            <div className="flex items-center border border-border/80 rounded-xl overflow-hidden bg-card shadow-xs">
              <button 
                onClick={handlePrevDay}
                className="p-2.5 text-muted-foreground hover:text-foreground hover:bg-muted transition cursor-pointer border-r border-border/80"
                title="Previous Day"
              >
                <ChevronLeft size={16} />
              </button>
              
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    className="flex items-center gap-2.5 px-4.5 py-2.5 text-sm font-bold text-foreground/90 hover:text-foreground hover:bg-muted transition cursor-pointer bg-transparent"
                  >
                    <CalendarIcon className="size-4 text-muted-foreground" />
                    <span>{format(selectedDate, "eeee, MMM d, yyyy")}</span>
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => date && setSelectedDate(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>

              <button 
                onClick={handleNextDay}
                className="p-2.5 text-muted-foreground hover:text-foreground hover:bg-muted transition cursor-pointer border-l border-border/80"
                title="Next Day"
              >
                <ChevronRight size={16} />
              </button>
            </div>

            <button 
              onClick={handleGoToToday}
              className="px-3.5 py-2.5 bg-secondary text-secondary-foreground text-sm font-bold rounded-xl border border-border/80 hover:bg-secondary/80 hover:text-foreground transition active:scale-95 cursor-pointer shadow-xs"
            >
              Today
            </button>
          </div>
        </div>

        {/* Board workspace area */}
        <DndContext 
          sensors={sensors}
          collisionDetection={closestCorners} 
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragCancel={handleDragCancel}
        >
          <div 
            ref={scrollContainerRef}
            className="flex-1 flex gap-5 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-4 pt-2 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:mx-0 lg:px-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] select-none"
          >
            {sortedStages.map((stage, idx) => {
              const columnGoals = dayGoals.filter(g => g.status === stage.id);
              return (
                <div 
                  key={stage.id} 
                  className="snap-center shrink-0 w-[85vw] sm:w-[calc(50vw-2.5rem)] lg:w-auto lg:flex-1 min-w-[270px] xl:min-w-[300px] h-full"
                >
                  <BoardColumn 
                    title={stage.name} 
                    goals={columnGoals} 
                    status={stage.id}
                    onMove={(id, dir) => {
                      const nextIdx = idx + (dir === "next" ? 1 : -1);
                      if (nextIdx >= 0 && nextIdx < sortedStages.length) {
                        moveGoal(id, sortedStages[nextIdx].id);
                      }
                    }}
                    canMoveLeft={idx > 0}
                    canMoveRight={idx < sortedStages.length - 1}
                    onEdit={setEditingGoal}
                    onDelete={deleteGoal}
                    onArchive={handleArchive}
                    onMoveToStage={moveGoal}
                    onToggle={toggleGoal}
                    onAdd={() => handleAddNew(stage.id)}
                    onQuickAdd={handleQuickAdd}
                    customConfig={customConfig}
                    streakGoals={streakGoals}
                    allGoals={goals}
                    dateStr={dateStr}
                  />
                </div>
              );
            })}
          </div>

          {/* drag-and-drop preview overlay */}
          <DragOverlay adjustScale={true}>
            {activeGoal ? (
              <GoalCardInner
                goal={activeGoal}
                customConfig={customConfig}
                isOverlay={true}
                streakGoals={streakGoals}
                goals={goals}
                dateStr={dateStr}
              />
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

      <EditGoalDialog 
        goal={editingGoal} 
        open={!!editingGoal} 
        onOpenChange={(open) => !open && setEditingGoal(null)} 
      />
    </Layout>
  );
}

function BoardColumn({ 
  title, 
  goals, 
  status, 
  onMove, 
  onEdit, 
  onDelete, 
  onArchive,
  onMoveToStage,
  onToggle, 
  onAdd, 
  onQuickAdd,
  customConfig, 
  canMoveLeft, 
  canMoveRight,
  streakGoals,
  allGoals,
  dateStr
}: { 
  title: string; 
  goals: Goal[]; 
  status: string;
  onMove: (id: string, direction: "prev" | "next") => void;
  onEdit: (g: Goal) => void;
  onDelete: (id: string) => void;
  onArchive: (id: string) => void;
  onMoveToStage: (id: string, stageId: string) => void;
  onToggle: (id: string) => void;
  onAdd: () => void;
  onQuickAdd: (title: string, status: string) => void;
  customConfig: any;
  canMoveLeft: boolean;
  canMoveRight: boolean;
  streakGoals: any[];
  allGoals: Goal[];
  dateStr: string;
}) {
  const { setNodeRef } = useDroppable({
    id: status,
  });

  const [isQuickCreating, setIsQuickCreating] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const goalIds = useMemo(() => goals.map(g => g.id), [goals]);

  useEffect(() => {
    if (isQuickCreating && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isQuickCreating]);

  const handleQuickSubmit = () => {
    if (!newTitle.trim()) {
      setIsQuickCreating(false);
      return;
    }
    onQuickAdd(newTitle.trim(), status);
    setNewTitle("");
    setIsQuickCreating(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleQuickSubmit();
    } else if (e.key === "Escape") {
      setIsQuickCreating(false);
      setNewTitle("");
    }
  };

  return (
    <div ref={setNodeRef} className="flex flex-col bg-muted/30 rounded-2xl border border-border h-full overflow-hidden">
      {/* Column Header */}
      <div className="px-4.5 py-4 border-b border-border/40 bg-card/40 flex justify-between items-center shrink-0 select-none">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-foreground/60" />
          <h3 className="font-bold text-sm tracking-tight text-foreground/95">{title}</h3>
          <span className="text-[10px] bg-muted/80 text-muted-foreground px-2 py-0.5 rounded-full font-bold">
            {goals.length}
          </span>
        </div>
        <button 
          onClick={() => setIsQuickCreating(true)}
          className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted/80 rounded-lg transition-colors cursor-pointer size-7 flex items-center justify-center border border-transparent hover:border-border/30"
          title="Quick Add Goal"
        >
          <Plus size={14} />
        </button>
      </div>

      {/* Column Scrollable Content */}
      <div className="p-3 flex-1 overflow-y-auto space-y-3 flex flex-col justify-start">
        {goals.length === 0 && !isQuickCreating ? (
          /* Custom styled Empty State */
          <div className="flex-1 flex flex-col items-center justify-center border border-dashed border-border/60 rounded-xl p-6 text-center bg-card/10 select-none my-2 min-h-[160px] animate-fadeIn">
            <div className="size-9 rounded-full bg-muted flex items-center justify-center text-muted-foreground/80 mb-3 border border-border/20">
              <Plus size={16} />
            </div>
            <h4 className="text-xs font-semibold text-foreground/80 mb-1">No goals yet</h4>
            <p className="text-[10px] text-muted-foreground mb-4 max-w-[170px] leading-normal">Add a goal to this column to start tracking your progress.</p>
            <button 
              onClick={() => setIsQuickCreating(true)}
              className="text-[11px] font-bold px-3 py-1.5 bg-foreground text-background rounded-lg hover:opacity-90 active:scale-95 transition-all cursor-pointer"
            >
              Create Goal
            </button>
          </div>
        ) : (
          <SortableContext items={goalIds} strategy={verticalListSortingStrategy}>
            <div className="space-y-3 flex-1">
              {goals.map(goal => (
                <SortableGoalCard
                  key={goal.id}
                  goal={goal}
                  onToggle={onToggle}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onArchive={onArchive}
                  onMoveToStage={onMoveToStage}
                  customConfig={customConfig}
                  streakGoals={streakGoals}
                  goals={allGoals}
                  dateStr={dateStr}
                />
              ))}
            </div>
          </SortableContext>
        )}

        {/* Inline Quick Create card */}
        {isQuickCreating && (
          <div className="bg-card border border-border/80 rounded-xl p-3.5 shadow-xs flex flex-col gap-2 animate-fadeIn">
            <textarea
              ref={inputRef}
              rows={2}
              placeholder="What do you want to achieve?"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full bg-transparent text-sm resize-none outline-none text-foreground border-0 p-0 focus:ring-0 leading-normal"
            />
            <div className="flex items-center justify-end gap-1.5 mt-1 border-t border-border/20 pt-2">
              <button 
                onClick={() => { setIsQuickCreating(false); setNewTitle(""); }}
                className="px-2.5 py-1 text-[11px] font-bold text-muted-foreground hover:bg-muted hover:text-foreground rounded-lg transition cursor-pointer"
              >
                Cancel
              </button>
              <button 
                onClick={handleQuickSubmit}
                className="px-3 py-1 bg-foreground text-background text-[11px] font-bold rounded-lg hover:opacity-90 active:scale-95 transition cursor-pointer"
              >
                Add
              </button>
            </div>
          </div>
        )}

        {/* Footer Add button */}
        {!isQuickCreating && goals.length > 0 && (
          <button 
            onClick={() => setIsQuickCreating(true)}
            className="w-full py-2 border border-dashed border-border/85 hover:border-foreground/30 rounded-xl text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition duration-200 flex items-center justify-center gap-1.5 cursor-pointer mt-1"
          >
            <Plus size={14} /> Add Goal
          </button>
        )}
      </div>
    </div>
  );
}

function SortableGoalCard({ 
  goal, 
  onToggle, 
  onEdit, 
  onDelete, 
  onArchive,
  onMoveToStage, 
  customConfig,
  streakGoals,
  goals,
  dateStr
}: { 
  goal: Goal;
  onToggle: (id: string) => void;
  onEdit: (g: Goal) => void;
  onDelete: (id: string) => void;
  onArchive: (id: string) => void;
  onMoveToStage: (id: string, stageId: string) => void;
  customConfig: any;
  streakGoals: any[];
  goals: Goal[];
  dateStr: string;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: goal.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style}
      {...attributes}
      {...listeners}
      className="touch-none cursor-grab active:cursor-grabbing w-full"
    >
      <GoalCardInner
        goal={goal}
        customConfig={customConfig}
        isDragging={isDragging}
        onToggle={onToggle}
        onEdit={onEdit}
        onDelete={onDelete}
        onArchive={onArchive}
        onMoveToStage={onMoveToStage}
        streakGoals={streakGoals}
        goals={goals}
        dateStr={dateStr}
      />
    </div>
  );
}

function GoalCardInner({
  goal,
  customConfig,
  isDragging = false,
  isOverlay = false,
  onToggle,
  onEdit,
  onDelete,
  onArchive,
  onMoveToStage,
  streakGoals,
  goals,
  dateStr
}: {
  goal: Goal;
  customConfig: any;
  isDragging?: boolean;
  isOverlay?: boolean;
  onToggle?: (id: string) => void;
  onEdit?: (g: Goal) => void;
  onDelete?: (id: string) => void;
  onArchive?: (id: string) => void;
  onMoveToStage?: (id: string, stageId: string) => void;
  streakGoals: any[];
  goals: Goal[];
  dateStr: string;
}) {
  const progress = getChecklistProgress(goal.notes);
  const streakInfo = getStreakInfoForCard(goal.streakId, streakGoals, goals, dateStr);
  const formattedDate = format(new Date(goal.date + "T00:00:00"), "MMM d");
  const otherStages = customConfig.boardStages.filter((s: any) => s.id !== goal.status);

  return (
    <div 
      className={cn(
        "bg-card text-foreground border rounded-xl p-3.5 shadow-xs transition-all duration-200 flex flex-col gap-2.5 group/card select-none text-left w-full",
        isDragging ? "opacity-30 border-dashed border-muted-foreground/30 bg-muted/20" : "border-border/80 hover:border-foreground/20 dark:hover:border-foreground/30 hover:shadow-sm",
        isOverlay && "shadow-xl border-foreground/30 scale-[1.02] cursor-grabbing rotate-1"
      )}
    >
      <div className="flex items-start justify-between gap-2.5">
        <div className="flex items-start gap-2.5 min-w-0 flex-1">
          {onToggle && (
            <button 
              onClick={(e) => { e.stopPropagation(); onToggle(goal.id); }}
              onPointerDown={(e) => e.stopPropagation()}
              className={cn(
                "mt-0.5 shrink-0 rounded-full transition-transform duration-200 active:scale-95 cursor-pointer",
                goal.completed ? "text-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {goal.completed ? (
                <CheckCircle className="size-4.5 fill-foreground text-background stroke-[2.5]" />
              ) : (
                <Circle className="size-4.5 stroke-[1.75]" />
              )}
            </button>
          )}
          <h4 className={cn(
            "text-sm font-semibold tracking-tight leading-snug break-words pr-2 text-foreground/90 group-hover/card:text-foreground", 
            goal.completed && "line-through opacity-45 font-normal"
          )}>
            {goal.title}
          </h4>
        </div>

        {/* Dropdown Actions */}
        {!isOverlay && (
          <div className="shrink-0">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button 
                  onPointerDown={(e) => e.stopPropagation()}
                  className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted opacity-0 group-hover/card:opacity-100 focus:opacity-100 transition-opacity cursor-pointer size-7 flex items-center justify-center border border-transparent focus:border-border"
                >
                  <MoreHorizontal className="size-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                {onEdit && (
                  <DropdownMenuItem onClick={() => onEdit(goal)}>
                    <Edit2 className="mr-2 size-3.5" /> Edit
                  </DropdownMenuItem>
                )}
                {onMoveToStage && otherStages.length > 0 && (
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                      <Repeat className="mr-2 size-3.5" /> Move column
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent className="w-40">
                      {otherStages.map((stage: any) => (
                        <DropdownMenuItem key={stage.id} onClick={() => onMoveToStage(goal.id, stage.id)}>
                          {stage.name}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>
                )}
                {onArchive && (
                  <DropdownMenuItem onClick={() => onArchive(goal.id)}>
                    <Archive className="mr-2 size-3.5 text-muted-foreground" /> Archive Goal
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                {onDelete && (
                  <DropdownMenuItem variant="destructive" onClick={() => {
                    if (confirm("Delete this goal permanently?")) {
                      onDelete(goal.id);
                    }
                  }}>
                    <Trash2 className="mr-2 size-3.5" /> Delete
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>

      {/* Badges/Metadata Row */}
      <div className="flex flex-wrap items-center gap-1.5 min-w-0">
        <PriorityBadge priorityId={goal.priority} customConfig={customConfig} />
        
        <span className="text-[10px] text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
          {goal.category}
        </span>

        {streakInfo && (
          <span 
            className="text-[10px] px-2 py-0.5 rounded-full bg-accent/80 text-foreground font-bold uppercase flex items-center gap-1 border border-border/40"
            title={`Part of recurring streak: ${streakInfo.streak.title}`}
          >
            <Repeat className="size-2.5 stroke-[2.5]" /> 
            {streakInfo.count > 0 ? `🔥 ${streakInfo.count}d` : "Streak"}
          </span>
        )}
      </div>

      {/* Notes preview or checklist progress */}
      {progress && (
        <div className="flex flex-col gap-1.5 mt-1">
          <div className="flex justify-between text-[10px] text-muted-foreground font-semibold">
            <span>Progress</span>
            <span>{progress.completed}/{progress.total} ({progress.percent}%)</span>
          </div>
          <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-foreground transition-all duration-300"
              style={{ width: `${progress.percent}%` }}
            />
          </div>
        </div>
      )}

      {/* Card Footer: Due Date */}
      <div className="flex items-center justify-between text-[10px] text-muted-foreground mt-1 pt-2 border-t border-border/40 font-semibold uppercase tracking-wider">
        <span className="flex items-center gap-1">
          <CalendarIcon className="size-3 text-muted-foreground/60" />
          {formattedDate}
        </span>
      </div>
    </div>
  );
}

// Custom simple Archive icon to replace missing Lucide icons if any, but Archive is standard
import { Archive } from "lucide-react";