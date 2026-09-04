-- Fix analytics RLS and table structure
-- Run this in Supabase SQL Editor

-- Disable RLS on analytics to allow public inserts
ALTER TABLE analytics DISABLE ROW LEVEL SECURITY;

-- Ensure required columns exist without deleting existing analytics records.
ALTER TABLE analytics ADD COLUMN IF NOT EXISTS page_path VARCHAR(255);
ALTER TABLE analytics ADD COLUMN IF NOT EXISTS visitor_id VARCHAR(100);
ALTER TABLE analytics ADD COLUMN IF NOT EXISTS session_id VARCHAR(100);
ALTER TABLE analytics ADD COLUMN IF NOT EXISTS action_type VARCHAR(50) DEFAULT 'page_view';
ALTER TABLE analytics ADD COLUMN IF NOT EXISTS visitor_ip VARCHAR(45);
ALTER TABLE analytics ADD COLUMN IF NOT EXISTS device_type VARCHAR(20);
ALTER TABLE analytics ADD COLUMN IF NOT EXISTS country VARCHAR(100);
ALTER TABLE analytics ADD COLUMN IF NOT EXISTS user_agent TEXT;
ALTER TABLE analytics ADD COLUMN IF NOT EXISTS referrer TEXT;
ALTER TABLE analytics ADD COLUMN IF NOT EXISTS form_name VARCHAR(255);
ALTER TABLE analytics ADD COLUMN IF NOT EXISTS button_name VARCHAR(255);
ALTER TABLE analytics ADD COLUMN IF NOT EXISTS link_url TEXT;
ALTER TABLE analytics ADD COLUMN IF NOT EXISTS amount NUMERIC(12,2);
ALTER TABLE analytics ADD COLUMN IF NOT EXISTS visited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Backfill visited_at if the table was created with only created_at.
UPDATE analytics
SET visited_at = created_at
WHERE visited_at IS NULL
  AND created_at IS NOT NULL;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_analytics_visited_at ON analytics(visited_at);
CREATE INDEX IF NOT EXISTS idx_analytics_visitor_id ON analytics(visitor_id);
CREATE INDEX IF NOT EXISTS idx_analytics_session_id ON analytics(session_id);
CREATE INDEX IF NOT EXISTS idx_analytics_action_type ON analytics(action_type);
