-- FIX STORAGE RLS POLICY ERRORS
-- Run this in Supabase SQL Editor to allow file uploads without Supabase Auth

-- =============================================================================
-- CREATE STORAGE BUCKETS
-- =============================================================================

INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('admin-profiles', 'admin-profiles', true),
  ('hello-slides', 'hello-slides', true),
  ('gallery', 'gallery', true),
  ('programs', 'programs', true),
  ('achievements', 'achievements', true),
  ('news', 'news', true),
  ('leadership', 'leadership', true),
  ('core-values', 'core-values', true),
  ('about-us', 'about-us', true),
  ('vision', 'vision', true),
  ('mission', 'mission', true),
  ('objectives', 'objectives', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- =============================================================================
-- CREATE PUBLIC ACCESS POLICIES FOR STORAGE
-- =============================================================================
-- Since the app uses a custom 'admins' table instead of Supabase Auth,
-- we must allow all users to upload (or write custom policies based on custom auth).
-- For development, we allow public uploads to these buckets.

DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read access" ON storage.objects;
DROP POLICY IF EXISTS "Allow public insert access" ON storage.objects;
DROP POLICY IF EXISTS "Allow public update access" ON storage.objects;
DROP POLICY IF EXISTS "Allow public delete access" ON storage.objects;

CREATE POLICY "Allow public read access"
ON storage.objects FOR SELECT
USING (bucket_id IN ('admin-profiles', 'hello-slides', 'gallery', 'programs', 'achievements', 'news', 'leadership', 'core-values', 'about-us', 'vision', 'mission', 'objectives'));

CREATE POLICY "Allow public insert access"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id IN ('admin-profiles', 'hello-slides', 'gallery', 'programs', 'achievements', 'news', 'leadership', 'core-values', 'about-us', 'vision', 'mission', 'objectives'));

CREATE POLICY "Allow public update access"
ON storage.objects FOR UPDATE
USING (bucket_id IN ('admin-profiles', 'hello-slides', 'gallery', 'programs', 'achievements', 'news', 'leadership', 'core-values', 'about-us', 'vision', 'mission', 'objectives'));

CREATE POLICY "Allow public delete access"
ON storage.objects FOR DELETE
USING (bucket_id IN ('admin-profiles', 'hello-slides', 'gallery', 'programs', 'achievements', 'news', 'leadership', 'core-values', 'about-us', 'vision', 'mission', 'objectives'));

-- =============================================================================
-- CREATE ADMINS TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT,
  phone_number TEXT,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Disable RLS on admins table for development
ALTER TABLE admins DISABLE ROW LEVEL SECURITY;

-- =============================================================================
-- VERIFICATION
-- =============================================================================

SELECT '✅ Storage policies updated - uploads should work now' AS message;
SELECT 'Buckets available: ' || COUNT(*)::text AS bucket_status FROM storage.buckets;
