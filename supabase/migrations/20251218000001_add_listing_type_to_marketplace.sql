-- Add listing_type to marketplace_listings (sell or rent)
ALTER TABLE public.marketplace_listings ADD COLUMN IF NOT EXISTS listing_type text DEFAULT 'sell';

