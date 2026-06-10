-- ============================================
-- Add DELETE policy for connections table
-- Run this in your Supabase SQL editor
-- AFTER running connections.sql
-- ============================================

-- Allow users to delete connections where they are the receiver
-- (used to "Ignore" an incoming connection request)
create policy "Users can delete received connections"
  on public.connections
  for delete
  to authenticated
  using (auth.uid() = receiver_id);
