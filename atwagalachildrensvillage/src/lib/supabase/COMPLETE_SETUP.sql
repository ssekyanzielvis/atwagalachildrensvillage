-- =====================================================
-- SOUTHERN ORGANIZATION PLATFORM - COMPLETE SETUP
-- =====================================================
-- This is the complete database and storage setup script
-- Run this in Supabase SQL Editor to set up the entire system
-- 
-- Author: System Setup Script
-- Date: January 5, 2026
-- Version: 1.0
-- =====================================================

-- =====================================================
-- PART 1: EXTENSIONS & SCHEMA SETUP
-- =====================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- PART 2: CREATE ALL DATABASE TABLES
-- =====================================================

-- Admins table
CREATE TABLE IF NOT EXISTS admins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  phone_number VARCHAR(20),
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Site settings table
CREATE TABLE IF NOT EXISTS site_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  setting_key VARCHAR(100) UNIQUE NOT NULL,
  setting_value TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_by UUID REFERENCES admins(id)
);

-- Theme customization table
CREATE TABLE IF NOT EXISTS theme_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  backgroundColor VARCHAR(7) DEFAULT '#FFFFFF',
  textColor VARCHAR(7) DEFAULT '#000000',
  primaryColor VARCHAR(7) DEFAULT '#0000FF',
  fontFamily VARCHAR(100) DEFAULT 'Inter',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_by UUID REFERENCES admins(id)
);

-- Footer information table
CREATE TABLE IF NOT EXISTS footer_info (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_name VARCHAR(255),
  location TEXT,
  director VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(20),
  organization_type VARCHAR(100),
  primary_focus TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Hello Slides table
CREATE TABLE IF NOT EXISTS hello_slides (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  image_url TEXT NOT NULL,
  description TEXT,
  order_index INTEGER DEFAULT 0,
  direction VARCHAR(10) DEFAULT 'left',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- About Us content table
CREATE TABLE IF NOT EXISTS about_us (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  image_url TEXT,
  description TEXT NOT NULL,
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Vision table
CREATE TABLE IF NOT EXISTS vision (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  image_url TEXT,
  statement TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Mission table
CREATE TABLE IF NOT EXISTS mission (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  image_url TEXT,
  statement TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Objectives table
CREATE TABLE IF NOT EXISTS objectives (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  image_url TEXT,
  statement TEXT NOT NULL,
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Programs table
CREATE TABLE IF NOT EXISTS programs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT,
  order_index INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Achievements table
CREATE TABLE IF NOT EXISTS achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  image_url TEXT NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  achievement_date DATE NOT NULL,
  order_index INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Core Values table
CREATE TABLE IF NOT EXISTS core_values (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  image_url TEXT NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  order_index INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Gallery table (with media type support)
CREATE TABLE IF NOT EXISTS gallery (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  media_url TEXT NOT NULL,
  media_type VARCHAR(10) DEFAULT 'image' CHECK (media_type IN ('image', 'video')),
  description TEXT,
  category VARCHAR(100),
  order_index INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- News table
CREATE TABLE IF NOT EXISTS news (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  image_url TEXT NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  published_date DATE NOT NULL,
  order_index INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Leadership table
CREATE TABLE IF NOT EXISTS leadership (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  image_url TEXT NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  title VARCHAR(255) NOT NULL,
  achievement TEXT,
  order_index INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Contact submissions table
CREATE TABLE IF NOT EXISTS contact_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone_number VARCHAR(20),
  gender VARCHAR(20),
  residence TEXT,
  message TEXT,
  is_contacted BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Donations table
CREATE TABLE IF NOT EXISTS donations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  donor_name VARCHAR(255) NOT NULL,
  donor_email VARCHAR(255),
  donor_phone VARCHAR(20),
  amount DECIMAL(10, 2) NOT NULL,
  payment_method VARCHAR(50) NOT NULL,
  payment_reference VARCHAR(255),
  receipt_number VARCHAR(50) UNIQUE,
  receipt_generated BOOLEAN DEFAULT false,
  receipt_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payment settings table
CREATE TABLE IF NOT EXISTS payment_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mtn_number VARCHAR(20),
  mtn_name VARCHAR(255),
  airtel_number VARCHAR(20),
  airtel_name VARCHAR(255),
  manual_payment_instructions TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Analytics table
CREATE TABLE IF NOT EXISTS analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  page_path VARCHAR(255),
  visitor_id VARCHAR(255),
  session_id VARCHAR(255),
  action_type VARCHAR(50),
  visitor_ip VARCHAR(45),
  device_type VARCHAR(50),
  country VARCHAR(100),
  user_agent TEXT,
  referrer TEXT,
  visited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- PART 3: CREATE STORAGE BUCKETS
-- =====================================================

-- 1. Hello Slides Bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'hello-slides',
  'hello-slides',
  true,
  10485760,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm', 'video/quicktime']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm', 'video/quicktime'];

-- 2. About Us Content Bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'about-us',
  'about-us',
  true,
  10485760,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

-- 3. Vision Bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'vision',
  'vision',
  true,
  10485760,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

-- 4. Mission Bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'mission',
  'mission',
  true,
  10485760,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

-- 5. Objectives Bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'objectives',
  'objectives',
  true,
  10485760,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

-- 6. Programs Bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'programs',
  'programs',
  true,
  10485760,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm'];

-- 7. Achievements Bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'achievements',
  'achievements',
  true,
  10485760,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm'];

-- 8. Core Values Bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'core-values',
  'core-values',
  true,
  10485760,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

-- 9. Gallery Bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'gallery',
  'gallery',
  true,
  20971520,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml', 'video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 20971520,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml', 'video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo'];

-- 10. News Bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'news',
  'news',
  true,
  10485760,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm'];

-- 11. Leadership Bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'leadership',
  'leadership',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp'];

-- 12. Admin Profile Images Bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'admin-profiles',
  'admin-profiles',
  true,
  2097152,
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 2097152,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp'];

-- =====================================================
-- PART 4: STORAGE POLICIES (Row Level Security)
-- =====================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete" ON storage.objects;

-- Policy: Allow public read access to all buckets
CREATE POLICY "Public Access"
  ON storage.objects FOR SELECT
  USING (bucket_id IN (
    'hello-slides', 'about-us', 'vision', 'mission', 'objectives',
    'programs', 'achievements', 'core-values', 'gallery', 'news',
    'leadership', 'admin-profiles'
  ));

-- Policy: Allow authenticated users (admins) to upload files
CREATE POLICY "Authenticated users can upload"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id IN (
      'hello-slides', 'about-us', 'vision', 'mission', 'objectives',
      'programs', 'achievements', 'core-values', 'gallery', 'news',
      'leadership', 'admin-profiles'
    )
    AND auth.role() = 'authenticated'
  );

-- Policy: Allow authenticated users (admins) to update files
CREATE POLICY "Authenticated users can update"
  ON storage.objects FOR UPDATE
  WITH CHECK (
    bucket_id IN (
      'hello-slides', 'about-us', 'vision', 'mission', 'objectives',
      'programs', 'achievements', 'core-values', 'gallery', 'news',
      'leadership', 'admin-profiles'
    )
    AND auth.role() = 'authenticated'
  );

-- Policy: Allow authenticated users (admins) to delete files
CREATE POLICY "Authenticated users can delete"
  ON storage.objects FOR DELETE
  USING (
    bucket_id IN (
      'hello-slides', 'about-us', 'vision', 'mission', 'objectives',
      'programs', 'achievements', 'core-values', 'gallery', 'news',
      'leadership', 'admin-profiles'
    )
    AND auth.role() = 'authenticated'
  );

-- =====================================================
-- PART 5: ENABLE ROW LEVEL SECURITY ON TABLES
-- =====================================================

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

-- =====================================================
-- PART 6: CREATE RLS POLICIES FOR TABLES
-- =====================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public read access for active hello slides" ON hello_slides;
DROP POLICY IF EXISTS "Public read access for active about content" ON about_us;
DROP POLICY IF EXISTS "Public read access for active vision" ON vision;
DROP POLICY IF EXISTS "Public read access for active mission" ON mission;
DROP POLICY IF EXISTS "Public read access for active objectives" ON objectives;
DROP POLICY IF EXISTS "Public read access for active programs" ON programs;
DROP POLICY IF EXISTS "Public read access for active achievements" ON achievements;
DROP POLICY IF EXISTS "Public read access for active core values" ON core_values;
DROP POLICY IF EXISTS "Public read access for active gallery" ON gallery;
DROP POLICY IF EXISTS "Public read access for active news" ON news;
DROP POLICY IF EXISTS "Public read access for active leadership" ON leadership;
DROP POLICY IF EXISTS "Public read access for footer info" ON footer_info;
DROP POLICY IF EXISTS "Public can submit contact forms" ON contact_submissions;
DROP POLICY IF EXISTS "Public can create donations" ON donations;
DROP POLICY IF EXISTS "Public can insert analytics" ON analytics;
DROP POLICY IF EXISTS "Authenticated admins full access hello slides" ON hello_slides;
DROP POLICY IF EXISTS "Authenticated admins full access about" ON about_us;
DROP POLICY IF EXISTS "Authenticated admins full access vision" ON vision;
DROP POLICY IF EXISTS "Authenticated admins full access mission" ON mission;
DROP POLICY IF EXISTS "Authenticated admins full access objectives" ON objectives;
DROP POLICY IF EXISTS "Authenticated admins full access programs" ON programs;
DROP POLICY IF EXISTS "Authenticated admins full access achievements" ON achievements;
DROP POLICY IF EXISTS "Authenticated admins full access core values" ON core_values;
DROP POLICY IF EXISTS "Authenticated admins full access gallery" ON gallery;
DROP POLICY IF EXISTS "Authenticated admins full access news" ON news;
DROP POLICY IF EXISTS "Authenticated admins full access leadership" ON leadership;
DROP POLICY IF EXISTS "Authenticated admins full access contacts" ON contact_submissions;
DROP POLICY IF EXISTS "Authenticated admins full access donations" ON donations;
DROP POLICY IF EXISTS "Authenticated admins full access settings" ON site_settings;
DROP POLICY IF EXISTS "Authenticated admins full access theme" ON theme_settings;
DROP POLICY IF EXISTS "Authenticated admins full access footer" ON footer_info;
DROP POLICY IF EXISTS "Authenticated admins full access payment settings" ON payment_settings;
DROP POLICY IF EXISTS "Authenticated admins full access analytics" ON analytics;
DROP POLICY IF EXISTS "Authenticated admins can read own data" ON admins;
DROP POLICY IF EXISTS "Authenticated admins can update own data" ON admins;

-- PUBLIC READ ACCESS POLICIES
CREATE POLICY "Public read access for active hello slides"
  ON hello_slides FOR SELECT
  USING (is_active = true);

CREATE POLICY "Public read access for active about content"
  ON about_us FOR SELECT
  USING (is_active = true);

CREATE POLICY "Public read access for active vision"
  ON vision FOR SELECT
  USING (is_active = true);

CREATE POLICY "Public read access for active mission"
  ON mission FOR SELECT
  USING (is_active = true);

CREATE POLICY "Public read access for active objectives"
  ON objectives FOR SELECT
  USING (is_active = true);

CREATE POLICY "Public read access for active programs"
  ON programs FOR SELECT
  USING (is_active = true);

CREATE POLICY "Public read access for active achievements"
  ON achievements FOR SELECT
  USING (is_active = true);

CREATE POLICY "Public read access for active core values"
  ON core_values FOR SELECT
  USING (is_active = true);

CREATE POLICY "Public read access for active gallery"
  ON gallery FOR SELECT
  USING (is_active = true);

CREATE POLICY "Public read access for active news"
  ON news FOR SELECT
  USING (is_active = true);

CREATE POLICY "Public read access for active leadership"
  ON leadership FOR SELECT
  USING (is_active = true);

CREATE POLICY "Public read access for footer info"
  ON footer_info FOR SELECT
  USING (true);

-- PUBLIC WRITE ACCESS (for contact forms, donations, analytics)
CREATE POLICY "Public can submit contact forms"
  ON contact_submissions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Public can create donations"
  ON donations FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Public can insert analytics"
  ON analytics FOR INSERT
  WITH CHECK (true);

-- AUTHENTICATED ADMIN FULL ACCESS
CREATE POLICY "Authenticated admins full access hello slides"
  ON hello_slides FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated admins full access about"
  ON about_us FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated admins full access vision"
  ON vision FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated admins full access mission"
  ON mission FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated admins full access objectives"
  ON objectives FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated admins full access programs"
  ON programs FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated admins full access achievements"
  ON achievements FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated admins full access core values"
  ON core_values FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated admins full access gallery"
  ON gallery FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated admins full access news"
  ON news FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated admins full access leadership"
  ON leadership FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated admins full access contacts"
  ON contact_submissions FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated admins full access donations"
  ON donations FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated admins full access settings"
  ON site_settings FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated admins full access theme"
  ON theme_settings FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated admins full access footer"
  ON footer_info FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated admins full access payment settings"
  ON payment_settings FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated admins full access analytics"
  ON analytics FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- ADMINS TABLE POLICIES
CREATE POLICY "Authenticated admins can read own data"
  ON admins FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated admins can update own data"
  ON admins FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- =====================================================
-- PART 7: CREATE DEVELOPMENT SUPERADMIN
-- =====================================================
-- This creates a special admin account for development
-- Email: abdulssekyanzi@gmail.com
-- Password: Su4at3#0
-- This account will be created in Supabase Auth

-- First, create the user in Supabase Auth (you need to do this in the Supabase Dashboard > Authentication > Add User)
-- Or use the following approach to insert directly into admins table with a hashed password

-- Create a special function to hash the password
CREATE OR REPLACE FUNCTION hash_password(password TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN encode(digest(password, 'sha256'), 'hex');
END;
$$ LANGUAGE plpgsql;

-- Insert the development superadmin
INSERT INTO admins (full_name, email, password_hash, phone_number, is_active)
VALUES (
  'System Developer',
  'abdulssekyanzi@gmail.com',
  hash_password('Su4at3#0'),
  '+256 700 000000',
  true
)
ON CONFLICT (email) DO UPDATE SET
  password_hash = hash_password('Su4at3#0'),
  is_active = true;

-- =====================================================
-- PART 8: INITIAL SAMPLE DATA
-- =====================================================

-- Insert default theme settings
INSERT INTO theme_settings (backgroundColor, textColor, primaryColor, fontFamily)
VALUES ('#FFFFFF', '#000000', '#0000FF', 'Inter')
ON CONFLICT DO NOTHING;

-- Insert default footer info
INSERT INTO footer_info (organization_name, location, director, email, phone, organization_type, primary_focus)
VALUES (
  'Southern Organization',
  'Kampala, Uganda',
  'Director Name',
  'info@southern.org',
  '+256 700 000000',
  'Non-Profit Organization',
  'Community Development and Education'
)
ON CONFLICT DO NOTHING;

-- Insert default payment settings
INSERT INTO payment_settings (mtn_number, mtn_name, airtel_number, airtel_name)
VALUES (
  '+256 700 000000',
  'Organization MTN',
  '+256 750 000000',
  'Organization Airtel'
)
ON CONFLICT DO NOTHING;

-- Insert sample hello slides
INSERT INTO hello_slides (image_url, description, order_index, direction) 
VALUES
  ('https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800', 'Empowering communities through education and development', 1, 'left'),
  ('https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800', 'Building a better future together', 2, 'left'),
  ('https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=800', 'Creating lasting positive change', 3, 'left')
ON CONFLICT DO NOTHING;

-- Insert sample about us content
INSERT INTO about_us (description, image_url, order_index) 
VALUES
  ('Southern Organization is a community-based non-profit dedicated to creating sustainable change through education, empowerment, and collaboration.', 
   'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=800', 
   1),
  ('Our approach combines grassroots engagement with evidence-based interventions to address the root causes of poverty and inequality.', 
   'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800', 
   2)
ON CONFLICT DO NOTHING;

-- Insert vision
INSERT INTO vision (statement, image_url) 
VALUES
  ('A world where every individual has access to opportunities for growth, development, and prosperity.',
   'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800')
ON CONFLICT DO NOTHING;

-- Insert mission
INSERT INTO mission (statement, image_url) 
VALUES
  ('To empower communities through sustainable programs in education, healthcare, and economic development.',
   'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=800')
ON CONFLICT DO NOTHING;

-- Insert sample objectives
INSERT INTO objectives (statement, image_url, order_index) 
VALUES
  ('Provide quality education to underserved communities', 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800', 1),
  ('Improve access to healthcare and medical services', 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800', 2),
  ('Create sustainable economic opportunities', 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800', 3)
ON CONFLICT DO NOTHING;

-- Insert sample programs
INSERT INTO programs (title, description, image_url, order_index, is_featured) 
VALUES
  ('Education Initiative', 'Providing quality education and learning materials to children in rural communities.', 
   'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800', 1, true),
  ('Healthcare Access', 'Mobile health clinics bringing medical care to remote areas.', 
   'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800', 2, true),
  ('Economic Empowerment', 'Skills training and microfinance programs for sustainable livelihoods.', 
   'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800', 3, false)
ON CONFLICT DO NOTHING;

-- Insert sample achievements
INSERT INTO achievements (title, description, achievement_date, image_url, order_index) 
VALUES
  ('1000+ Students Educated', 'Successfully provided education to over 1000 children in the past year.', 
   '2025-12-31', 'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=800', 1),
  ('10 Health Clinics Established', 'Opened 10 new community health centers serving 50,000 people.', 
   '2025-11-15', 'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=800', 2)
ON CONFLICT DO NOTHING;

-- Insert sample core values
INSERT INTO core_values (title, description, image_url, order_index) 
VALUES
  ('Integrity', 'We uphold the highest standards of honesty and ethical behavior in all our actions.', 
   'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=800', 1),
  ('Compassion', 'We approach our work with empathy and a deep commitment to serving those in need.', 
   'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=800', 2),
  ('Excellence', 'We strive for the highest quality in everything we do, continuously improving our impact.', 
   'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800', 3)
ON CONFLICT DO NOTHING;

-- =====================================================
-- PART 9: CREATE INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_hello_slides_active ON hello_slides(is_active, order_index);
CREATE INDEX IF NOT EXISTS idx_about_us_active ON about_us(is_active, order_index);
CREATE INDEX IF NOT EXISTS idx_objectives_active ON objectives(is_active, order_index);
CREATE INDEX IF NOT EXISTS idx_programs_active ON programs(is_active, is_featured);
CREATE INDEX IF NOT EXISTS idx_achievements_active ON achievements(is_active, achievement_date DESC);
CREATE INDEX IF NOT EXISTS idx_core_values_active ON core_values(is_active, order_index);
CREATE INDEX IF NOT EXISTS idx_gallery_active ON gallery(is_active, category);
CREATE INDEX IF NOT EXISTS idx_news_active ON news(is_active, published_date DESC);
CREATE INDEX IF NOT EXISTS idx_leadership_active ON leadership(is_active, order_index);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_created ON contact_submissions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_donations_created ON donations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_visited ON analytics(visited_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_page_path ON analytics(page_path);
CREATE INDEX IF NOT EXISTS idx_admins_email ON admins(email);

-- =====================================================
-- SETUP COMPLETE!
-- =====================================================
-- Verification Query - Run this to confirm setup:
-- SELECT 'Tables' as type, count(*) as count FROM information_schema.tables WHERE table_schema = 'public'
-- UNION ALL
-- SELECT 'Storage Buckets', count(*) FROM storage.buckets
-- UNION ALL
-- SELECT 'Admins', count(*) FROM admins;
