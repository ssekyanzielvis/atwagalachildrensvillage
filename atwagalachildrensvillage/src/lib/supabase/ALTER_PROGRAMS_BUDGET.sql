-- =============================================================================
-- ALTER PROGRAMS TABLE - ADD BUDGET
-- =============================================================================

-- Add budget column to store the budget items as JSON
-- The structure will be an array of objects: { "item": "description", "cost": number }
ALTER TABLE programs ADD COLUMN IF NOT EXISTS budget JSONB DEFAULT '[]'::jsonb;
