-- Quick Database Verification Script
-- Run this in Supabase SQL Editor to check if everything is set up correctly

-- =============================================================================
-- 1. CHECK IF ADMINS TABLE EXISTS
-- =============================================================================
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'admins'
    ) 
    THEN '✅ admins table exists'
    ELSE '❌ admins table NOT FOUND - Run COMPLETE_SETUP.sql'
  END as status;

-- =============================================================================
-- 2. CHECK IF ANY ADMINS EXIST
-- =============================================================================
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM admins WHERE is_active = true)
    THEN '✅ Active admins found: ' || COUNT(*)::text
    ELSE '❌ No active admins - Run COMPLETE_SETUP.sql or create manually'
  END as status,
  COUNT(*) as total_admins,
  COUNT(CASE WHEN is_active THEN 1 END) as active_admins
FROM admins;

-- =============================================================================
-- 3. LIST ALL ACTIVE ADMINS
-- =============================================================================
SELECT 
  id,
  full_name,
  email,
  phone_number,
  created_at
FROM admins
WHERE is_active = true
ORDER BY created_at DESC;

-- =============================================================================
-- 4. CHECK IF hash_password FUNCTION EXISTS
-- =============================================================================
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT FROM pg_proc 
      WHERE proname = 'hash_password'
    )
    THEN '✅ hash_password function exists'
    ELSE '❌ hash_password function NOT FOUND - Run COMPLETE_SETUP.sql'
  END as status;

-- =============================================================================
-- 5. CHECK TABLE COUNT
-- =============================================================================
SELECT 
  COUNT(*) as total_tables,
  CASE 
    WHEN COUNT(*) >= 19 THEN '✅ Expected number of tables (19+)'
    ELSE '⚠️ Missing tables - Expected 19+, found ' || COUNT(*)::text
  END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE';

-- =============================================================================
-- 6. LIST ALL PUBLIC TABLES
-- =============================================================================
SELECT table_name
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- =============================================================================
-- 7. CHECK STORAGE BUCKETS
-- =============================================================================
SELECT 
  COUNT(*) as total_buckets,
  CASE 
    WHEN COUNT(*) >= 12 THEN '✅ Expected number of buckets (12+)'
    ELSE '⚠️ Missing buckets - Expected 12+, found ' || COUNT(*)::text
  END as status
FROM storage.buckets;

-- =============================================================================
-- 8. LIST ALL STORAGE BUCKETS
-- =============================================================================
SELECT 
  name,
  CASE WHEN public THEN '✅ Public' ELSE '🔒 Private' END as access,
  created_at
FROM storage.buckets 
ORDER BY name;

-- =============================================================================
-- 9. CHECK RLS (Row Level Security) STATUS
-- =============================================================================
SELECT 
  tablename,
  CASE 
    WHEN rowsecurity THEN '✅ RLS Enabled' 
    ELSE '⚠️ RLS Disabled' 
  END as rls_status
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- =============================================================================
-- 10. FINAL STATUS SUMMARY
-- =============================================================================
SELECT 
  'Database Setup Status' as check_name,
  CASE 
    WHEN (
      SELECT COUNT(*) FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'admins'
    ) > 0 
    AND (
      SELECT COUNT(*) FROM admins WHERE is_active = true
    ) > 0
    AND (
      SELECT COUNT(*) FROM information_schema.tables 
      WHERE table_schema = 'public'
    ) >= 19
    THEN '✅ READY - Login should work!'
    ELSE '❌ INCOMPLETE - Run COMPLETE_SETUP.sql'
  END as status;

-- =============================================================================
-- QUICK FIX: CREATE TEST ADMIN (Run this if no admins exist)
-- =============================================================================
/*
INSERT INTO admins (full_name, email, password_hash, phone_number, is_active)
VALUES (
  'Test Admin',
  'admin@southern.org',
  '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9', -- password: admin123
  '+256 700 000000',
  true
)
ON CONFLICT (email) DO NOTHING;
*/
