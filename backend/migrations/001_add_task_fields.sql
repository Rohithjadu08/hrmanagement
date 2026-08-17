-- Migration to add fields to the existing tasks table

-- Add new columns
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS due_date timestamp with time zone;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS category text;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS notes text;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS completed_at timestamp with time zone;

-- Update constraints
ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_priority_check;
ALTER TABLE tasks ADD CONSTRAINT tasks_priority_check CHECK (priority IN ('low', 'medium', 'high', 'urgent'));

ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_status_check;
ALTER TABLE tasks ADD CONSTRAINT tasks_status_check CHECK (status IN ('todo', 'in_progress', 'completed', 'overdue'));
