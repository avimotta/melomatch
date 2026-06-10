-- ============================================
-- Messages table
-- Run this in your Supabase SQL editor
-- AFTER running connections.sql
-- ============================================

-- 1. Create function to check if two users are matched
--    (reciprocal connections exist in both directions)
create or replace function public.check_match(user_a uuid, user_b uuid)
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.connections c1
    join public.connections c2
      on c1.sender_id = c2.receiver_id
     and c1.receiver_id = c2.sender_id
    where c1.sender_id = user_a
      and c1.receiver_id = user_b
  );
$$;

-- 2. Create the messages table
create table public.messages (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references public.profiles(id) on delete cascade,
  receiver_id uuid not null references public.profiles(id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now()
);

-- 3. Enable Row Level Security
alter table public.messages enable row level security;

-- 4. RLS: Users can view messages where they are the sender or receiver
create policy "Users can view their own messages"
  on public.messages
  for select
  to authenticated
  using (
    auth.uid() = sender_id or auth.uid() = receiver_id
  );

-- 5. RLS: Users can insert messages as themselves, only to matched users
--    - auth.uid() must be the sender
--    - sender cannot be the same as receiver (no self-messaging)
--    - a reciprocal connection must exist between sender and receiver
create policy "Users can send messages to matched users"
  on public.messages
  for insert
  to authenticated
  with check (
    auth.uid() = sender_id
    and auth.uid() <> receiver_id
    and public.check_match(auth.uid(), receiver_id)
  );

-- 6. Index for efficient conversation loading
--    Covers both query patterns: user→other and other→user
create index idx_messages_sender_receiver
  on public.messages(sender_id, receiver_id, created_at);

create index idx_messages_receiver_sender
  on public.messages(receiver_id, sender_id, created_at);
