-- Create attendance table
create table if not exists attendance (
  id uuid default gen_random_uuid() primary key,
  employee_id uuid references auth.users(id) on delete cascade not null,
  date date not null,
  check_in timestamp with time zone,
  check_out timestamp with time zone,
  status text not null check (status in ('Present', 'Late', 'Absent', 'Leave', 'Holiday')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(employee_id, date)
);

-- Enable RLS for attendance
alter table attendance enable row level security;

-- Policies for attendance
create policy "Users can view own attendance"
  on attendance for select
  using ( auth.uid() = employee_id );

create policy "Users can insert own attendance"
  on attendance for insert
  with check ( auth.uid() = employee_id );

create policy "Users can update own attendance"
  on attendance for update
  using ( auth.uid() = employee_id );

create policy "HR can view all attendance"
  on attendance for select
  using ( exists (select 1 from profiles where id = auth.uid() and role = 'hr') );

create policy "HR can update all attendance"
  on attendance for update
  using ( exists (select 1 from profiles where id = auth.uid() and role = 'hr') );

-- Create trigger for attendance updated_at
create trigger handle_attendance_updated_at
  before update on attendance
  for each row
  execute procedure handle_updated_at();

-- Create leave_requests table
create table if not exists leave_requests (
  id uuid default gen_random_uuid() primary key,
  employee_id uuid references auth.users(id) on delete cascade not null,
  leave_type text not null,
  start_date date not null,
  end_date date not null,
  total_days integer not null,
  reason text not null,
  additional_notes text,
  status text not null default 'Pending' check (status in ('Pending', 'Approved', 'Rejected')),
  rejection_reason text,
  reviewed_by uuid references auth.users(id),
  reviewed_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for leave_requests
alter table leave_requests enable row level security;

-- Policies for leave_requests
create policy "Users can view own leave_requests"
  on leave_requests for select
  using ( auth.uid() = employee_id );

create policy "Users can insert own leave_requests"
  on leave_requests for insert
  with check ( auth.uid() = employee_id );

create policy "HR can view all leave_requests"
  on leave_requests for select
  using ( exists (select 1 from profiles where id = auth.uid() and role = 'hr') );

create policy "HR can update all leave_requests"
  on leave_requests for update
  using ( exists (select 1 from profiles where id = auth.uid() and role = 'hr') );

-- Create trigger for leave_requests updated_at
create trigger handle_leave_requests_updated_at
  before update on leave_requests
  for each row
  execute procedure handle_updated_at();
