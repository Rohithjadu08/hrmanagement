-- Enable pgvector extension
create extension if not exists vector;

-- Drop existing tables if re-running (be careful in production)
-- drop table if exists document_chunks;
-- drop table if exists documents;
-- drop table if exists messages;
-- drop table if exists conversations;
-- drop table if exists tasks;
-- drop table if exists employees;
-- drop table if exists profiles;
-- drop table if exists notifications;

-- PROFILES
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text not null,
  employee_id text,
  department text,
  designation text,
  phone text,
  role text not null check (role in ('employee', 'hr', 'admin')) default 'employee',
  approval_status text not null check (approval_status in ('pending', 'approved', 'rejected', 'suspended')) default 'pending',
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- EMPLOYEES
create table employees (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references profiles(id) on delete cascade not null,
  employee_id text,
  department text,
  designation text,
  joining_date date,
  manager_id uuid references profiles(id) on delete set null,
  employment_status text default 'active',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- TASKS
create table tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  assigned_to uuid references profiles(id) on delete cascade,
  assigned_by uuid references profiles(id) on delete set null,
  priority text check (priority in ('low', 'medium', 'high', 'urgent')) default 'medium',
  status text check (status in ('todo', 'in_progress', 'completed', 'overdue')) default 'todo',
  due_date timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- CONVERSATIONS
create table conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade not null,
  title text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- MESSAGES
create table messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid references conversations(id) on delete cascade not null,
  user_id uuid references profiles(id) on delete cascade not null,
  role text check (role in ('user', 'assistant', 'system')) not null,
  content text not null,
  sources jsonb, -- Store retrieved sources metadata
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- DOCUMENTS (HR Knowledge Base)
create table documents (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  file_name text not null,
  file_type text not null,
  storage_path text not null,
  uploaded_by uuid references profiles(id) on delete set null,
  status text check (status in ('processing', 'ready', 'failed')) default 'processing',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- DOCUMENT CHUNKS (For pgvector)
create table document_chunks (
  id uuid primary key default gen_random_uuid(),
  document_id uuid references documents(id) on delete cascade not null,
  content text not null,
  embedding vector(1536), -- Assuming OpenAI text-embedding-3-small or ada-002
  metadata jsonb,
  chunk_index integer not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- NOTIFICATIONS
create table notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade not null,
  title text not null,
  message text not null,
  type text,
  is_read boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- =========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =========================================

alter table profiles enable row level security;
alter table employees enable row level security;
alter table tasks enable row level security;
alter table conversations enable row level security;
alter table messages enable row level security;
alter table documents enable row level security;
alter table document_chunks enable row level security;
alter table notifications enable row level security;

-- Profiles: Users can read their own profile, HR/Admin can read all
create policy "Users can view own profile" on profiles for select using (auth.uid() = id);
create policy "HR can view all profiles" on profiles for select using (exists (select 1 from profiles where id = auth.uid() and role in ('hr', 'admin')));
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);

-- Tasks: Employees see assigned tasks, HR sees all
create policy "Users can view assigned tasks" on tasks for select using (auth.uid() = assigned_to);
create policy "HR can view all tasks" on tasks for select using (exists (select 1 from profiles where id = auth.uid() and role in ('hr', 'admin')));
create policy "Users can update own task status" on tasks for update using (auth.uid() = assigned_to);
create policy "HR can manage all tasks" on tasks for all using (exists (select 1 from profiles where id = auth.uid() and role in ('hr', 'admin')));

-- Conversations & Messages: Users can only see their own
create policy "Users can view own conversations" on conversations for select using (auth.uid() = user_id);
create policy "Users can insert own conversations" on conversations for insert with check (auth.uid() = user_id);
create policy "Users can view own messages" on messages for select using (auth.uid() = user_id);
create policy "Users can insert own messages" on messages for insert with check (auth.uid() = user_id);

-- Documents: All authenticated users can view ready documents, HR can manage
create policy "All users can view ready documents" on documents for select using (status = 'ready');
create policy "HR can manage documents" on documents for all using (exists (select 1 from profiles where id = auth.uid() and role in ('hr', 'admin')));
create policy "All users can read chunks" on document_chunks for select using (true);
create policy "HR can manage chunks" on document_chunks for all using (exists (select 1 from profiles where id = auth.uid() and role in ('hr', 'admin')));

-- Notifications
create policy "Users can view own notifications" on notifications for select using (auth.uid() = user_id);
create policy "Users can update own notifications" on notifications for update using (auth.uid() = user_id);

-- =========================================
-- VECTOR SEARCH FUNCTION
-- =========================================
create or replace function match_document_chunks (
  query_embedding vector(1536),
  match_threshold float,
  match_count int
)
returns table (
  id uuid,
  document_id uuid,
  content text,
  metadata jsonb,
  similarity float
)
language sql stable
as $$
  select
    document_chunks.id,
    document_chunks.document_id,
    document_chunks.content,
    document_chunks.metadata,
    1 - (document_chunks.embedding <=> query_embedding) as similarity
  from document_chunks
  join documents on documents.id = document_chunks.document_id
  where documents.status = 'ready'
    and 1 - (document_chunks.embedding <=> query_embedding) > match_threshold
  order by document_chunks.embedding <=> query_embedding
  limit match_count;
$$;
