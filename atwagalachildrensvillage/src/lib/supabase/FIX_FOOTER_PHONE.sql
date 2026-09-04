-- Fix footer_info table - increase phone column size
-- Run this in Supabase SQL Editor

-- Increase phone number field size to accommodate longer formats
ALTER TABLE footer_info ALTER COLUMN phone TYPE VARCHAR(50);

-- Verify the change
SELECT column_name, data_type, character_maximum_length 
FROM information_schema.columns 
WHERE table_name = 'footer_info' AND column_name = 'phone';
