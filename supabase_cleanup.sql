-- SQL script to clean up duplicate goals for the same streak on the same date
-- and add a database unique constraint to prevent future duplication.

-- 1. Clean up existing duplicates:
-- Group by (streak_id, date), keeping the completed instance if any exists,
-- otherwise keeping the earliest created_at entry.
WITH duplicate_goals AS (
  SELECT id,
         ROW_NUMBER() OVER (
           PARTITION BY streak_id, date
           ORDER BY completed DESC, created_at ASC
         ) as row_num
  FROM goals
  WHERE streak_id IS NOT NULL
)
DELETE FROM goals
WHERE id IN (
  SELECT id
  FROM duplicate_goals
  WHERE row_num > 1
);

-- 2. Add the unique constraint to the goals table:
-- Enforces that a streak can only have one auto-generated goal per day.
-- Manually created goals (where streak_id is NULL) are not affected and can still have duplicates.
ALTER TABLE goals 
ADD CONSTRAINT unique_streak_goal_per_day UNIQUE (streak_id, date);
