-- Add registration_url and contact_email to events table
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS registration_url text;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS contact_email text;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS contact_phone text;

-- Add contact_email and contact_phone to marketplace_listings table
ALTER TABLE public.marketplace_listings ADD COLUMN IF NOT EXISTS contact_email text;
ALTER TABLE public.marketplace_listings ADD COLUMN IF NOT EXISTS contact_phone text;

-- Add email to alumni table for contact
ALTER TABLE public.alumni ADD COLUMN IF NOT EXISTS email text;

-- Add request_type to study_buddy_requests (need_help or can_help)
ALTER TABLE public.study_buddy_requests ADD COLUMN IF NOT EXISTS request_type text DEFAULT 'need_help';

-- Add resolved_by and resolved_at to issues table
ALTER TABLE public.issues ADD COLUMN IF NOT EXISTS resolved_by uuid;
ALTER TABLE public.issues ADD COLUMN IF NOT EXISTS resolved_at timestamp with time zone;
ALTER TABLE public.issues ADD COLUMN IF NOT EXISTS resolution_notes text;