-- ============================================
-- Add is_read column to messages table
-- Run this in your Supabase SQL editor
-- AFTER running messages.sql
-- ============================================

-- 1. Add is_read column with default false
alter table public.messages
  add column is_read boolean not null default false;

-- 2. RLS: Users can update messages where they are the receiver
--    (used to mark messages as read)
create policy "Users can mark received messages as read"
  on public.messages
  for update
  to authenticated
  using (auth.uid() = receiver_id)
  with check (auth.uid() = receiver_id);

-- 3. Index for unread count queries
--    Covers: count unread messages for a specific receiver
create index idx_messages_unread_receiver
  on public.messages(receiver_id, is_read)
  where is_read = false;
