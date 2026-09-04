-- Disable RLS on all tables for development
-- Run this in Supabase SQL Editor
-- WARNING: Only use this in development, not production!

-- Core content tables
ALTER TABLE hello_slides DISABLE ROW LEVEL SECURITY;
ALTER TABLE about_us DISABLE ROW LEVEL SECURITY;
ALTER TABLE vision DISABLE ROW LEVEL SECURITY;
ALTER TABLE mission DISABLE ROW LEVEL SECURITY;
ALTER TABLE objectives DISABLE ROW LEVEL SECURITY;
ALTER TABLE programs DISABLE ROW LEVEL SECURITY;
ALTER TABLE achievements DISABLE ROW LEVEL SECURITY;
ALTER TABLE core_values DISABLE ROW LEVEL SECURITY;
ALTER TABLE leadership DISABLE ROW LEVEL SECURITY;
ALTER TABLE gallery DISABLE ROW LEVEL SECURITY;
ALTER TABLE news DISABLE ROW LEVEL SECURITY;

-- User interaction tables
ALTER TABLE contact_submissions DISABLE ROW LEVEL SECURITY;
ALTER TABLE donations DISABLE ROW LEVEL SECURITY;
ALTER TABLE analytics DISABLE ROW LEVEL SECURITY;

-- Settings tables
ALTER TABLE admins DISABLE ROW LEVEL SECURITY;
ALTER TABLE footer_info DISABLE ROW LEVEL SECURITY;
ALTER TABLE payment_settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE theme_settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings DISABLE ROW LEVEL SECURITY;

-- Verify all tables have RLS disabled
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname IN ('public')
ORDER BY tablename;
