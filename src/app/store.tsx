// src/app/store.tsx
import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { useTheme } from "next-themes";
import { useAuth } from "../contexts/AuthContext";
import { format, subDays, eachDayOfInterval } from "date-fns";
import { supabase } from "../lib/supabase";
import { auth } from "../lib/firebase";

export type Priority = string;

export interface Goal {
  id: string;
  title: string;
  category: string;
  priority: string;
  completed: boolean;
  date: string; // YYYY-MM-DD
  notes: string;
  streakId?: string;
  status: string;
}

export interface StreakGoal {
  id: string;
  title: string;
  category: string;
  priority: string;
  notes: string;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  frequency: 'daily' | 'weekdays' | 'weekends' | 'custom';
  customDays?: number[]; // 0=Sun..6=Sat
  active: boolean;
  createdAt: string;
}

export interface GoalTemplate {
  id: string;
  title: string;
  category: string;
  priority: string;
  notes: string;
}

export interface DayMetadata {
  mood?: string;
  energy?: string;
}

export interface UserProfile {
  name: string;
  email: string;
  avatar: string;
  bio?: string;
  avatarUrl?: string;
}

export interface CustomConfig {
  categories: { id: string; name: string; order: number }[];
  priorities: { id: string; name: string; color: string; order: number }[];
  moods: { id: string; name: string; order: number }[];
  energies: { id: string; name: string; order: number }[];
  boardStages: { id: string; name: string; order: number }[];
  personaTemplates: {
    id: string;
    name: string;
    description?: string;
    defaultCategoryId?: string;
    defaultPriorityId?: string;
    sampleGoalTitle?: string;
  }[];
}

export type ActivityType =
  | 'goal_created'
  | 'goal_completed'
  | 'goal_deleted'
  | 'goal_moved'
  | 'board_created'
  | 'goal_edited'
  | 'carried_forward'
  | 'goal_archived';

export interface Activity {
  id: string;
  userId: string;
  type: ActivityType;
  message: string;
  boardName?: string;
  goalTitle?: string;
  timestamp: string; // ISO String to persist
  read: boolean;
}

const initialCustomConfig: CustomConfig = {
  categories: [
    { id: "health", name: "Health", order: 1 },
    { id: "work", name: "Work", order: 2 },
    { id: "personal", name: "Personal", order: 3 },
    { id: "learning", name: "Learning", order: 4 },
    { id: "other", name: "Other", order: 5 }
  ],
  priorities: [
    { id: "high", name: "High", color: "red", order: 1 },
    { id: "medium", name: "Medium", color: "orange", order: 2 },
    { id: "low", name: "Low", color: "green", order: 3 }
  ],
  moods: [
    { id: "Good", name: "Good", order: 1 },
    { id: "Okay", name: "Okay", order: 2 },
    { id: "Bad", name: "Bad", order: 3 }
  ],
  energies: [
    { id: "High", name: "High", order: 1 },
    { id: "Medium", name: "Medium", order: 2 },
    { id: "Low", name: "Low", order: 3 }
  ],
  boardStages: [
    { id: "todo", name: "To Do", order: 1 },
    { id: "in-progress", name: "In Progress", order: 2 },
    { id: "done", name: "Done", order: 3 }
  ],
  personaTemplates: [
    { id: "pt1", name: "Student", description: "Focus on studies", defaultCategoryId: "learning", defaultPriorityId: "high", sampleGoalTitle: "Study for 2 hours" },
    { id: "pt2", name: "Freelancer", description: "Client work", defaultCategoryId: "work", defaultPriorityId: "high", sampleGoalTitle: "Complete client deliverable" },
    { id: "pt3", name: "Manager", description: "Team leadership", defaultCategoryId: "work", defaultPriorityId: "medium", sampleGoalTitle: "1-on-1 team sync" },
    { id: "pt4", name: "Fitness Enthusiast", description: "Workout and diet", defaultCategoryId: "health", defaultPriorityId: "high", sampleGoalTitle: "Go to the gym" },
    { id: "pt5", name: "Developer", description: "Coding and projects", defaultCategoryId: "work", defaultPriorityId: "medium", sampleGoalTitle: "Write unit tests" },
    { id: "pt6", name: "Writer", description: "Writing goals", defaultCategoryId: "personal", defaultPriorityId: "medium", sampleGoalTitle: "Write 500 words" },
    { id: "pt7", name: "Entrepreneur", description: "Business growth", defaultCategoryId: "work", defaultPriorityId: "high", sampleGoalTitle: "Review business metrics" },
    { id: "pt8", name: "Parent", description: "Family time", defaultCategoryId: "personal", defaultPriorityId: "high", sampleGoalTitle: "Quality time with kids" },
    { id: "pt9", name: "Teacher", description: "Class prep", defaultCategoryId: "work", defaultPriorityId: "medium", sampleGoalTitle: "Prepare lesson plan" },
    { id: "pt10", name: "Artist", description: "Creative work", defaultCategoryId: "personal", defaultPriorityId: "medium", sampleGoalTitle: "Spend 1 hour drawing" },
  ]
};

export interface Subtask {
  id: string;
  title: string;
  done: boolean;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  dueDate: string;
  assignees: string[];
  labels: string[];
  subtasks: Subtask[];
  comments: number;
  attachments: number;
  columnId: string;
  boardId: string;
}

export interface Column {
  id: string;
  title: string;
  boardId: string;
}

export interface Board {
  id: string;
  name: string;
  description: string;
  color: string;
  lastModified: string;
}

export interface ActivityItem {
  id: string;
  text: string;
  time: string;
  boardName: string;
}

const AVATARS = ["AC", "BK", "CL", "DM", "EW"];
const AVATAR_COLORS = ["#6366f1", "#ec4899", "#f59e0b", "#10b981", "#3b82f6"];

const initialBoards: Board[] = [
  { id: "b1", name: "Product Roadmap", description: "Q3 feature planning and delivery", color: "#6366f1", lastModified: "2026-06-12" },
  { id: "b2", name: "Marketing Campaign", description: "Summer launch campaign tasks", color: "#ec4899", lastModified: "2026-06-11" },
  { id: "b3", name: "Bug Tracker", description: "Known issues and fixes", color: "#f59e0b", lastModified: "2026-06-10" },
  { id: "b4", name: "Design System", description: "Component library updates", color: "#10b981", lastModified: "2026-06-09" },
];

const initialColumns: Column[] = [
  { id: "c1", title: "To Do", boardId: "b1" },
  { id: "c2", title: "In Progress", boardId: "b1" },
  { id: "c3", title: "Done", boardId: "b1" },
  { id: "c4", title: "To Do", boardId: "b2" },
  { id: "c5", title: "In Progress", boardId: "b2" },
  { id: "c6", title: "Done", boardId: "b2" },
  { id: "c7", title: "To Do", boardId: "b3" },
  { id: "c8", title: "In Progress", boardId: "b3" },
  { id: "c9", title: "Done", boardId: "b3" },
  { id: "c10", title: "To Do", boardId: "b4" },
  { id: "c11", title: "In Progress", boardId: "b4" },
  { id: "c12", title: "Done", boardId: "b4" },
];

const initialTasks: Task[] = [
  {
    id: "t1", title: "Design new onboarding flow", description: "Create wireframes and high-fidelity mockups for the new user onboarding experience.",
    priority: "high", dueDate: "2026-06-20", assignees: ["AC", "BK"], labels: ["Design", "UX"],
    subtasks: [{ id: "s1", title: "Wireframes", done: true }, { id: "s2", title: "Mockups", done: false }, { id: "s3", title: "Prototype", done: false }],
    comments: 4, attachments: 2, columnId: "c1", boardId: "b1",
  },
  {
    id: "t2", title: "Implement authentication", description: "Add OAuth2 login with Google and GitHub providers.",
    priority: "high", dueDate: "2026-06-18", assignees: ["CL"], labels: ["Backend", "Security"],
    subtasks: [{ id: "s4", title: "Google OAuth", done: true }, { id: "s5", title: "GitHub OAuth", done: true }],
    comments: 2, attachments: 0, columnId: "c2", boardId: "b1",
  },
  {
    id: "t3", title: "Write API documentation", description: "Document all REST endpoints with examples and response schemas.",
    priority: "medium", dueDate: "2026-06-25", assignees: ["DM", "EW"], labels: ["Docs"],
    subtasks: [{ id: "s6", title: "Auth endpoints", done: false }, { id: "s7", title: "User endpoints", done: false }],
    comments: 1, attachments: 1, columnId: "c1", boardId: "b1",
  },
  {
    id: "t4", title: "Set up CI/CD pipeline", description: "Configure GitHub Actions for automated testing and deployment.",
    priority: "medium", dueDate: "2026-06-15", assignees: ["AC"], labels: ["DevOps"],
    subtasks: [{ id: "s8", title: "Test runner", done: true }, { id: "s9", title: "Deploy job", done: true }],
    comments: 0, attachments: 0, columnId: "c3", boardId: "b1",
  },
  {
    id: "t5", title: "Homepage redesign", description: "Revamp the marketing homepage for summer campaign.",
    priority: "high", dueDate: "2026-06-22", assignees: ["BK", "CL"], labels: ["Marketing", "Design"],
    subtasks: [{ id: "s10", title: "Hero section", done: true }, { id: "s11", title: "Features grid", done: false }],
    comments: 6, attachments: 3, columnId: "c4", boardId: "b2",
  },
  {
    id: "t6", title: "Social media assets", description: "Create banners and posts for Instagram, Twitter, LinkedIn.",
    priority: "low", dueDate: "2026-06-17", assignees: ["DM"], labels: ["Design"],
    subtasks: [], comments: 2, attachments: 5, columnId: "c5", boardId: "b2",
  },
  {
    id: "t7", title: "Fix login redirect bug", description: "Users are redirected to 404 after password reset on mobile.",
    priority: "high", dueDate: "2026-06-14", assignees: ["EW"], labels: ["Bug", "Mobile"],
    subtasks: [{ id: "s12", title: "Reproduce", done: true }, { id: "s13", title: "Fix", done: false }],
    comments: 3, attachments: 0, columnId: "c7", boardId: "b3",
  },
  {
    id: "t8", title: "Memory leak in dashboard", description: "Component unmount not cleaning up event listeners.",
    priority: "medium", dueDate: "2026-06-16", assignees: ["AC", "CL"], labels: ["Bug", "Frontend"],
    subtasks: [{ id: "s14", title: "Profile memory", done: true }],
    comments: 1, attachments: 0, columnId: "c8", boardId: "b3",
  },
];

const initialActivity: ActivityItem[] = [
  { id: "a1", text: 'Moved "Design new onboarding flow" to In Progress', time: "2 min ago", boardName: "Product Roadmap" },
  { id: "a2", text: 'Created task "Fix login redirect bug"', time: "1 hr ago", boardName: "Bug Tracker" },
  { id: "a3", text: 'Completed "Set up CI/CD pipeline"', time: "3 hrs ago", boardName: "Product Roadmap" },
  { id: "a4", text: 'Added comment on "Homepage redesign"', time: "5 hrs ago", boardName: "Marketing Campaign" },
  { id: "a5", text: 'Assigned "Memory leak in dashboard" to AC', time: "Yesterday", boardName: "Bug Tracker" },
];

const todayStr = new Date().toISOString().split("T")[0];
const yesterdayStr = new Date(Date.now() - 86400000).toISOString().split("T")[0];

const initialGoals: Goal[] = [
  { id: "g1", title: "Morning Exercise", category: "Health", priority: "high", completed: true, date: todayStr, notes: "Felt great!", status: "done" },
  { id: "g2", title: "Learn 5 new JS patterns", category: "Learning", priority: "medium", completed: false, date: todayStr, notes: "", status: "todo" },
  { id: "g3", title: "Complete Project Report", category: "Work", priority: "high", completed: true, date: yesterdayStr, notes: "Sent to boss.", status: "done" },
  { id: "g4", title: "Read 20 pages", category: "Personal", priority: "low", completed: false, date: yesterdayStr, notes: "", status: "todo" }
];

const initialTemplates: GoalTemplate[] = [
  { id: "gt1", title: "Meditation", category: "Health", priority: "medium", notes: "15 minutes mindfulness" },
  { id: "gt2", title: "Inbox Zero", category: "Work", priority: "high", notes: "Clear all emails" }
];

const initialMetadata: Record<string, DayMetadata> = {
  [todayStr]: { mood: "Good", energy: "High" }
};

export interface AppState {
  boards: Board[];
  columns: Column[];
  tasks: Task[];
  activity: ActivityItem[];
  theme: "light" | "dark" | "system";
  avatarColors: Record<string, string>;
  goals: Goal[];
  streakGoals: StreakGoal[];
  templates: GoalTemplate[];
  dailyMetadata: Record<string, DayMetadata>;
  groqApiKey: string;
  aiFeaturesConfig: Record<string, boolean>;
  customConfig: CustomConfig;
  userProfile: UserProfile;
  activities: Activity[];
}

export interface AppContextValue extends AppState {
  createBoard: (name: string, description: string, color: string) => void;
  deleteBoard: (id: string) => void;
  createTask: (boardId: string, columnId: string, title: string) => Task;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  moveTask: (taskId: string, toColumnId: string) => void;
  updateColumn: (id: string, title: string) => void;
  deleteColumn: (id: string) => void;
  setTheme: (theme: "light" | "dark" | "system") => void;
  getAvatarColor: (initials: string) => string;
  // Goal Tracker Methods
  addGoal: (goal: Omit<Goal, "id">) => void;
  updateGoal: (id: string, updates: Partial<Goal>) => void;
  deleteGoal: (id: string) => void;
  toggleGoal: (id: string) => void;
  carryForwardGoal: (id: string) => void;
  // Streak Goals
  addStreakGoal: (streakGoal: Omit<StreakGoal, "id" | "createdAt">) => void;
  updateStreakGoal: (id: string, updates: Partial<StreakGoal>) => void;
  deleteStreakGoal: (id: string) => void;
  regenerateAllStreakGoals: () => void;
  generateMissingStreakInstances: (streak: StreakGoal, currentGoals: Goal[]) => Goal[];
  // Templates & Metadata
  addTemplate: (template: Omit<GoalTemplate, "id">) => void;
  deleteTemplate: (id: string) => void;
  setDayMetadata: (date: string, metadata: Partial<DayMetadata>) => void;
  // AI Config
  setGroqApiKey: (key: string) => void;
  toggleAiFeature: (featureKey: string, enabled: boolean) => void;
  updateCustomConfig: (updates: Partial<CustomConfig>) => void;
  // User Profile
  updateUserProfile: (profile: Partial<UserProfile>) => void;
  // Activity Logging System Actions
  addActivity: (activity: Omit<Activity, 'id' | 'timestamp' | 'userId' | 'read'>) => void;
  markAllActivitiesAsRead: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const safeParse = <T,>(key: string, fallback: T): T => {
    try {
      const item = localStorage.getItem(key);
      if (!item || item === "null" || item === "undefined") return fallback;
      const parsed = JSON.parse(item);
      if (Array.isArray(fallback) && !Array.isArray(parsed)) return fallback;
      if (
        fallback && typeof fallback === "object" && !Array.isArray(fallback) &&
        parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ) {
        return { ...fallback, ...parsed };
      }
      return parsed;
    } catch (e) {
      return fallback;
    }
  };

  const [boards, setBoards] = useState<Board[]>(() => safeParse("gt_boards", initialBoards));
  const [columns, setColumns] = useState<Column[]>(() => safeParse("gt_columns", initialColumns));
  const [tasks, setTasks] = useState<Task[]>(() => safeParse("gt_tasks", initialTasks));
  const [activity, setActivity] = useState<ActivityItem[]>(() => safeParse("gt_activity", initialActivity));
  const [goals, setGoals] = useState<Goal[]>(() => safeParse("gt_goals", initialGoals));
  const [streakGoals, setStreakGoals] = useState<StreakGoal[]>(() => safeParse("gt_streak_goals", []));
  const [templates, setTemplates] = useState<GoalTemplate[]>(() => safeParse("gt_templates", initialTemplates));
  const [dailyMetadata, setDailyMetadata] = useState<Record<string, DayMetadata>>(() => safeParse("gt_metadata", initialMetadata));
  const [groqApiKey, setGroqApiKeyInternal] = useState<string>(() => {
    const fromLocal = safeParse("gt_groq_api_key", "");
    return fromLocal || import.meta.env.VITE_GROQ_API_KEY || "";
  });
  const [customConfig, setCustomConfig] = useState<CustomConfig>(() => safeParse("gt_custom_config", initialCustomConfig));
  const { user, isAuthenticated, userProfile, updateUserProfile } = useAuth();
  const [activities, setActivities] = useState<Activity[]>(() => safeParse("gt_activities", []));

  const [aiFeaturesConfig, setAiFeaturesConfig] = useState<Record<string, boolean>>(() => safeParse("gt_ai_features", {
    naturalLanguageEntry: true,
    autoCategorization: true,
    dailyBriefing: true,
    smartRescheduling: true,
    autoReflection: true,
    aiInsights: true,
    smartTemplates: true,
    voiceEntry: true,
    goalDecomposition: true,
    predictiveAlert: true
  }));

  // Local storage synchronization for offline / guest use
  useEffect(() => {
    if (!isAuthenticated) {
      localStorage.setItem("gt_boards", JSON.stringify(boards));
      localStorage.setItem("gt_columns", JSON.stringify(columns));
      localStorage.setItem("gt_tasks", JSON.stringify(tasks));
      localStorage.setItem("gt_activity", JSON.stringify(activity));
      localStorage.setItem("gt_goals", JSON.stringify(goals));
      localStorage.setItem("gt_streak_goals", JSON.stringify(streakGoals));
      localStorage.setItem("gt_templates", JSON.stringify(templates));
      localStorage.setItem("gt_metadata", JSON.stringify(dailyMetadata));
      localStorage.setItem("gt_groq_api_key", JSON.stringify(groqApiKey));
      localStorage.setItem("gt_ai_features", JSON.stringify(aiFeaturesConfig));
      localStorage.setItem("gt_custom_config", JSON.stringify(customConfig));
      localStorage.setItem("gt_activities", JSON.stringify(activities));
    }
  }, [boards, columns, tasks, activity, goals, streakGoals, templates, dailyMetadata, groqApiKey, aiFeaturesConfig, customConfig, activities, isAuthenticated]);

  // Load from Supabase on Login / Auth changes
  useEffect(() => {
    if (!isAuthenticated) {
      // Revert to local guest data
      setBoards(safeParse("gt_boards", initialBoards));
      setColumns(safeParse("gt_columns", initialColumns));
      setTasks(safeParse("gt_tasks", initialTasks));
      setActivity(safeParse("gt_activity", initialActivity));
      setGoals(safeParse("gt_goals", initialGoals));
      setStreakGoals(safeParse("gt_streak_goals", []));
      setTemplates(safeParse("gt_templates", initialTemplates));
      setDailyMetadata(safeParse("gt_metadata", initialMetadata));
      setGroqApiKeyInternal(safeParse("gt_groq_api_key", import.meta.env.VITE_GROQ_API_KEY || ""));
      setCustomConfig(safeParse("gt_custom_config", initialCustomConfig));
      setActivities(safeParse("gt_activities", []));
      return;
    }

    const loadData = async () => {
      try {
        const userId = auth.currentUser?.uid;
        if (!userId) return;

        // 1. Fetch user preferences
        const { data: prefs } = await supabase
          .from("user_preferences")
          .select("*")
          .eq("id", userId)
          .single();

        if (prefs) {
          if (prefs.groq_api_key) {
            setGroqApiKeyInternal(prefs.groq_api_key);
          }
          if (prefs.custom_config && Object.keys(prefs.custom_config).length > 0) {
            setCustomConfig({ ...initialCustomConfig, ...prefs.custom_config });
          }
          if (prefs.ai_features && Object.keys(prefs.ai_features).length > 0) {
            setAiFeaturesConfig(prev => ({ ...prev, ...prefs.ai_features }));
          }
        }

        // 2. Fetch boards
        const { data: fetchedBoards } = await supabase
          .from("boards")
          .select("*")
          .eq("user_id", userId);

        if (fetchedBoards) {
          const mappedBoards = fetchedBoards.map(b => ({
            id: b.id,
            name: b.name,
            description: b.description || "",
            color: b.color || "#6366f1",
            lastModified: b.last_modified
          }));
          setBoards(mappedBoards);
        }

        // 3. Fetch columns & tasks
        if (fetchedBoards && fetchedBoards.length > 0) {
          const boardIds = fetchedBoards.map(b => b.id);
          const { data: fetchedColumns } = await supabase
            .from("columns")
            .select("*")
            .in("board_id", boardIds);
          
          if (fetchedColumns) {
            setColumns(fetchedColumns.map(c => ({
              id: c.id,
              title: c.title,
              boardId: c.board_id
            })));
          }

          const { data: fetchedTasks } = await supabase
            .from("tasks")
            .select("*")
            .in("board_id", boardIds);

          if (fetchedTasks) {
            setTasks(fetchedTasks.map(t => ({
              id: t.id,
              title: t.title,
              description: t.description || "",
              priority: t.priority || "medium",
              dueDate: t.due_date || "",
              assignees: t.assignees || [],
              labels: t.labels || [],
              subtasks: t.subtasks || [],
              comments: t.comments || 0,
              attachments: t.attachments || 0,
              columnId: t.column_id,
              boardId: t.board_id
            })));
          }
        } else {
          setColumns([]);
          setTasks([]);
        }

        // 4. Fetch goals
        const { data: fetchedGoals } = await supabase
          .from("goals")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false });

        if (fetchedGoals) {
          setGoals(fetchedGoals.map(g => ({
            id: g.id,
            title: g.title,
            category: g.category || "Other",
            priority: g.priority || "medium",
            completed: g.completed,
            date: g.date,
            notes: g.notes || "",
            streakId: g.streak_id || undefined,
            status: g.status || "todo"
          })));
        }

        // 5. Fetch streak goals
        const { data: fetchedStreakGoals } = await supabase
          .from("streak_goals")
          .select("*")
          .eq("user_id", userId);

        if (fetchedStreakGoals) {
          setStreakGoals(fetchedStreakGoals.map(sg => ({
            id: sg.id,
            title: sg.title,
            category: sg.category || "Other",
            priority: sg.priority || "medium",
            notes: sg.notes || "",
            startDate: sg.start_date,
            endDate: sg.end_date,
            frequency: sg.frequency as any,
            customDays: sg.custom_days || [],
            active: sg.active,
            createdAt: sg.created_at
          })));
        }

        // 6. Fetch templates
        const { data: fetchedTemplates } = await supabase
          .from("goal_templates")
          .select("*")
          .eq("user_id", userId);

        if (fetchedTemplates) {
          setTemplates(fetchedTemplates.map(t => ({
            id: t.id,
            title: t.title,
            category: t.category || "Other",
            priority: t.priority || "medium",
            notes: t.notes || ""
          })));
        }

        // 7. Fetch day metadata
        const { data: fetchedMetadata } = await supabase
          .from("day_metadata")
          .select("*")
          .eq("user_id", userId);

        if (fetchedMetadata) {
          const metaRecord: Record<string, DayMetadata> = {};
          fetchedMetadata.forEach(m => {
            metaRecord[m.date] = {
              mood: m.mood || undefined,
              energy: m.energy || undefined
            };
          });
          setDailyMetadata(metaRecord);
        }

        // 8. Fetch activities feed
        const { data: fetchedActivities } = await supabase
          .from("activities")
          .select("*")
          .eq("user_id", userId)
          .order("timestamp", { ascending: false })
          .limit(100);

        if (fetchedActivities) {
          setActivities(fetchedActivities.map(act => ({
            id: act.id,
            userId: act.user_id,
            type: act.type as any,
            message: act.message,
            boardName: act.board_name || undefined,
            goalTitle: act.goal_title || undefined,
            timestamp: act.timestamp,
            read: act.read
          })));
          
          setActivity(fetchedActivities.slice(0, 10).map(act => ({
            id: act.id,
            text: act.message,
            time: "Synced",
            boardName: act.board_name || ""
          })));
        }

      } catch (err) {
        console.error("Error loading user data from Supabase:", err);
      }
    };

    loadData();
  }, [isAuthenticated]);
  
  const { theme: nextTheme, setTheme: setNextTheme } = useTheme();

  const theme = (nextTheme || "system") as "light" | "dark" | "system";
  const setTheme = useCallback((t: "light" | "dark" | "system") => {
    setNextTheme(t);
    const userId = auth.currentUser?.uid;
    if (userId && isAuthenticated) {
      supabase.from("user_preferences").upsert({
        id: userId,
        theme: t
      }).then(({ error }) => {
        if (error) console.error("Error syncing theme to preferences:", error);
      });
    }
  }, [setNextTheme, isAuthenticated]);

  const toggleAiFeature = useCallback((featureKey: string, enabled: boolean) => {
    setAiFeaturesConfig(prev => {
      const updated = { ...prev, [featureKey]: enabled };
      const userId = auth.currentUser?.uid;
      if (userId && isAuthenticated) {
        supabase.from("user_preferences").upsert({
          id: userId,
          ai_features: updated
        }).then(({ error }) => {
          if (error) console.error("Error syncing AI feature config:", error);
        });
      }
      return updated;
    });
  }, [isAuthenticated]);

  const updateCustomConfig = useCallback((updates: Partial<CustomConfig>) => {
    setCustomConfig(prev => {
      const updated = { ...prev, ...updates };
      const userId = auth.currentUser?.uid;
      if (userId && isAuthenticated) {
        supabase.from("user_preferences").upsert({
          id: userId,
          custom_config: updated
        }).then(({ error }) => {
          if (error) console.error("Error syncing custom configurations:", error);
        });
      }
      return updated;
    });
  }, [isAuthenticated]);

  const avatarColorMap: Record<string, string> = {};
  AVATARS.forEach((a, i) => { avatarColorMap[a] = AVATAR_COLORS[i]; });

  const getAvatarColor = (initials: string) => avatarColorMap[initials] ?? "#6366f1";

  // Activity Logger Action
  const addActivity = useCallback((act: Omit<Activity, 'id' | 'timestamp' | 'userId' | 'read'>) => {
    const userId = auth.currentUser?.uid;
    const newActivity: Activity = {
      id: `act_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: userId || "guest_user",
      timestamp: new Date().toISOString(),
      read: false,
      ...act
    };

    setActivities(prev => [newActivity, ...prev].slice(0, 100));

    // Keep the legacy simple activity list updated
    setActivity(prev => [{
      id: `a${Date.now()}`, text: act.message, time: "just now", boardName: act.boardName || ""
    }, ...prev.slice(0, 9)]);

    if (userId && isAuthenticated) {
      supabase.from("activities").insert({
        id: newActivity.id,
        user_id: userId,
        type: newActivity.type,
        message: newActivity.message,
        board_name: newActivity.boardName,
        goal_title: newActivity.goalTitle,
        timestamp: newActivity.timestamp,
        read: newActivity.read
      }).then(({ error }) => {
        if (error) console.error("Error recording activity in database:", error);
      });
    }
  }, [isAuthenticated]);

  const markAllActivitiesAsRead = useCallback(() => {
    setActivities(prev => prev.map(a => a.read ? a : { ...a, read: true }));
    const userId = auth.currentUser?.uid;
    if (userId && isAuthenticated) {
      supabase.from("activities")
        .update({ read: true })
        .eq("user_id", userId)
        .eq("read", false)
        .then(({ error }) => {
          if (error) console.error("Error marking database activities as read:", error);
        });
    }
  }, [isAuthenticated]);

  const createBoard = useCallback((name: string, description: string, color: string) => {
    const userId = auth.currentUser?.uid;
    const id = `b${Date.now()}`;
    const lastMod = new Date().toISOString().split("T")[0];
    const newBoard: Board = { id, name, description, color, lastModified: lastMod };

    const col1Id = `c${Date.now()}1`;
    const col2Id = `c${Date.now()}2`;
    const col3Id = `c${Date.now()}3`;

    setBoards(prev => [...prev, newBoard]);
    setColumns(prev => [
      ...prev,
      { id: col1Id, title: "To Do", boardId: id },
      { id: col2Id, title: "In Progress", boardId: id },
      { id: col3Id, title: "Done", boardId: id },
    ]);

    if (userId && isAuthenticated) {
      // 1. Insert Board
      supabase.from("boards").insert({
        id,
        user_id: userId,
        name,
        description,
        color,
        last_modified: lastMod
      }).then(({ error }) => {
        if (error) console.error("Error creating board in database:", error);
      });

      // 2. Insert Columns
      supabase.from("columns").insert([
        { id: col1Id, board_id: id, title: "To Do" },
        { id: col2Id, board_id: id, title: "In Progress" },
        { id: col3Id, board_id: id, title: "Done" }
      ]).then(({ error }) => {
        if (error) console.error("Error creating board columns in database:", error);
      });
    }

    addActivity({
      type: 'board_created',
      message: `Created board '${name}'`,
      boardName: name
    });
  }, [addActivity, isAuthenticated]);

  const deleteBoard = useCallback((id: string) => {
    setBoards(prev => prev.filter(b => b.id !== id));
    setColumns(prev => prev.filter(c => c.boardId !== id));
    setTasks(prev => prev.filter(t => t.boardId !== id));

    const userId = auth.currentUser?.uid;
    if (userId && isAuthenticated) {
      supabase.from("boards")
        .delete()
        .eq("id", id)
        .eq("user_id", userId)
        .then(({ error }) => {
          if (error) console.error("Error deleting board from database:", error);
        });
    }
  }, [isAuthenticated]);

  const createTask = useCallback((boardId: string, columnId: string, title: string): Task => {
    const board = boards.find(b => b.id === boardId);
    const id = `t${Date.now()}`;
    const newTask: Task = {
      id, title, description: "", priority: "medium",
      dueDate: "", assignees: [], labels: [], subtasks: [], comments: 0, attachments: 0,
      columnId, boardId,
    };

    setTasks(prev => [...prev, newTask]);

    const userId = auth.currentUser?.uid;
    if (userId && isAuthenticated) {
      supabase.from("tasks").insert({
        id,
        board_id: boardId,
        column_id: columnId,
        title,
        description: "",
        priority: "medium",
        due_date: "",
        assignees: [],
        labels: [],
        subtasks: []
      }).then(({ error }) => {
        if (error) console.error("Error creating task in database:", error);
      });
    }

    addActivity({
      type: 'goal_created',
      message: `Created task '${title}'`,
      boardName: board?.name ?? "",
      goalTitle: title
    });
    return newTask;
  }, [boards, addActivity, isAuthenticated]);

  const updateTask = useCallback((id: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(t => {
      if (t.id === id) {
        addActivity({
          type: 'goal_edited',
          message: `Updated task '${updates.title || t.title}'`,
          goalTitle: updates.title || t.title
        });

        if (isAuthenticated) {
          supabase.from("tasks")
            .update({
              title: updates.title,
              description: updates.description,
              priority: updates.priority,
              due_date: updates.dueDate,
              assignees: updates.assignees,
              labels: updates.labels,
              subtasks: updates.subtasks,
              comments: updates.comments,
              attachments: updates.attachments,
              column_id: updates.columnId
            })
            .eq("id", id)
            .then(({ error }) => {
              if (error) console.error("Error updating database task:", error);
            });
        }

        return { ...t, ...updates };
      }
      return t;
    }));
  }, [addActivity, isAuthenticated]);

  const deleteTask = useCallback((id: string) => {
    setTasks(prev => {
      const task = prev.find(t => t.id === id);
      const board = boards.find(b => b.id === task?.boardId);
      if (task) {
        addActivity({
          type: 'goal_deleted',
          message: `Deleted task '${task.title}'`,
          boardName: board?.name ?? "",
          goalTitle: task.title
        });

        if (isAuthenticated) {
          supabase.from("tasks")
            .delete()
            .eq("id", id)
            .then(({ error }) => {
              if (error) console.error("Error deleting database task:", error);
            });
        }
      }
      return prev.filter(t => t.id !== id);
    });
  }, [boards, addActivity, isAuthenticated]);

  const moveTask = useCallback((taskId: string, toColumnId: string) => {
    setTasks(prev => {
      const task = prev.find(t => t.id === taskId);
      const toCol = columns.find(c => c.id === toColumnId);
      const board = boards.find(b => b.id === task?.boardId);
      if (task && toCol) {
        addActivity({
          type: 'goal_moved',
          message: `Moved '${task.title}' to ${toCol.title}`,
          boardName: board?.name ?? "",
          goalTitle: task.title
        });

        if (isAuthenticated) {
          supabase.from("tasks")
            .update({ column_id: toColumnId })
            .eq("id", taskId)
            .then(({ error }) => {
              if (error) console.error("Error moving task in database:", error);
            });
        }
      }
      return prev.map(t => t.id === taskId ? { ...t, columnId: toColumnId } : t);
    });
  }, [columns, boards, addActivity, isAuthenticated]);

  const updateColumn = useCallback((id: string, title: string) => {
    setColumns(prev => prev.map(c => c.id === id ? { ...c, title } : c));
    if (isAuthenticated) {
      supabase.from("columns")
        .update({ title })
        .eq("id", id)
        .then(({ error }) => {
          if (error) console.error("Error updating database column:", error);
        });
    }
  }, [isAuthenticated]);

  const deleteColumn = useCallback((id: string) => {
    setColumns(prev => prev.filter(c => c.id !== id));
    setTasks(prev => prev.filter(t => t.columnId !== id));
    if (isAuthenticated) {
      supabase.from("columns")
        .delete()
        .eq("id", id)
        .then(({ error }) => {
          if (error) console.error("Error deleting database column:", error);
        });
    }
  }, [isAuthenticated]);

  // Goal Tracker Methods
  const addGoal = useCallback((goal: Omit<Goal, "id">) => {
    const userId = auth.currentUser?.uid;
    const newId = `g${Date.now()}_${Math.random().toString(36).substr(2,9)}`;
    const newGoal = { id: newId, ...goal };

    setGoals(prev => [newGoal, ...prev]);

    if (userId && isAuthenticated) {
      supabase.from("goals").insert({
        id: newId,
        user_id: userId,
        title: goal.title,
        category: goal.category,
        priority: goal.priority,
        completed: goal.completed,
        date: goal.date,
        notes: goal.notes,
        streak_id: goal.streakId,
        status: goal.status
      }).then(({ error }) => {
        if (error) console.error("Error saving goal in database:", error);
      });
    }

    addActivity({
      type: 'goal_created',
      message: `Created task '${goal.title}'`,
      goalTitle: goal.title
    });
  }, [addActivity, isAuthenticated]);

  const updateGoal = useCallback((id: string, updates: Partial<Goal>) => {
    setGoals(prev => prev.map(g => {
      if (g.id === id) {
        if (updates.completed !== undefined && updates.completed !== g.completed) {
          addActivity({
            type: 'goal_completed',
            message: updates.completed ? `Completed '${g.title}'` : `Reopened '${g.title}'`,
            goalTitle: g.title
          });
        } else if (updates.status !== undefined && updates.status !== g.status) {
          const stageName = customConfig.boardStages.find(s => s.id === updates.status)?.name || updates.status;
          addActivity({
            type: 'goal_moved',
            message: `Moved '${g.title}' to ${stageName}`,
            goalTitle: g.title
          });
        } else if (updates.title !== undefined && updates.title !== g.title) {
          addActivity({
            type: 'goal_edited',
            message: `Updated '${updates.title}'`,
            goalTitle: updates.title
          });
        }

        if (isAuthenticated) {
          supabase.from("goals").update({
            title: updates.title,
            category: updates.category,
            priority: updates.priority,
            completed: updates.completed,
            date: updates.date,
            notes: updates.notes,
            streak_id: updates.streakId,
            status: updates.status
          }).eq("id", id).then(({ error }) => {
            if (error) console.error("Error updating goal in database:", error);
          });
        }

        return { ...g, ...updates };
      }
      return g;
    }));
  }, [addActivity, customConfig.boardStages, isAuthenticated]);

  const deleteGoal = useCallback((id: string) => {
    setGoals(prev => {
      const g = prev.find(x => x.id === id);
      if (g) {
        addActivity({
          type: 'goal_deleted',
          message: `Deleted '${g.title}'`,
          goalTitle: g.title
        });

        if (isAuthenticated) {
          supabase.from("goals").delete().eq("id", id).then(({ error }) => {
            if (error) console.error("Error deleting goal from database:", error);
          });
        }
      }
      return prev.filter(x => x.id !== id);
    });
  }, [addActivity, isAuthenticated]);

  const toggleGoal = useCallback((id: string) => {
    setGoals(prev => prev.map(g => {
      if (g.id === id) {
        const nextCompleted = !g.completed;
        addActivity({
          type: 'goal_completed',
          message: nextCompleted ? `Completed '${g.title}'` : `Reopened '${g.title}'`,
          goalTitle: g.title
        });

        if (isAuthenticated) {
          supabase.from("goals").update({
            completed: nextCompleted,
            status: nextCompleted ? "done" : "todo"
          }).eq("id", id).then(({ error }) => {
            if (error) console.error("Error toggling database goal completed:", error);
          });
        }

        return { ...g, completed: nextCompleted, status: nextCompleted ? "done" : "todo" };
      }
      return g;
    }));
  }, [addActivity, isAuthenticated]);

  const carryForwardGoal = useCallback((id: string) => {
    const userId = auth.currentUser?.uid;
    setGoals(prev => {
      const goal = prev.find(g => g.id === id);
      if (goal) {
        const todayStr = format(new Date(), "yyyy-MM-dd");
        const newId = `g${Date.now()}_${Math.random().toString(36).substr(2,9)}`;
        const updated = [{
          ...goal,
          id: newId,
          date: todayStr,
          completed: false,
          status: "todo"
        }, ...prev];

        if (userId && isAuthenticated) {
          supabase.from("goals").insert({
            id: newId,
            user_id: userId,
            title: goal.title,
            category: goal.category,
            priority: goal.priority,
            completed: false,
            date: todayStr,
            notes: goal.notes,
            streak_id: goal.streakId,
            status: "todo"
          }).then(({ error }) => {
            if (error) console.error("Error saving carried forward goal in database:", error);
          });
        }

        addActivity({
          type: 'carried_forward',
          message: `Carried forward '${goal.title}'`,
          goalTitle: goal.title
        });
        return updated;
      }
      return prev;
    });
  }, [addActivity, isAuthenticated]);

  const addTemplate = useCallback((template: Omit<GoalTemplate, "id">) => {
    const userId = auth.currentUser?.uid;
    const newId = `gt${Date.now()}`;
    setTemplates(prev => [{ id: newId, ...template }, ...prev]);

    if (userId && isAuthenticated) {
      supabase.from("goal_templates").insert({
        id: newId,
        user_id: userId,
        title: template.title,
        category: template.category,
        priority: template.priority,
        notes: template.notes
      }).then(({ error }) => {
        if (error) console.error("Error inserting template into database:", error);
      });
    }
  }, [isAuthenticated]);

  const deleteTemplate = useCallback((id: string) => {
    setTemplates(prev => prev.filter(t => t.id !== id));
    if (isAuthenticated) {
      supabase.from("goal_templates")
        .delete()
        .eq("id", id)
        .then(({ error }) => {
          if (error) console.error("Error deleting database template:", error);
        });
    }
  }, [isAuthenticated]);

  const setDayMetadata = useCallback((date: string, metadata: Partial<DayMetadata>) => {
    const userId = auth.currentUser?.uid;
    setDailyMetadata(prev => {
      const existing = prev[date] || {};
      const updatedValue = { ...existing, ...metadata };

      if (userId && isAuthenticated) {
        supabase.from("day_metadata").upsert({
          user_id: userId,
          date: date,
          mood: updatedValue.mood,
          energy: updatedValue.energy
        }).then(({ error }) => {
          if (error) console.error("Error saving day metadata in database:", error);
        });
      }

      return {
        ...prev,
        [date]: updatedValue
      };
    });
  }, [isAuthenticated]);

  // --- Streak Goals Methods ---
  const generateMissingStreakInstances = useCallback((streak: StreakGoal, currentGoals: Goal[]) => {
    if (!streak.active) return [];

    const newGoals: Goal[] = [];
    const start = new Date(streak.startDate + "T00:00:00");
    const end = new Date(streak.endDate + "T00:00:00");
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const maxDate = new Date(today);
    maxDate.setDate(today.getDate() + 30);
    const actualEnd = end < maxDate ? end : maxDate;

    for (let d = new Date(start); d <= actualEnd; d.setDate(d.getDate() + 1)) {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
      const dayOfWeek = d.getDay(); // 0 = Sun, 1 = Mon ... 6 = Sat

      let shouldGenerate = false;
      if (streak.frequency === 'daily') shouldGenerate = true;
      else if (streak.frequency === 'weekdays' && dayOfWeek >= 1 && dayOfWeek <= 5) shouldGenerate = true;
      else if (streak.frequency === 'weekends' && (dayOfWeek === 0 || dayOfWeek === 6)) shouldGenerate = true;
      else if (streak.frequency === 'custom' && streak.customDays?.includes(dayOfWeek)) shouldGenerate = true;

      if (shouldGenerate) {
        const exists = currentGoals.some(g => g.streakId === streak.id && g.date === dateStr);
        if (!exists) {
          newGoals.push({
            id: `g${Date.now()}_${Math.random().toString(36).substr(2,9)}`,
            title: streak.title,
            category: streak.category,
            priority: streak.priority,
            notes: streak.notes,
            completed: false,
            streakId: streak.id,
            date: dateStr,
            status: "todo"
          });
        }
      }
    }
    return newGoals;
  }, []);

  const addStreakGoal = useCallback((streakGoal: Omit<StreakGoal, "id" | "createdAt">) => {
    const userId = auth.currentUser?.uid;
    const newId = `sg${Date.now()}`;
    const newStreak: StreakGoal = {
      ...streakGoal,
      id: newId,
      createdAt: new Date().toISOString()
    };
    setStreakGoals(prev => [...prev, newStreak]);

    if (userId && isAuthenticated) {
      supabase.from("streak_goals").insert({
        id: newId,
        user_id: userId,
        title: streakGoal.title,
        category: streakGoal.category,
        priority: streakGoal.priority,
        notes: streakGoal.notes,
        start_date: streakGoal.startDate,
        end_date: streakGoal.endDate,
        frequency: streakGoal.frequency,
        custom_days: streakGoal.customDays || [],
        active: streakGoal.active
      }).then(({ error }) => {
        if (error) console.error("Error creating streak goal in database:", error);
      });
    }
  }, [isAuthenticated]);

  const updateStreakGoal = useCallback((id: string, updates: Partial<StreakGoal>) => {
    setStreakGoals(prev => prev.map(sg => sg.id === id ? { ...sg, ...updates } : sg));

    if (isAuthenticated) {
      supabase.from("streak_goals")
        .update({
          title: updates.title,
          category: updates.category,
          priority: updates.priority,
          notes: updates.notes,
          start_date: updates.startDate,
          end_date: updates.endDate,
          frequency: updates.frequency,
          custom_days: updates.customDays,
          active: updates.active
        })
        .eq("id", id)
        .then(({ error }) => {
          if (error) console.error("Error updating streak goal in database:", error);
        });
    }
  }, [isAuthenticated]);

  const deleteStreakGoal = useCallback((id: string) => {
    setStreakGoals(prev => prev.filter(sg => sg.id !== id));
    const todayStr = new Date().toISOString().split("T")[0];
    setGoals(prev => prev.filter(g => !(g.streakId === id && g.date >= todayStr && !g.completed)));

    if (isAuthenticated) {
      supabase.from("streak_goals")
        .delete()
        .eq("id", id)
        .then(({ error }) => {
          if (error) console.error("Error deleting streak goal from database:", error);
        });
    }
  }, [isAuthenticated]);

  const regenerateAllStreakGoals = useCallback(() => {
    setGoals(prevGoals => {
      let newlyGenerated: Goal[] = [];
      streakGoals.forEach(sg => {
        newlyGenerated = [...newlyGenerated, ...generateMissingStreakInstances(sg, [...prevGoals, ...newlyGenerated])];
      });
      if (newlyGenerated.length === 0) return prevGoals;

      // Optimistic background save of all newly generated goals to Supabase
      const userId = auth.currentUser?.uid;
      if (userId && isAuthenticated && newlyGenerated.length > 0) {
        const rows = newlyGenerated.map(g => ({
          id: g.id,
          user_id: userId,
          title: g.title,
          category: g.category,
          priority: g.priority,
          completed: g.completed,
          date: g.date,
          notes: g.notes,
          streak_id: g.streakId,
          status: g.status
        }));
        
        supabase.from("goals").insert(rows).then(({ error }) => {
          if (error) console.error("Error saving regenerated streak instances to database:", error);
        });
      }

      return [...newlyGenerated, ...prevGoals];
    });
  }, [streakGoals, generateMissingStreakInstances, isAuthenticated]);

  const setGroqApiKey = useCallback((key: string) => {
    setGroqApiKeyInternal(key);
    const userId = auth.currentUser?.uid;
    if (userId && isAuthenticated) {
      supabase.from("user_preferences").upsert({
        id: userId,
        groq_api_key: key
      }).then(({ error }) => {
        if (error) console.error("Error saving Groq key in database:", error);
      });
    }
  }, [isAuthenticated]);

  // Run regeneration on load and whenever streakGoals changes
  useEffect(() => {
    regenerateAllStreakGoals();
  }, [streakGoals, regenerateAllStreakGoals]);

  return (
    <AppContext.Provider value={{
      boards, columns, tasks, activity, theme,
      createBoard, deleteBoard, createTask, updateTask, deleteTask, moveTask,
      updateColumn, deleteColumn, setTheme, getAvatarColor, avatarColors: avatarColorMap,
      goals, streakGoals, templates, dailyMetadata, groqApiKey, aiFeaturesConfig, customConfig,
      addGoal, updateGoal, deleteGoal, toggleGoal, carryForwardGoal, addTemplate, deleteTemplate, setDayMetadata,
      addStreakGoal, updateStreakGoal, deleteStreakGoal, regenerateAllStreakGoals, generateMissingStreakInstances,
      setGroqApiKey, toggleAiFeature, updateCustomConfig,
      userProfile, updateUserProfile,
      activities, addActivity, markAllActivitiesAsRead
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}

