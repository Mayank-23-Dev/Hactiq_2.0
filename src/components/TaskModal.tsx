"use client"

import * as React from "react"
import { format } from "date-fns"
import { 
  Calendar as CalendarIcon, 
  Trash2, 
  Paperclip, 
  MessageSquare, 
  MoreHorizontal,
  X
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"

interface TaskModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TaskModal({ open, onOpenChange }: TaskModalProps) {
  const [date, setDate] = React.useState<Date | undefined>(new Date(2026, 5, 20))
  const [priority, setPriority] = React.useState("high")
  const [subtasks, setSubtasks] = React.useState([
    { id: "1", title: "Wireframes", completed: true },
    { id: "2", title: "Mockups", completed: false },
    { id: "3", title: "Prototype", completed: false },
  ])

  const completedSubtasks = subtasks.filter((s) => s.completed).length
  const progress = (completedSubtasks / subtasks.length) * 100

  const toggleSubtask = (id: string) => {
    setSubtasks((prev) =>
      prev.map((s) => (s.id === id ? { ...s, completed: !s.completed } : s))
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden gap-0">
        <ScrollArea className="max-h-[90vh]">
          <div className="p-6 space-y-6">
            <DialogHeader className="space-y-3">
              <div className="flex items-center justify-between">
                <DialogTitle className="text-2xl font-bold">Design new onboarding flow</DialogTitle>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-1">
                <Label htmlFor="description" className="text-muted-foreground font-normal">Description</Label>
                <Textarea 
                  id="description"
                  placeholder="Add a more detailed description..." 
                  className="min-h-[100px] resize-none border-none bg-muted/50 focus-visible:ring-0 focus-visible:ring-offset-0 p-3"
                  defaultValue="Create a seamless onboarding experience for new users, focusing on key value propositions and reducing friction during initial setup."
                />
              </div>
            </DialogHeader>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Priority</Label>
                  <Select value={priority} onValueChange={setPriority}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Due Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !date && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Assignees</Label>
                  <div className="flex -space-x-2 overflow-hidden py-1">
                    <Avatar className="inline-block border-2 border-background">
                      <AvatarImage src="https://github.com/shadcn.png" />
                      <AvatarFallback>CN</AvatarFallback>
                    </Avatar>
                    <Avatar className="inline-block border-2 border-background">
                      <AvatarImage src="https://github.com/leerob.png" />
                      <AvatarFallback>LR</AvatarFallback>
                    </Avatar>
                    <Avatar className="inline-block border-2 border-background">
                      <AvatarImage src="https://github.com/evilrabbit.png" />
                      <AvatarFallback>ER</AvatarFallback>
                    </Avatar>
                    <Button variant="outline" size="icon" className="h-10 w-10 rounded-full border-dashed border-2 bg-muted/30">
                      <span className="text-xs">+2</span>
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Labels</Label>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary" className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border-none px-3 py-1">Design</Badge>
                    <Badge variant="secondary" className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 border-none px-3 py-1">UX</Badge>
                    <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-muted-foreground hover:bg-muted">
                      + Add label
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Label className="text-sm font-semibold">Subtasks</Label>
                  <Badge variant="secondary" className="rounded-full px-2 py-0 text-[10px]">
                    {completedSubtasks}/{subtasks.length}
                  </Badge>
                </div>
                <span className="text-xs text-muted-foreground font-medium">{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
              <div className="space-y-3 pt-2">
                {subtasks.map((task) => (
                  <div key={task.id} className="flex items-center space-x-3 group">
                    <Checkbox 
                      id={task.id} 
                      checked={task.completed} 
                      onCheckedChange={() => toggleSubtask(task.id)}
                    />
                    <label
                      htmlFor={task.id}
                      className={cn(
                        "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 transition-colors",
                        task.completed && "text-muted-foreground line-through"
                      )}
                    >
                      {task.title}
                    </label>
                  </div>
                ))}
                <Button variant="ghost" size="sm" className="h-8 -ml-2 text-muted-foreground hover:bg-muted/50">
                  + Add subtask
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-6 pt-2">
              <div className="flex items-center gap-2 text-muted-foreground cursor-pointer hover:text-foreground transition-colors">
                <MessageSquare className="h-4 w-4" />
                <span className="text-sm font-medium">4 comments</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground cursor-pointer hover:text-foreground transition-colors">
                <Paperclip className="h-4 w-4" />
                <span className="text-sm font-medium">2 attachments</span>
              </div>
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="p-6 bg-muted/30 border-t flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <Button variant="ghost" size="sm" className="w-full sm:w-auto text-destructive hover:bg-destructive/10 hover:text-destructive gap-2 justify-center">
            <Trash2 className="h-4 w-4" />
            Delete task
          </Button>
          <div className="flex gap-3 w-full sm:w-auto">
            <Button variant="outline" className="flex-1 sm:flex-none" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button className="flex-1 sm:flex-none" onClick={() => onOpenChange(false)}>Save changes</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
