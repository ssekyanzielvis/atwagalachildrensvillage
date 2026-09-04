-- =====================================================
-- SETUP VERIFICATION SCRIPT
-- =====================================================
-- Run this after executing COMPLETE_SETUP.sql
-- to verify everything is configured correctly
-- =====================================================

-- 1. Check if all tables were created
SELECT 
  'Database Tables' as check_type,
  COUNT(*) as count,
  CASE 
    WHEN COUNT(*) >= 19 THEN '✅ PASS'
    ELSE '❌ FAIL - Expected 19+ tables'
  END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE';

-- 2. Check if all storage buckets were created
SELECT 
  'Storage Buckets' as check_type,
  COUNT(*) as count,
  CASE 
    WHEN COUNT(*) >= 12 THEN '✅ PASS'
    ELSE '❌ FAIL - Expected 12 buckets'
  END as status
FROM storage.buckets;

-- 3. List all storage buckets
SELECT 
  name as bucket_name,
  public as is_public,
  file_size_limit / 1048576 as max_size_mb,
  created_at
FROM storage.buckets
ORDER BY name;

-- 4. Check if RLS is enabled on all tables
SELECT 
  'RLS Enabled' as check_type,
  COUNT(*) as tables_with_rls,
  CASE 
    WHEN COUNT(*) >= 19 THEN '✅ PASS'
    ELSE '❌ FAIL - Some tables missing RLS'
  END as status
FROM pg_tables
WHERE schemaname = 'public'
  AND rowsecurity = true;

-- 5. Check if superadmin was created
SELECT 
  'Superadmin Account' as check_type,
  COUNT(*) as count,
  CASE 
    WHEN COUNT(*) > 0 THEN '✅ PASS - Superadmin created'
    ELSE '❌ FAIL - Superadmin not found'
  END as status
FROM admins
WHERE email = 'abdulssekyanzi@gmail.com' AND is_active = true;

-- 6. Check if sample data was inserted
SELECT 
  'Sample Data' as check_type,
  'Hello Slides: ' || COUNT(*) as details
FROM hello_slides
UNION ALL
SELECT 
  'Sample Data',
  'Programs: ' || COUNT(*)
FROM programs
UNION ALL
SELECT 
  'Sample Data',
  'Achievements: ' || COUNT(*)
FROM achievements
UNION ALL
SELECT 
  'Sample Data',
  'Core Values: ' || COUNT(*)
FROM core_values;

-- 7. Check storage policies
SELECT 
  'Storage Policies' as check_type,
  COUNT(*) as count,
  CASE 
    WHEN COUNT(*) >= 4 THEN '✅ PASS'
    ELSE '❌ FAIL - Missing storage policies'
  END as status
FROM pg_policies
WHERE schemaname = 'storage'
  AND tablename = 'objects';

-- 8. Check table policies
SELECT 
  tablename,
  COUNT(*) as policy_count
FROM pg_policies
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY tablename;

-- 9. Check indexes
SELECT 
  'Database Indexes' as check_type,
  COUNT(*) as count,
  CASE 
    WHEN COUNT(*) > 10 THEN '✅ PASS'
    ELSE '⚠️ WARNING - Few indexes created'
  END as status
FROM pg_indexes
WHERE schemaname = 'public';

-- 10. Detailed superadmin check
SELECT 
  full_name,
  email,
  phone_number,
  is_active,
  created_at
FROM admins
WHERE email = 'abdulssekyanzi@gmail.com';

-- 11. Check if auth user exists (if using Supabase Auth)
SELECT 
  'Auth User' as check_type,
  COUNT(*) as count,
  CASE 
    WHEN COUNT(*) > 0 THEN '✅ PASS - Auth user exists'
    ELSE '⚠️ WARNING - Create user in Supabase Auth Dashboard'
  END as status
FROM auth.users
WHERE email = 'abdulssekyanzi@gmail.com';

-- 12. Final Summary
SELECT '==========================================';
SELECT 'SETUP VERIFICATION COMPLETE';
SELECT '==========================================';
SELECT '';
SELECT 'Next Steps:';
SELECT '1. Verify all checks show ✅ PASS';
SELECT '2. Create auth user in Supabase Dashboard if needed';
SELECT '3. Test login at /admin/login';
SELECT '4. Check MEDIA_UPLOAD_SETUP.md for storage setup';
SELECT '5. Check DEV_SUPERADMIN_SETUP.md for auth setup';
