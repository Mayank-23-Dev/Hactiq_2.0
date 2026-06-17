import React from "react";
import { Priority } from "../../store";

export function getPriorityColorClass(colorName: string) {
  const map: Record<string, string> = {
    red: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    orange: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
    green: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    blue: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    purple: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
    yellow: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
    indigo: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400",
    pink: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400",
    gray: "bg-gray-100 text-gray-700 dark:bg-gray-800/30 dark:text-gray-400",
  };
  return map[colorName] || "bg-muted text-muted-foreground";
}

export function PriorityBadge({ priorityId, customConfig }: { priorityId: Priority, customConfig: any }) {
  const prio = customConfig.priorities.find((p: any) => p.id === priorityId);
  const label = prio ? prio.name : priorityId;
  const colorClass = prio ? getPriorityColorClass(prio.color) : getPriorityColorClass("gray");

  return (
    <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${colorClass}`}>
      {label}
    </span>
  );
}
