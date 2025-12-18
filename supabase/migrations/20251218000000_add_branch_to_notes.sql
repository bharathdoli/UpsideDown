-- Add branch column to notes table and keep semester for backward compatibility
ALTER TABLE public.notes ADD COLUMN IF NOT EXISTS branch text;

