-- ============================================
-- Connections table
-- Run this in your Supabase SQL editor
-- ============================================

-- 1. Create the table
create table public.connections (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references public.profiles(id) on delete cascade,
  receiver_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),

  -- Prevent duplicate connections (same direction)
  unique (sender_id, receiver_id)
);

-- 2. Enable Row Level Security
alter table public.connections enable row level security;

-- 3. RLS: Users can create connections where they are the sender
create policy "Users can create connections as sender"
  on public.connections
  for insert
  to authenticated
  with check (auth.uid() = sender_id);

-- 4. RLS: Users can view connections they are part of
create policy "Users can view their own connections"
  on public.connections
  for select
  to authenticated
  using (auth.uid() = sender_id or auth.uid() = receiver_id);
