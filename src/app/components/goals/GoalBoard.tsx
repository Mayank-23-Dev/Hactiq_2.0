// src/app/components/goals/GoalBoard.tsx
import React, { useState, useMemo } from "react";
import { Layout } from "../Layout";
import { useApp, Goal } from "../../store";
import { EditGoalDialog } from "./EditGoalDialog";
import { Plus, Trash2, Edit2, CalendarIcon, ChevronRight, ChevronLeft, CheckCircle, Circle, Repeat } from "lucide-react";
import { format } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { PriorityBadge } from "./Shared";
import { DndContext, closestCorners, DragEndEvent, useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export function GoalBoard() {
  const { goals, addGoal, toggleGoal, deleteGoal, updateGoal, customConfig } = useApp();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);

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

  const sortedStages = useMemo(() => {
    return [...customConfig.boardStages].sort((a, b) => a.order - b.order);
  }, [customConfig.boardStages]);

  const handleDragEnd = (event: DragEndEvent) => {
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

  return (
    <Layout title="Goal Board">
      <div className="p-6 max-w-7xl mx-auto h-[calc(100vh-4rem)] flex flex-col">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 shrink-0">
          <div>
            <h1 className="text-3xl font-extrabold text-foreground">Goal Board</h1>
            <p className="text-muted-foreground font-medium">Manage tasks by date.</p>
          </div>
          <div className="flex items-center gap-4">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-[240px] justify-start text-left font-normal bg-card",
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(selectedDate, "PPPP")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <DndContext collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
          <div className="flex-1 flex gap-6 overflow-x-auto pb-4 pt-2 -mx-1 px-1 custom-scrollbar">
            {sortedStages.map((stage, idx) => {
              const columnGoals = dayGoals.filter(g => g.status === stage.id);
              return (
                <div key={stage.id} className="min-w-[300px] flex-1">
                  <BoardColumn 
                    title={stage.name} 
                    goals={columnGoals} 
                    status={stage.id}
                    onMove={(id, dir) => {
                      const nextIdx = idx + (dir === 'next' ? 1 : -1);
                      if (nextIdx >= 0 && nextIdx < sortedStages.length) {
                        moveGoal(id, sortedStages[nextIdx].id);
                      }
                    }}
                    canMoveLeft={idx > 0}
                    canMoveRight={idx < sortedStages.length - 1}
                    onEdit={setEditingGoal}
                    onDelete={deleteGoal}
                    onToggle={toggleGoal}
                    onAdd={() => handleAddNew(stage.id)}
                    customConfig={customConfig}
                  />
                </div>
              );
            })}
          </div>
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
  title, goals, status, onMove, onEdit, onDelete, onToggle, onAdd, customConfig, canMoveLeft, canMoveRight
}: { 
  title: string; goals: Goal[]; status: string;
  onMove: (id: string, direction: 'prev' | 'next') => void;
  onEdit: (g: Goal) => void;
  onDelete: (id: string) => void;
  onToggle: (id: string) => void;
  onAdd: () => void;
  customConfig: any;
  canMoveLeft: boolean;
  canMoveRight: boolean;
}) {
  const { setNodeRef } = useDroppable({
    id: status,
  });

  const goalIds = useMemo(() => goals.map(g => g.id), [goals]);

  return (
    <div ref={setNodeRef} className="flex flex-col bg-muted/50 rounded-xl border border-border h-full overflow-hidden">
      <div className="p-4 border-b border-border bg-card/50 flex justify-between items-center shrink-0">
        <h3 className="font-semibold">{title}</h3>
        <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full font-bold">{goals.length}</span>
      </div>
      <div className="p-3 flex-1 overflow-y-auto space-y-3">
        <SortableContext items={goalIds} strategy={verticalListSortingStrategy}>
          {goals.map(goal => (
            <SortableGoalCard
              key={goal.id}
              goal={goal}
              onToggle={onToggle}
              onEdit={onEdit}
              onDelete={onDelete}
              onMove={onMove}
              canMoveLeft={canMoveLeft}
              canMoveRight={canMoveRight}
              customConfig={customConfig}
            />
          ))}
        </SortableContext>
        <button 
          onClick={onAdd}
          className="w-full py-2 border-2 border-dashed border-border rounded-lg text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors flex items-center justify-center gap-2"
        >
          <Plus size={16} /> Add
        </button>
      </div>
    </div>
  );
}

function SortableGoalCard({ 
  goal, onToggle, onEdit, onDelete, onMove, canMoveLeft, canMoveRight, customConfig 
}: { 
  goal: Goal;
  onToggle: (id: string) => void;
  onEdit: (g: Goal) => void;
  onDelete: (id: string) => void;
  onMove: (id: string, direction: 'prev' | 'next') => void;
  canMoveLeft: boolean;
  canMoveRight: boolean;
  customConfig: any;
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
      className={cn(
        "bg-card p-3 rounded-lg shadow-sm border border-border group relative flex flex-col gap-2 touch-none cursor-grab active:cursor-grabbing",
        isDragging && "opacity-40 scale-[0.98] border-dashed border-primary"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2">
          <button 
            onClick={(e) => { e.stopPropagation(); onToggle(goal.id); }} 
            onPointerDown={(e) => e.stopPropagation()}
            className="text-primary hover:scale-110 transition mt-0.5 shrink-0"
          >
            {goal.completed ? <CheckCircle size={16} /> : <Circle size={16} />}
          </button>
          <h4 className={cn("font-medium text-sm leading-snug", goal.completed && "line-through opacity-50")}>
            {goal.title}
          </h4>
        </div>
      </div>
      
      <div className="flex items-center flex-wrap gap-1.5 ml-6">
        <PriorityBadge priorityId={goal.priority} customConfig={customConfig} />
        <span className="text-[10px] text-muted-foreground bg-accent px-1.5 py-0.5 rounded font-medium">{goal.category}</span>
        {goal.streakId && (
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-accent text-muted-foreground font-bold uppercase flex items-center gap-0.5" title="Part of a streak">
            <Repeat size={10} /> Streak
          </span>
        )}
      </div>

      <div className="flex items-center justify-between mt-2 pt-2 border-t border-border">
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button 
            onClick={(e) => { e.stopPropagation(); onEdit(goal); }} 
            onPointerDown={(e) => e.stopPropagation()}
            className="p-1.5 text-muted-foreground hover:bg-accent rounded-md"
          >
            <Edit2 size={14} />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); onDelete(goal.id); }} 
            onPointerDown={(e) => e.stopPropagation()}
            className="p-1.5 text-destructive hover:bg-destructive/10 rounded-md"
          >
            <Trash2 size={14} />
          </button>
        </div>
        
        <div className="flex items-center gap-1">
          {canMoveLeft && (
            <button 
              onClick={(e) => { e.stopPropagation(); onMove(goal.id, 'prev'); }} 
              onPointerDown={(e) => e.stopPropagation()}
              className="p-1 text-muted-foreground hover:bg-accent rounded" 
              title="Move Left"
            >
              <ChevronLeft size={14} />
            </button>
          )}
          {canMoveRight && (
            <button 
              onClick={(e) => { e.stopPropagation(); onMove(goal.id, 'next'); }} 
              onPointerDown={(e) => e.stopPropagation()}
              className="p-1 text-muted-foreground hover:bg-accent rounded" 
              title="Move Right"
            >
              <ChevronRight size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}