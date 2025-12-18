-- Add branch column to profiles to store user's branch/department
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS branch text;

