-- 01_settings_schema.sql

-- ==========================================
-- 1. ORGANIZATION SETTINGS
-- ==========================================
CREATE TABLE organization_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name TEXT NOT NULL DEFAULT 'Reckon Group',
  company_email TEXT,
  phone TEXT,
  office_location TEXT,
  time_zone TEXT DEFAULT 'Asia/Kolkata',
  working_days JSONB DEFAULT '["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]'::jsonb,
  working_hours_start TIME DEFAULT '09:00:00',
  working_hours_end TIME DEFAULT '18:00:00',
  late_threshold TIME DEFAULT '09:15:00',
  half_day_threshold TIME DEFAULT '13:00:00',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Initialize with a default row
INSERT INTO organization_settings (company_name) VALUES ('Reckon Group');

-- ==========================================
-- 2. HR SETTINGS
-- ==========================================
CREATE TABLE hr_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_approval_required BOOLEAN DEFAULT true,
  allow_self_registration BOOLEAN DEFAULT true,
  default_employee_status TEXT DEFAULT 'pending',
  employee_id_format TEXT DEFAULT 'EMP-{YEAR}-{NUMBER}',
  onboarding_enabled BOOLEAN DEFAULT true,
  new_employee_notifications BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Initialize with a default row
INSERT INTO hr_settings (employee_approval_required) VALUES (true);

-- ==========================================
-- 3. LEAVE TYPES
-- ==========================================
CREATE TABLE leave_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  allowance INTEGER NOT NULL DEFAULT 0,
  requires_approval BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Insert default leave types based on frontend assumptions
INSERT INTO leave_types (name, allowance) VALUES
  ('Annual', 12),
  ('Sick', 10),
  ('Earned', 15),
  ('Unpaid', 0);

-- ==========================================
-- 4. TASK SETTINGS
-- ==========================================
CREATE TABLE task_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  default_priority TEXT DEFAULT 'medium',
  default_status TEXT DEFAULT 'todo',
  deadline_reminders BOOLEAN DEFAULT true,
  submission_notifications BOOLEAN DEFAULT true,
  hr_review_required BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Initialize with a default row
INSERT INTO task_settings (default_priority) VALUES ('medium');

-- ==========================================
-- 5. NOTIFICATION PREFERENCES (Global HR defaults)
-- ==========================================
CREATE TABLE hr_notification_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  new_registration BOOLEAN DEFAULT true,
  leave_requests BOOLEAN DEFAULT true,
  task_submissions BOOLEAN DEFAULT true,
  attendance_alerts BOOLEAN DEFAULT true,
  email_notifications BOOLEAN DEFAULT true,
  in_app_notifications BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

INSERT INTO hr_notification_settings (new_registration) VALUES (true);

-- ==========================================
-- 6. USER SETTINGS (Individual Employee Preferences)
-- ==========================================
CREATE TABLE user_settings (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  task_notifications BOOLEAN DEFAULT true,
  leave_updates BOOLEAN DEFAULT true,
  attendance_reminders BOOLEAN DEFAULT true,
  hr_announcements BOOLEAN DEFAULT true,
  ai_assistant_notifications BOOLEAN DEFAULT true,
  email_notifications BOOLEAN DEFAULT true,
  in_app_notifications BOOLEAN DEFAULT true,
  theme TEXT DEFAULT 'system',
  language TEXT DEFAULT 'English',
  time_format TEXT DEFAULT '12 hour',
  density TEXT DEFAULT 'Comfortable',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================
-- 7. AUDIT LOGS
-- ==========================================
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  target TEXT NOT NULL,
  status TEXT NOT NULL,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================
-- RLS (ROW LEVEL SECURITY) POLICIES
-- ==========================================
ALTER TABLE organization_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE hr_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE hr_notification_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Everyone can read org settings (needed for frontend UI like working hours)
CREATE POLICY "Anyone can read org settings" ON organization_settings FOR SELECT USING (true);
CREATE POLICY "HR can update org settings" ON organization_settings FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'hr')
);

-- HR only for HR Settings
CREATE POLICY "HR can manage hr_settings" ON hr_settings FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'hr')
);

-- Everyone can read leave types, HR can manage
CREATE POLICY "Anyone can read leave types" ON leave_types FOR SELECT USING (true);
CREATE POLICY "HR can manage leave types" ON leave_types FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'hr')
);

-- HR only for Task Settings
CREATE POLICY "HR can manage task_settings" ON task_settings FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'hr')
);

-- HR only for HR Notification Settings
CREATE POLICY "HR can manage hr_notification_settings" ON hr_notification_settings FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'hr')
);

-- Users can manage their own settings, HR can view all
CREATE POLICY "Users can manage own settings" ON user_settings FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "HR can view all user settings" ON user_settings FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'hr')
);

-- Audit logs are insert-only and read-only for HR
CREATE POLICY "HR can insert audit logs" ON audit_logs FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'hr')
);
CREATE POLICY "HR can view audit logs" ON audit_logs FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'hr')
);
