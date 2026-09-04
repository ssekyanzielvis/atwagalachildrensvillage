-- Quick Setup Script for Admin Dashboard
-- Run this in Supabase SQL Editor: https://app.supabase.com/project/qvdacaasudthvrsqiwcz/sql/new

-- =============================================================================
-- 1. CREATE ESSENTIAL TABLES
-- =============================================================================

-- Payment Settings Table
CREATE TABLE IF NOT EXISTS payment_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mtn_enabled BOOLEAN DEFAULT false,
  mtn_api_key TEXT,
  airtel_enabled BOOLEAN DEFAULT false,
  airtel_api_key TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default payment settings
INSERT INTO payment_settings (mtn_enabled, airtel_enabled)
VALUES (false, false)
ON CONFLICT DO NOTHING;

-- =============================================================================
-- 2. CREATE STORAGE BUCKETS
-- =============================================================================

-- Admin Profiles Bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('admin-profiles', 'admin-profiles', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Other essential buckets
INSERT INTO storage.buckets (id, name, public)
VALUES 
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
-- 3. ENABLE RLS ON STORAGE
-- =============================================================================

ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- 4. CREATE STORAGE POLICIES (Allow Everyone to Upload/View)
-- =============================================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public read access" ON storage.objects;
DROP POLICY IF EXISTS "Allow public upload access" ON storage.objects;
DROP POLICY IF EXISTS "Allow public delete access" ON storage.objects;

-- Allow anyone to view files
CREATE POLICY "Allow public read access"
ON storage.objects FOR SELECT
USING (bucket_id IN (
  'admin-profiles', 'hello-slides', 'gallery', 'programs', 
  'achievements', 'news', 'leadership', 'core-values',
  'about-us', 'vision', 'mission', 'objectives'
));

-- Allow anyone to upload files (for development)
CREATE POLICY "Allow public upload access"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id IN (
  'admin-profiles', 'hello-slides', 'gallery', 'programs', 
  'achievements', 'news', 'leadership', 'core-values',
  'about-us', 'vision', 'mission', 'objectives'
));

-- Allow anyone to delete files (for development)
CREATE POLICY "Allow public delete access"
ON storage.objects FOR DELETE
USING (bucket_id IN (
  'admin-profiles', 'hello-slides', 'gallery', 'programs', 
  'achievements', 'news', 'leadership', 'core-values',
  'about-us', 'vision', 'mission', 'objectives'
));

-- =============================================================================
-- 5. VERIFY SETUP
-- =============================================================================

-- Check if payment_settings exists
SELECT 'Payment Settings Created' AS status, COUNT(*) AS count 
FROM payment_settings;

-- Check storage buckets
SELECT 'Storage Buckets Created' AS status, COUNT(*) AS count 
FROM storage.buckets 
WHERE id IN ('admin-profiles', 'hello-slides', 'gallery');

SELECT '✅ Quick setup complete!' AS message;
