-- Hactiq Supabase Database Schema
-- Paste this script directly into the Supabase SQL Editor to initialize your database.

-- Drop existing tables if they exist to start fresh (in order of dependencies)
DROP TABLE IF EXISTS activities CASCADE;
DROP TABLE IF EXISTS day_metadata CASCADE;
DROP TABLE IF EXISTS goal_templates CASCADE;
DROP TABLE IF EXISTS streak_goals CASCADE;
DROP TABLE IF EXISTS goals CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS user_preferences CASCADE;
DROP TABLE IF EXISTS task_comments CASCADE;
DROP TABLE IF EXISTS tasks CASCADE;
DROP TABLE IF EXISTS columns CASCADE;
DROP TABLE IF EXISTS boards CASCADE;
DROP TABLE IF EXISTS workspaces CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- 1. Profiles Table (Holds core user details linked by Firebase Auth UID)
CREATE TABLE profiles (
    id TEXT PRIMARY KEY, -- Firebase UID
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    avatar TEXT,
    bio TEXT DEFAULT 'Product Designer & Developer',
    avatar_url TEXT DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 2. Workspaces Table
CREATE TABLE workspaces (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 3. Boards Table (Maps to Kanban boards)
CREATE TABLE boards (
    id TEXT PRIMARY KEY,
    workspace_id TEXT REFERENCES workspaces(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    color TEXT DEFAULT '#6366f1',
    last_modified TEXT NOT NULL, -- YYYY-MM-DD format
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 4. Columns Table (Stages in Kanban boards)
CREATE TABLE columns (
    id TEXT PRIMARY KEY,
    board_id TEXT NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 5. Tasks Table (Kanban Tasks)
CREATE TABLE tasks (
    id TEXT PRIMARY KEY,
    board_id TEXT NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
    column_id TEXT NOT NULL REFERENCES columns(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    priority TEXT DEFAULT 'medium',
    due_date TEXT DEFAULT '', -- YYYY-MM-DD
    assignees TEXT[] DEFAULT '{}',
    labels TEXT[] DEFAULT '{}',
    subtasks JSONB DEFAULT '[]'::jsonb,
    comments INTEGER DEFAULT 0,
    attachments INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 6. Task Comments Table
CREATE TABLE task_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id TEXT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    comment_text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 7. User Preferences Table (Persists Settings options, Theme, and Custom Configs)
CREATE TABLE user_preferences (
    id TEXT PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
    theme TEXT DEFAULT 'system',
    email_digest BOOLEAN DEFAULT TRUE,
    push_notifications BOOLEAN DEFAULT FALSE,
    task_updates BOOLEAN DEFAULT TRUE,
    custom_config JSONB DEFAULT '{}'::jsonb,
    ai_features JSONB DEFAULT '{}'::jsonb,
    groq_api_key TEXT DEFAULT '',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 8. Notifications Table
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    read BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 9. Goals Table (Goal Tracker Goals)
CREATE TABLE goals (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    category TEXT DEFAULT 'Other',
    priority TEXT DEFAULT 'medium',
    completed BOOLEAN DEFAULT FALSE NOT NULL,
    date TEXT NOT NULL, -- YYYY-MM-DD
    notes TEXT DEFAULT '',
    streak_id TEXT,
    status TEXT DEFAULT 'todo',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 10. Streak Goals Table (Goal Tracker Recurring Streak Goals)
CREATE TABLE streak_goals (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    category TEXT DEFAULT 'Other',
    priority TEXT DEFAULT 'medium',
    notes TEXT DEFAULT '',
    start_date TEXT NOT NULL, -- YYYY-MM-DD
    end_date TEXT NOT NULL, -- YYYY-MM-DD
    frequency TEXT DEFAULT 'daily',
    custom_days INTEGER[] DEFAULT '{}',
    active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 11. Goal Templates Table
CREATE TABLE goal_templates (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    category TEXT DEFAULT 'Other',
    priority TEXT DEFAULT 'medium',
    notes TEXT DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 12. Day Metadata Table (Mood/Energy metrics)
CREATE TABLE day_metadata (
    user_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    date TEXT NOT NULL, -- YYYY-MM-DD
    mood TEXT,
    energy TEXT,
    PRIMARY KEY (user_id, date)
);

-- 13. Activities Table (Audit activity stream)
CREATE TABLE activities (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    message TEXT NOT NULL,
    board_name TEXT,
    goal_title TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    read BOOLEAN DEFAULT FALSE NOT NULL
);

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE boards ENABLE ROW LEVEL SECURITY;
ALTER TABLE columns ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE streak_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE goal_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE day_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

-- Create helper function to extract user_id from custom headers
-- Since Firebase Auth handles authentication client-side and we use the Supabase Anon client,
-- we securely pass the user's Firebase UID via the 'x-user-id' header.
CREATE OR REPLACE FUNCTION get_current_user_id()
RETURNS TEXT AS $$
BEGIN
  RETURN COALESCE(
    current_setting('request.headers', true)::json->>'x-user-id',
    ''
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS Policies mapping get_current_user_id() to user ownership

-- profiles policies
CREATE POLICY "Users can manage their own profiles" ON profiles
    FOR ALL USING (id = get_current_user_id()) WITH CHECK (id = get_current_user_id());

-- workspaces policies
CREATE POLICY "Users can manage their own workspaces" ON workspaces
    FOR ALL USING (user_id = get_current_user_id()) WITH CHECK (user_id = get_current_user_id());

-- boards policies
CREATE POLICY "Users can manage their own boards" ON boards
    FOR ALL USING (user_id = get_current_user_id()) WITH CHECK (user_id = get_current_user_id());

-- columns policies
-- Check if the column belongs to a board that belongs to the user
CREATE POLICY "Users can manage columns of their boards" ON columns
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM boards
            WHERE boards.id = columns.board_id AND boards.user_id = get_current_user_id()
        )
    );

-- tasks policies
-- Check if the task belongs to a board that belongs to the user
CREATE POLICY "Users can manage tasks of their boards" ON tasks
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM boards
            WHERE boards.id = tasks.board_id AND boards.user_id = get_current_user_id()
        )
    );

-- task_comments policies
CREATE POLICY "Users can manage their own task comments" ON task_comments
    FOR ALL USING (user_id = get_current_user_id()) WITH CHECK (user_id = get_current_user_id());

-- user_preferences policies
CREATE POLICY "Users can manage their own preferences" ON user_preferences
    FOR ALL USING (id = get_current_user_id()) WITH CHECK (id = get_current_user_id());

-- notifications policies
CREATE POLICY "Users can manage their own notifications" ON notifications
    FOR ALL USING (user_id = get_current_user_id()) WITH CHECK (user_id = get_current_user_id());

-- goals policies
CREATE POLICY "Users can manage their own goals" ON goals
    FOR ALL USING (user_id = get_current_user_id()) WITH CHECK (user_id = get_current_user_id());

-- streak_goals policies
CREATE POLICY "Users can manage their own streak goals" ON streak_goals
    FOR ALL USING (user_id = get_current_user_id()) WITH CHECK (user_id = get_current_user_id());

-- goal_templates policies
CREATE POLICY "Users can manage their own templates" ON goal_templates
    FOR ALL USING (user_id = get_current_user_id()) WITH CHECK (user_id = get_current_user_id());

-- day_metadata policies
CREATE POLICY "Users can manage their own day metadata" ON day_metadata
    FOR ALL USING (user_id = get_current_user_id()) WITH CHECK (user_id = get_current_user_id());

-- activities policies
CREATE POLICY "Users can manage their own activities" ON activities
    FOR ALL USING (user_id = get_current_user_id()) WITH CHECK (user_id = get_current_user_id());

-- Performance Optimization Indexes
CREATE INDEX IF NOT EXISTS idx_workspaces_user ON workspaces(user_id);
CREATE INDEX IF NOT EXISTS idx_boards_user ON boards(user_id);
CREATE INDEX IF NOT EXISTS idx_boards_workspace ON boards(workspace_id);
CREATE INDEX IF NOT EXISTS idx_columns_board ON columns(board_id);
CREATE INDEX IF NOT EXISTS idx_tasks_board ON tasks(board_id);
CREATE INDEX IF NOT EXISTS idx_tasks_column ON tasks(column_id);
CREATE INDEX IF NOT EXISTS idx_task_comments_task ON task_comments(task_id);
CREATE INDEX IF NOT EXISTS idx_task_comments_user ON task_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_goals_user_date ON goals(user_id, date);
CREATE INDEX IF NOT EXISTS idx_streak_goals_user ON streak_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_goal_templates_user ON goal_templates(user_id);
CREATE INDEX IF NOT EXISTS idx_activities_user ON activities(user_id);
