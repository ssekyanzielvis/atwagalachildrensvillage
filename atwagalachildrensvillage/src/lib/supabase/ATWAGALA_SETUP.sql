-- =====================================================
-- ATWAGALA CHILDREN'S VILLAGE - COMPLETE SUPABASE SETUP
-- =====================================================
-- This script is designed to support the actual data model used by
-- the Atwagala project and its admin/content management system.
-- Run this in the Supabase SQL editor after creating the project.
-- =====================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- CORE USER / SITE TABLES
-- =====================================================

CREATE TABLE IF NOT EXISTS public.admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  phone_number TEXT,
  image_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  phone_number TEXT,
  role TEXT NOT NULL DEFAULT 'admin',
  avatar_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key TEXT UNIQUE NOT NULL,
  setting_value TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by UUID NULL
);

CREATE TABLE IF NOT EXISTS public.theme_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  background_color TEXT DEFAULT '#FFFFFF',
  text_color TEXT DEFAULT '#000000',
  primary_color TEXT DEFAULT '#0F766E',
  font_family TEXT DEFAULT 'Inter',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by UUID NULL
);

CREATE TABLE IF NOT EXISTS public.footer_info (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_name TEXT,
  location TEXT,
  director TEXT,
  email TEXT,
  phone TEXT,
  organization_type TEXT,
  primary_focus TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.organisation_profile (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL DEFAULT 'Atwagala Children''s Village',
  tagline TEXT DEFAULT 'He loves us',
  description TEXT NOT NULL,
  location TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  director TEXT NOT NULL,
  website_url TEXT,
  logo_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- CONTENT TABLES
-- =====================================================

CREATE TABLE IF NOT EXISTS public.hello_slides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url TEXT NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  direction TEXT DEFAULT 'left',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.about_us (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url TEXT,
  description TEXT NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.vision (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url TEXT,
  statement TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.mission (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url TEXT,
  statement TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.objectives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url TEXT,
  statement TEXT NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  achievement_date DATE NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.core_values (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.gallery (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url TEXT NOT NULL,
  description TEXT,
  category TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.news (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  published_date DATE NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.leadership (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url TEXT NOT NULL,
  full_name TEXT NOT NULL,
  title TEXT NOT NULL,
  achievement TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- FORMS / APPLICATIONS
-- =====================================================

CREATE TABLE IF NOT EXISTS public.contact_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone_number TEXT,
  gender TEXT,
  residence TEXT,
  message TEXT,
  is_contacted BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.staff_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  nationality TEXT,
  sex TEXT,
  dob TEXT,
  is_approved BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.volunteer_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  skills TEXT,
  is_approved BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.partner_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  organization_name TEXT,
  offer TEXT,
  email TEXT NOT NULL,
  nationality TEXT,
  is_approved BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  title TEXT,
  email TEXT,
  phone TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.volunteers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  skills TEXT,
  address TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  organization_name TEXT,
  offer TEXT,
  email TEXT,
  nationality TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- DONATIONS / PAYMENTS
-- =====================================================

CREATE TABLE IF NOT EXISTS public.donations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  donor_name TEXT,
  donor_email TEXT,
  donor_phone TEXT,
  amount NUMERIC(12,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'UGX',
  payment_method TEXT NOT NULL DEFAULT 'manual',
  payment_reference TEXT,
  receipt_number TEXT UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.payment_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mtn_number TEXT,
  airtel_number TEXT,
  bank_name TEXT,
  bank_account_name TEXT,
  bank_account_number TEXT,
  instructions TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.payment_numbers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  network_name TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  account_name TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.office_hours (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  day_label TEXT NOT NULL,
  hours TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- ANALYTICS
-- =====================================================

CREATE TABLE IF NOT EXISTS public.analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_path TEXT,
  visitor_id TEXT,
  session_id TEXT,
  action_type TEXT DEFAULT 'page_view',
  event_name TEXT,
  country TEXT,
  device_type TEXT,
  user_agent TEXT,
  referrer TEXT,
  form_name TEXT,
  button_name TEXT,
  link_url TEXT,
  amount NUMERIC(12,2),
  visited_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_path TEXT,
  event_name TEXT,
  visitor_id TEXT,
  session_id TEXT,
  country TEXT,
  device_type TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- TRIGGERS
-- =====================================================

CREATE TRIGGER trg_admins_updated_at
BEFORE UPDATE ON public.admins
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_admin_users_updated_at
BEFORE UPDATE ON public.admin_users
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_site_settings_updated_at
BEFORE UPDATE ON public.site_settings
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_theme_settings_updated_at
BEFORE UPDATE ON public.theme_settings
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_footer_info_updated_at
BEFORE UPDATE ON public.footer_info
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_organisation_profile_updated_at
BEFORE UPDATE ON public.organisation_profile
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_hello_slides_updated_at
BEFORE UPDATE ON public.hello_slides
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_about_us_updated_at
BEFORE UPDATE ON public.about_us
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_vision_updated_at
BEFORE UPDATE ON public.vision
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_mission_updated_at
BEFORE UPDATE ON public.mission
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_objectives_updated_at
BEFORE UPDATE ON public.objectives
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_programs_updated_at
BEFORE UPDATE ON public.programs
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_achievements_updated_at
BEFORE UPDATE ON public.achievements
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_core_values_updated_at
BEFORE UPDATE ON public.core_values
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_gallery_updated_at
BEFORE UPDATE ON public.gallery
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_news_updated_at
BEFORE UPDATE ON public.news
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_leadership_updated_at
BEFORE UPDATE ON public.leadership
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_donations_updated_at
BEFORE UPDATE ON public.donations
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_payment_settings_updated_at
BEFORE UPDATE ON public.payment_settings
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_payment_numbers_updated_at
BEFORE UPDATE ON public.payment_numbers
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_office_hours_updated_at
BEFORE UPDATE ON public.office_hours
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_staff_updated_at
BEFORE UPDATE ON public.staff
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_volunteers_updated_at
BEFORE UPDATE ON public.volunteers
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_partners_updated_at
BEFORE UPDATE ON public.partners
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =====================================================
-- DEFAULT DATA
-- =====================================================

INSERT INTO public.admins (full_name, email, password_hash, phone_number, image_url, is_active)
VALUES (
  'System Administrator',
  'abdulssekyanzi@gmail.com',
  encode(digest('Su4at3#0', 'sha256'), 'hex'),
  '+256 771 923 504',
  NULL,
  true
)
ON CONFLICT (email) DO NOTHING;

INSERT INTO public.organisation_profile (
  name, tagline, description, location, phone, email, director, website_url
) VALUES (
  'Atwagala Children''s Village',
  'He loves us',
  'Atwagala Children''s Village is a community-based organization in Nawampiti Village, Luuka District, Eastern Uganda, dedicated to supporting orphaned and vulnerable children and strengthening their families through outreach and compassionate care.',
  'Nawampiti Village, Luuka District, Eastern Uganda',
  '+256 771 923 504',
  'atwagalachildrensvillage@gmail.com',
  'Mbogo Shafiq',
  'https://atwagala.org'
)
ON CONFLICT DO NOTHING;

INSERT INTO public.footer_info (
  organization_name, location, director, email, phone, organization_type, primary_focus
) VALUES (
  'Atwagala Children''s Village',
  'Nawampiti Village, Luuka District, Eastern Uganda',
  'Mbogo Shafiq',
  'atwagalachildrensvillage@gmail.com',
  '+256 771 923 504',
  'Children''s organization',
  'Child care, education, family support and community outreach'
)
ON CONFLICT DO NOTHING;

INSERT INTO public.theme_settings (
  background_color, text_color, primary_color, font_family
) VALUES (
  '#FFFFFF',
  '#111827',
  '#0F766E',
  'Inter'
)
ON CONFLICT DO NOTHING;

INSERT INTO public.site_settings (setting_key, setting_value)
VALUES
  ('organization_name', 'Atwagala Children''s Village'),
  ('organization_phone', '+256 771 923 504'),
  ('organization_email', 'atwagalachildrensvillage@gmail.com'),
  ('organization_location', 'Nawampiti Village, Luuka District, Eastern Uganda'),
  ('organization_director', 'Mbogo Shafiq'),
  ('organization_tagline', 'He loves us')
ON CONFLICT (setting_key) DO NOTHING;

INSERT INTO public.payment_settings (
  mtn_number, airtel_number, bank_name, bank_account_name, bank_account_number, instructions
) VALUES (
  '+256 771 923 504',
  NULL,
  'Stanbic / Bank of Uganda',
  'Atwagala Children''s Village',
  '0000000000',
  'Use mobile money or direct bank transfer to support Atwagala Children''s Village.'
)
ON CONFLICT DO NOTHING;

INSERT INTO public.payment_numbers (
  network_name, phone_number, account_name, is_active, display_order
) VALUES
  ('MTN', '+256 771 923 504', 'Atwagala Children''s Village', true, 1),
  ('Airtel', '+256 774 000 000', 'Atwagala Children''s Village', true, 2)
ON CONFLICT DO NOTHING;

INSERT INTO public.office_hours (
  day_label, hours, is_active, display_order
) VALUES
  ('Monday - Friday', '9:00 AM - 5:00 PM', true, 1),
  ('Saturday', '10:00 AM - 2:00 PM', true, 2),
  ('Sunday', 'Closed', false, 3)
ON CONFLICT DO NOTHING;

-- =====================================================
-- INDEXES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_admins_email ON public.admins (email);
CREATE INDEX IF NOT EXISTS idx_site_settings_key ON public.site_settings (setting_key);
CREATE INDEX IF NOT EXISTS idx_programs_active ON public.programs (is_active, order_index);
CREATE INDEX IF NOT EXISTS idx_news_active ON public.news (is_active, published_date DESC);
CREATE INDEX IF NOT EXISTS idx_gallery_active ON public.gallery (is_active, order_index);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_created ON public.contact_submissions (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_donations_created ON public.donations (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_visited ON public.analytics (visited_at DESC);

-- =====================================================
-- STORAGE BUCKETS
-- =====================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('hello-slides', 'hello-slides', true, 10485760, ARRAY['image/jpeg','image/png','image/webp','image/gif','video/mp4','video/webm','video/quicktime']),
  ('about-us', 'about-us', true, 10485760, ARRAY['image/jpeg','image/png','image/webp','image/gif']),
  ('vision', 'vision', true, 10485760, ARRAY['image/jpeg','image/png','image/webp','image/gif']),
  ('mission', 'mission', true, 10485760, ARRAY['image/jpeg','image/png','image/webp','image/gif']),
  ('objectives', 'objectives', true, 10485760, ARRAY['image/jpeg','image/png','image/webp','image/gif']),
  ('programs', 'programs', true, 10485760, ARRAY['image/jpeg','image/png','image/webp','image/gif','video/mp4','video/webm']),
  ('achievements', 'achievements', true, 10485760, ARRAY['image/jpeg','image/png','image/webp','image/gif','video/mp4','video/webm']),
  ('core-values', 'core-values', true, 10485760, ARRAY['image/jpeg','image/png','image/webp','image/gif']),
  ('gallery', 'gallery', true, 20971520, ARRAY['image/jpeg','image/png','image/webp','image/gif','image/svg+xml','video/mp4','video/webm','video/quicktime','video/x-msvideo']),
  ('news', 'news', true, 10485760, ARRAY['image/jpeg','image/png','image/webp','image/gif','video/mp4','video/webm']),
  ('leadership', 'leadership', true, 5242880, ARRAY['image/jpeg','image/png','image/webp']),
  ('admin-profiles', 'admin-profiles', true, 2097152, ARRAY['image/jpeg','image/png','image/webp'])
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- =====================================================
-- NOTE: Storage policies for the internal storage.objects table
-- are managed by Supabase and are ownership-protected.
-- Do not run ALTER TABLE / DROP POLICY / CREATE POLICY against
-- storage.objects from a standard project role, because Supabase
-- only allows that under the Postgres owner role.
--
-- Instead, create or adjust the policies in the Supabase Dashboard:
-- Storage > Buckets > select each bucket > Policies
--
-- A safe public access pattern is:
--  - allow SELECT for all public buckets
--  - allow INSERT/UPDATE/DELETE for authenticated users only
--  - restrict bucket_id to the Atwagala bucket list shown above
-- =====================================================

-- =====================================================
-- END
-- =====================================================
