-- Run this in the Supabase SQL editor (Dashboard > SQL Editor)

create table if not exists brands (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  stage text not null,
  description text not null,
  audience_report jsonb,
  roadmap jsonb,
  marketing_plan jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- One brand profile per user
create unique index if not exists brands_user_id_idx on brands(user_id);

-- Row Level Security
alter table brands enable row level security;

create policy "Users can read their own brand"
  on brands for select
  using (auth.uid() = user_id);

create policy "Users can insert their own brand"
  on brands for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own brand"
  on brands for update
  using (auth.uid() = user_id);

-- Messages table for mentor chat history
create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamptz default now()
);

create index if not exists messages_user_id_created_at_idx on messages(user_id, created_at);

alter table messages enable row level security;

create policy "Users can read their own messages"
  on messages for select
  using (auth.uid() = user_id);

create policy "Users can insert their own messages"
  on messages for insert
  with check (auth.uid() = user_id);
