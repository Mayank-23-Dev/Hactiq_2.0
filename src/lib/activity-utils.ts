// src/lib/activity-utils.ts
import React from "react";
import { PlusCircle, CheckCircle2, Trash2, ArrowRightCircle, LayoutGrid, Edit3, RotateCcw, Archive } from "lucide-react";

export type ActivityType =
  | 'goal_created'
  | 'goal_completed'
  | 'goal_deleted'
  | 'goal_moved'
  | 'board_created'
  | 'goal_edited'
  | 'carried_forward'
  | 'goal_archived';

// Function to resolve Lucide Icon based on activity type
export function getActivityIcon(type: ActivityType) {
  switch (type) {
    case "goal_created":
      return PlusCircle;
    case "goal_completed":
      return CheckCircle2;
    case "goal_deleted":
      return Trash2;
    case "goal_moved":
      return ArrowRightCircle;
    case "board_created":
      return LayoutGrid;
    case "goal_edited":
      return Edit3;
    case "carried_forward":
      return RotateCcw;
    case "goal_archived":
      return Archive;
    default:
      return PlusCircle;
  }
}

// Function to resolve Tailwind color classes based on activity type
export function getActivityIconColor(type: ActivityType): string {
  switch (type) {
    case "goal_created":
      return "text-blue-500 bg-blue-500/10";
    case "goal_completed":
      return "text-green-500 bg-green-500/10";
    case "goal_deleted":
      return "text-red-500 bg-red-500/10";
    case "goal_moved":
      return "text-indigo-500 bg-indigo-500/10";
    case "board_created":
      return "text-purple-500 bg-purple-500/10";
    case "goal_edited":
      return "text-amber-500 bg-amber-500/10";
    case "carried_forward":
      return "text-teal-500 bg-teal-500/10";
    case "goal_archived":
      return "text-gray-500 bg-gray-500/10";
    default:
      return "text-primary bg-primary/10";
  }
}
