-- ============================================
-- Add experience_level, looking_for, influences
-- Run this in your Supabase SQL editor
-- ============================================

alter table public.profiles
  add column if not exists experience_level text,
  add column if not exists looking_for text[] default '{}',
  add column if not exists influences text;
