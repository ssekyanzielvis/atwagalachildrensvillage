-- Add business_name and logo_url to partner_applications table
ALTER TABLE partner_applications ADD COLUMN business_name TEXT;
ALTER TABLE partner_applications ADD COLUMN logo_url TEXT;

-- Add business_name and logo_url to partners table
ALTER TABLE partners ADD COLUMN business_name TEXT;
ALTER TABLE partners ADD COLUMN logo_url TEXT;

-- =============================================================================
-- CREATE PARTNERS STORAGE BUCKET
-- =============================================================================

-- Create the bucket for partner logos
INSERT INTO storage.buckets (id, name, public)
VALUES ('partners', 'partners', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Drop existing policies if they exist to avoid conflicts when re-running
DROP POLICY IF EXISTS "Public access for partners bucket" ON storage.objects;
DROP POLICY IF EXISTS "Allow uploads to partners bucket" ON storage.objects;

-- Create permissive policies for the partners bucket
CREATE POLICY "Public access for partners bucket" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'partners');

CREATE POLICY "Allow uploads to partners bucket" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'partners');
