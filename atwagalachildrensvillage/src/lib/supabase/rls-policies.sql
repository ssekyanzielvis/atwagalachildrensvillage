-- Row Level Security Policies for Southern Organization Platform
-- Run this in Supabase SQL Editor AFTER running schema.sql

-- ============================================
-- ENABLE RLS ON ALL TABLES
-- ============================================

ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE theme_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE footer_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE hello_slides ENABLE ROW LEVEL SECURITY;
ALTER TABLE about_us ENABLE ROW LEVEL SECURITY;
ALTER TABLE vision ENABLE ROW LEVEL SECURITY;
ALTER TABLE mission ENABLE ROW LEVEL SECURITY;
ALTER TABLE objectives ENABLE ROW LEVEL SECURITY;
ALTER TABLE programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE core_values ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE news ENABLE ROW LEVEL SECURITY;
ALTER TABLE leadership ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PUBLIC READ ACCESS FOR VISITOR CONTENT
-- ============================================

-- Hello Slides - Public can read active slides
CREATE POLICY "Public read access for active hello slides"
  ON hello_slides FOR SELECT
  USING (is_active = true);

-- About Us - Public can read active content
CREATE POLICY "Public read access for active about content"
  ON about_us FOR SELECT
  USING (is_active = true);

-- Vision - Public can read active vision
CREATE POLICY "Public read access for active vision"
  ON vision FOR SELECT
  USING (is_active = true);

-- Mission - Public can read active mission
CREATE POLICY "Public read access for active mission"
  ON mission FOR SELECT
  USING (is_active = true);

-- Objectives - Public can read active objectives
CREATE POLICY "Public read access for active objectives"
  ON objectives FOR SELECT
  USING (is_active = true);

-- Programs - Public can read active programs
CREATE POLICY "Public read access for active programs"
  ON programs FOR SELECT
  USING (is_active = true);

-- Achievements - Public can read active achievements
CREATE POLICY "Public read access for active achievements"
  ON achievements FOR SELECT
  USING (is_active = true);

-- Core Values - Public can read active core values
CREATE POLICY "Public read access for active core values"
  ON core_values FOR SELECT
  USING (is_active = true);

-- Gallery - Public can read active gallery images
CREATE POLICY "Public read access for active gallery"
  ON gallery FOR SELECT
  USING (is_active = true);

-- News - Public can read active news
CREATE POLICY "Public read access for active news"
  ON news FOR SELECT
  USING (is_active = true);

-- Leadership - Public can read active leadership
CREATE POLICY "Public read access for active leadership"
  ON leadership FOR SELECT
  USING (is_active = true);

-- Footer Info - Public can read footer
CREATE POLICY "Public read access for footer info"
  ON footer_info FOR SELECT
  USING (true);

-- Theme Settings - Public can read theme
CREATE POLICY "Public read access for theme settings"
  ON theme_settings FOR SELECT
  USING (true);

-- Payment Settings - Public can read (for donation page)
CREATE POLICY "Public read access for payment settings"
  ON payment_settings FOR SELECT
  USING (true);

-- ============================================
-- PUBLIC INSERT ACCESS FOR FORMS
-- ============================================

-- Contact Submissions - Anyone can submit
CREATE POLICY "Public insert access for contact submissions"
  ON contact_submissions FOR INSERT
  WITH CHECK (true);

-- Donations - Anyone can donate
CREATE POLICY "Public insert access for donations"
  ON donations FOR INSERT
  WITH CHECK (true);

-- Analytics - Anyone can log visits
CREATE POLICY "Public insert access for analytics"
  ON analytics FOR INSERT
  WITH CHECK (true);

-- ============================================
-- ADMIN ACCESS (Authenticated Admins Only)
-- ============================================
-- Note: For now using service role key for admin operations
-- In production, implement proper authentication and use these policies

-- Example policy for admin full access (when auth is implemented):
-- CREATE POLICY "Admin full access to hello_slides"
--   ON hello_slides FOR ALL
--   USING (
--     EXISTS (
--       SELECT 1 FROM admins
--       WHERE admins.id = auth.uid()
--     )
--   );

-- ============================================
-- STORAGE BUCKET POLICIES (for image uploads)
-- ============================================
-- Run these in Supabase Storage settings:

-- Create storage bucket:
-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('organization-files', 'organization-files', true);

-- Allow public read access to files:
-- CREATE POLICY "Public read access for organization files"
--   ON storage.objects FOR SELECT
--   USING (bucket_id = 'organization-files');

-- Allow authenticated insert/update/delete (for admins):
-- CREATE POLICY "Authenticated users can upload files"
--   ON storage.objects FOR INSERT
--   WITH CHECK (bucket_id = 'organization-files' AND auth.role() = 'authenticated');

-- CREATE POLICY "Authenticated users can update files"
--   ON storage.objects FOR UPDATE
--   USING (bucket_id = 'organization-files' AND auth.role() = 'authenticated');

-- CREATE POLICY "Authenticated users can delete files"
--   ON storage.objects FOR DELETE
--   USING (bucket_id = 'organization-files' AND auth.role() = 'authenticated');

-- ============================================
-- NOTES
-- ============================================
/*
1. These policies allow public read access to all active content
2. Public can submit contact forms and donations
3. Admin operations currently use service role key (bypass RLS)
4. For production: Implement Supabase Auth for admins
5. Storage policies are commented - enable after creating bucket
6. Test all policies before going live
*/
