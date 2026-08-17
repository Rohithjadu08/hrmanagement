-- Drop existing tables to allow re-running the script (this will erase existing data in these tables)
drop table if exists document_chunks cascade;
drop table if exists documents cascade;
drop table if exists messages cascade;
drop table if exists conversations cascade;
drop table if exists notifications cascade;
drop table if exists tasks cascade;
drop table if exists profiles cascade;

-- Create the profiles table
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text not null,
  email text unique not null,
  role text not null check (role in ('employee', 'hr')),
  department text not null,
  employee_id text not null,
  approval_status text not null default 'pending' check (approval_status in ('pending', 'approved', 'rejected')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table profiles enable row level security;

-- Create policies (Optional, mainly if the frontend interacts directly with Supabase)
-- Allow users to read their own profile
create policy "Users can view own profile"
  on profiles for select
  using ( auth.uid() = id );

-- Allow users to update their own profile
create policy "Users can update own profile"
  on profiles for update
  using ( auth.uid() = id );

-- Function to handle updated_at
create or replace function handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Trigger to automatically update the updated_at column
create trigger handle_profiles_updated_at
  before update on profiles
  for each row
  execute procedure handle_updated_at();

-- Create tasks table
create table tasks (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  assignee_id uuid references auth.users(id),
  priority text not null check (priority in ('low', 'medium', 'high', 'urgent')),
  status text not null default 'todo' check (status in ('todo', 'in_progress', 'completed', 'overdue')),
  due_date timestamp with time zone,
  category text,
  notes text,
  completed_at timestamp with time zone,
  created_by uuid references auth.users(id) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create notifications table
create table notifications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) not null,
  title text not null,
  message text not null,
  is_read boolean default false not null,
  type text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable pgvector extension
create extension if not exists vector;

-- Create chat tables
create table conversations (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) not null,
  title text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table messages (
  id uuid default gen_random_uuid() primary key,
  conversation_id uuid references conversations(id) on delete cascade not null,
  user_id uuid references auth.users(id) not null,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  sources jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create RAG tables
create table documents (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  file_name text not null,
  file_type text,
  storage_path text,
  uploaded_by uuid references auth.users(id),
  status text not null default 'processing',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table document_chunks (
  id uuid default gen_random_uuid() primary key,
  document_id uuid references documents(id) on delete cascade not null,
  content text not null,
  embedding vector(3072),
  chunk_index integer,
  metadata jsonb
);

-- Create vector search RPC function
create or replace function match_document_chunks (
  query_embedding vector(3072),
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
language plpgsql
as $$
begin
  return query
  select
    document_chunks.id,
    document_chunks.document_id,
    document_chunks.content,
    document_chunks.metadata,
    1 - (document_chunks.embedding <=> query_embedding) as similarity
  from document_chunks
  where 1 - (document_chunks.embedding <=> query_embedding) > match_threshold
  order by document_chunks.embedding <=> query_embedding
  limit match_count;
end;
$$;
