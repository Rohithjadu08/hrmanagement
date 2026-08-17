-- Migration to add task submission and HR review fields

ALTER TABLE tasks ADD COLUMN IF NOT EXISTS submission_file_url text;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS submission_notes text;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS hr_approval_status text DEFAULT 'pending' CHECK (hr_approval_status IN ('pending', 'approved', 'rejected'));
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS hr_feedback text;
