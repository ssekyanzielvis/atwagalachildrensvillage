-- Final verification checks for Atwagala Children's Village
-- Run after applying setup/migration scripts.

-- 1) Required public tables
WITH required_tables AS (
  SELECT unnest(ARRAY[
    'about_us','achievements','admins','analytics','contact_submissions','core_values',
    'donations','footer_info','gallery','hello_slides','leadership','mission','news',
    'objectives','office_hours','partners','payment_numbers','payment_settings',
    'programs','staff','theme_settings','vision','volunteers'
  ]) AS table_name
), existing AS (
  SELECT table_name
  FROM information_schema.tables
  WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
)
SELECT
  rt.table_name,
  CASE WHEN e.table_name IS NULL THEN 'MISSING' ELSE 'OK' END AS status
FROM required_tables rt
LEFT JOIN existing e ON e.table_name = rt.table_name
ORDER BY rt.table_name;

-- 2) Required analytics columns for app tracking and dashboard
WITH required_columns AS (
  SELECT unnest(ARRAY[
    'page_path','visitor_id','session_id','action_type','device_type',
    'user_agent','referrer','visited_at'
  ]) AS column_name
), existing AS (
  SELECT column_name
  FROM information_schema.columns
  WHERE table_schema = 'public' AND table_name = 'analytics'
)
SELECT
  rc.column_name,
  CASE WHEN e.column_name IS NULL THEN 'MISSING' ELSE 'OK' END AS status
FROM required_columns rc
LEFT JOIN existing e ON e.column_name = rc.column_name
ORDER BY rc.column_name;

-- 3) Required storage buckets used by admin upload forms
WITH required_buckets AS (
  SELECT unnest(ARRAY[
    'hello-slides','about-us','vision','mission','objectives','programs',
    'achievements','core-values','gallery','news','leadership','admin-profiles'
  ]) AS bucket_name
), existing AS (
  SELECT id AS bucket_name FROM storage.buckets
)
SELECT
  rb.bucket_name,
  CASE WHEN e.bucket_name IS NULL THEN 'MISSING' ELSE 'OK' END AS status
FROM required_buckets rb
LEFT JOIN existing e ON e.bucket_name = rb.bucket_name
ORDER BY rb.bucket_name;

-- 4) Development admin account check
SELECT
  email,
  full_name,
  is_active,
  created_at
FROM admins
WHERE lower(email) = 'abdulssekyanzi@gmail.com';

-- 5) RLS enabled check (informational)
SELECT
  tablename,
  rowsecurity AS rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN (
    'admins','analytics','contact_submissions','donations','footer_info',
    'hello_slides','programs','gallery','news','leadership','payment_settings'
  )
ORDER BY tablename;
