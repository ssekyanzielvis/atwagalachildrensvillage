-- Fix theme_settings RLS for development
-- Run this in Supabase SQL Editor

-- Option 1: Disable RLS completely (for development only)
ALTER TABLE theme_settings DISABLE ROW LEVEL SECURITY;

-- Option 2: Create permissive policies (uncomment if you prefer this approach)
-- DROP POLICY IF EXISTS "Allow all operations on theme_settings" ON theme_settings;
-- 
-- CREATE POLICY "Allow all operations on theme_settings" 
-- ON theme_settings 
-- FOR ALL 
-- USING (true) 
-- WITH CHECK (true);

-- Ensure theme_settings table exists
CREATE TABLE IF NOT EXISTS theme_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  background_color VARCHAR(7) DEFAULT '#FFFFFF',
  text_color VARCHAR(7) DEFAULT '#000000',
  primary_color VARCHAR(7) DEFAULT '#1E40AF',
  font_family VARCHAR(100) DEFAULT 'system-ui',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_by UUID REFERENCES admins(id)
);

-- Insert default theme if none exists
INSERT INTO theme_settings (background_color, text_color, primary_color, font_family)
SELECT '#FFFFFF', '#000000', '#1E40AF', 'system-ui'
WHERE NOT EXISTS (SELECT 1 FROM theme_settings);

-- Verify
SELECT * FROM theme_settings;
