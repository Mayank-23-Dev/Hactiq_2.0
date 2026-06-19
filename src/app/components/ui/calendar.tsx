"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";

import { cn } from "./utils";
import { buttonVariants } from "./button";

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: React.ComponentProps<typeof DayPicker>) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col sm:flex-row gap-2",
        month: "flex flex-col gap-4",
        caption: "flex justify-center pt-1.5 relative items-center w-full mb-2",
        caption_label: "text-sm font-semibold tracking-tight",
        nav: "flex items-center gap-1",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "size-7 bg-transparent p-0 border border-border/80 hover:bg-muted text-foreground opacity-70 hover:opacity-100 transition-opacity",
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse",
        head_row: "flex mb-1",
        head_cell:
          "text-muted-foreground rounded-md w-8 font-medium text-[0.75rem] uppercase tracking-wider text-center",
        row: "flex w-full mt-1.5",
        cell: cn(
          "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-muted/50 [&:has([aria-selected].day-outside)]:bg-muted/30 [&:has([aria-selected].day-range-end)]:rounded-r-md",
          props.mode === "range"
            ? "[&:has(>.day-range-end)]:rounded-r-md [&:has(>.day-range-start)]:rounded-l-md first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md"
            : "[&:has([aria-selected])]:rounded-md",
        ),
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "size-8 p-0 font-normal text-foreground hover:bg-muted hover:text-foreground aria-selected:opacity-100 transition-all rounded-md",
        ),
        day_range_start:
          "day-range-start aria-selected:bg-foreground aria-selected:text-background",
        day_range_end:
          "day-range-end aria-selected:bg-foreground aria-selected:text-background",
        day_selected:
          "bg-foreground text-background hover:bg-foreground hover:text-background focus:bg-foreground focus:text-background rounded-md font-bold shadow-sm",
        day_today: "bg-muted text-foreground font-bold border border-border/80",
        day_outside:
          "day-outside text-muted-foreground/40 aria-selected:bg-muted/30 aria-selected:text-muted-foreground/50 aria-selected:opacity-30",
        day_disabled: "text-muted-foreground/30 opacity-30",
        day_range_middle:
          "aria-selected:bg-muted aria-selected:text-foreground",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ className, ...props }) => (
          <ChevronLeft className={cn("size-4", className)} {...props} />
        ),
        IconRight: ({ className, ...props }) => (
          <ChevronRight className={cn("size-4", className)} {...props} />
        ),
      }}
      {...props}
    />
  );
}

export { Calendar };
