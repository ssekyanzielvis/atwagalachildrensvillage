-- Database Migration: Fix Missing Fields and Schema Issues
-- Run this in Supabase SQL Editor AFTER running the main schema.sql

-- 1. Add missing order_index fields
ALTER TABLE programs ADD COLUMN IF NOT EXISTS order_index INTEGER DEFAULT 0;
ALTER TABLE achievements ADD COLUMN IF NOT EXISTS order_index INTEGER DEFAULT 0;
ALTER TABLE core_values ADD COLUMN IF NOT EXISTS order_index INTEGER DEFAULT 0;
ALTER TABLE gallery ADD COLUMN IF NOT EXISTS order_index INTEGER DEFAULT 0;
ALTER TABLE news ADD COLUMN IF NOT EXISTS order_index INTEGER DEFAULT 0;

-- 2. Add missing is_featured field to leadership
ALTER TABLE leadership ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;

-- 3. Add missing receipt_number field to donations
ALTER TABLE donations ADD COLUMN IF NOT EXISTS receipt_number VARCHAR(50) UNIQUE;

-- 4. Add missing is_active field to admins
ALTER TABLE admins ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- 5. Add missing analytics fields
ALTER TABLE analytics ADD COLUMN IF NOT EXISTS visitor_id VARCHAR(255);
ALTER TABLE analytics ADD COLUMN IF NOT EXISTS session_id VARCHAR(255);
ALTER TABLE analytics ADD COLUMN IF NOT EXISTS action_type VARCHAR(100) DEFAULT 'page_view';
ALTER TABLE analytics ADD COLUMN IF NOT EXISTS device_type VARCHAR(50);
ALTER TABLE analytics ADD COLUMN IF NOT EXISTS country VARCHAR(100);
ALTER TABLE analytics ADD COLUMN IF NOT EXISTS user_agent TEXT;
ALTER TABLE analytics ADD COLUMN IF NOT EXISTS referrer TEXT;
ALTER TABLE analytics ADD COLUMN IF NOT EXISTS form_name VARCHAR(255);
ALTER TABLE analytics ADD COLUMN IF NOT EXISTS button_name VARCHAR(255);
ALTER TABLE analytics ADD COLUMN IF NOT EXISTS link_url TEXT;
ALTER TABLE analytics ADD COLUMN IF NOT EXISTS amount NUMERIC(12,2);
ALTER TABLE analytics ADD COLUMN IF NOT EXISTS visited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- If an older schema used created_at instead of visited_at, backfill visited_at.
UPDATE analytics
SET visited_at = created_at
WHERE visited_at IS NULL
	AND created_at IS NOT NULL;

-- 6. Fix payment_settings table structure
-- Drop old columns if they exist
ALTER TABLE payment_settings DROP COLUMN IF EXISTS mobile_money_number;
ALTER TABLE payment_settings DROP COLUMN IF EXISTS mobile_money_name;
ALTER TABLE payment_settings DROP COLUMN IF EXISTS mobile_money_network;

-- Add correct columns
ALTER TABLE payment_settings ADD COLUMN IF NOT EXISTS mtn_number VARCHAR(20);
ALTER TABLE payment_settings ADD COLUMN IF NOT EXISTS airtel_number VARCHAR(20);
ALTER TABLE payment_settings ADD COLUMN IF NOT EXISTS manual_payment_instructions TEXT;

-- 7. Fix theme_settings table - rename columns to camelCase
ALTER TABLE theme_settings RENAME COLUMN background_color TO "backgroundColor";
ALTER TABLE theme_settings RENAME COLUMN text_color TO "textColor";
ALTER TABLE theme_settings RENAME COLUMN primary_color TO "primaryColor";
ALTER TABLE theme_settings RENAME COLUMN font_family TO "fontFamily";

-- 8. Create new indexes for performance
CREATE INDEX IF NOT EXISTS idx_programs_order ON programs(order_index);
CREATE INDEX IF NOT EXISTS idx_programs_featured ON programs(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_achievements_order ON achievements(order_index);
CREATE INDEX IF NOT EXISTS idx_achievements_featured ON achievements(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_core_values_order ON core_values(order_index);
CREATE INDEX IF NOT EXISTS idx_core_values_featured ON core_values(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_gallery_order ON gallery(order_index);
CREATE INDEX IF NOT EXISTS idx_gallery_featured ON gallery(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_news_order ON news(order_index);
CREATE INDEX IF NOT EXISTS idx_news_featured ON news(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_leadership_featured ON leadership(is_featured) WHERE is_featured = true;

CREATE INDEX IF NOT EXISTS idx_analytics_visitor_id ON analytics(visitor_id);
CREATE INDEX IF NOT EXISTS idx_analytics_session_id ON analytics(session_id);
CREATE INDEX IF NOT EXISTS idx_analytics_action_type ON analytics(action_type);

CREATE INDEX IF NOT EXISTS idx_admins_active ON admins(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_donations_receipt_number ON donations(receipt_number);

-- 9. Update existing data with default order_index
UPDATE programs SET order_index = row_number() OVER (ORDER BY created_at) WHERE order_index = 0 OR order_index IS NULL;
UPDATE achievements SET order_index = row_number() OVER (ORDER BY achievement_date DESC) WHERE order_index = 0 OR order_index IS NULL;
UPDATE core_values SET order_index = row_number() OVER (ORDER BY created_at) WHERE order_index = 0 OR order_index IS NULL;
UPDATE gallery SET order_index = row_number() OVER (ORDER BY created_at DESC) WHERE order_index = 0 OR order_index IS NULL;
UPDATE news SET order_index = row_number() OVER (ORDER BY published_date DESC) WHERE order_index = 0 OR order_index IS NULL;

-- 10. Set all existing admins to active
UPDATE admins SET is_active = true WHERE is_active IS NULL;

-- Migration complete!
-- Verify changes with:
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'programs';
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'analytics';
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'payment_settings';
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'theme_settings';
