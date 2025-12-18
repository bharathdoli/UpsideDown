-- Add phone_number and linkedin_url to study_buddy_requests
ALTER TABLE public.study_buddy_requests ADD COLUMN IF NOT EXISTS phone_number text;
ALTER TABLE public.study_buddy_requests ADD COLUMN IF NOT EXISTS linkedin_url text;

