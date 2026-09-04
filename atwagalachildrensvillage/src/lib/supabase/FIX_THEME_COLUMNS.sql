-- Fix theme_settings RLS issue
-- Run this in Supabase SQL Editor

-- Disable RLS on theme_settings for development
ALTER TABLE theme_settings DISABLE ROW LEVEL SECURITY;

-- Insert default theme if none exists
INSERT INTO theme_settings (background_color, text_color, primary_color, font_family)
SELECT '#FFFFFF', '#000000', '#1E40AF', 'system-ui'
WHERE NOT EXISTS (SELECT 1 FROM theme_settings);

-- Verify the table
SELECT * FROM theme_settings;
