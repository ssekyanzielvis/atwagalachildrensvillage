-- =============================================================================
-- ALTER PROGRAMS TABLE
-- =============================================================================

ALTER TABLE programs ADD COLUMN IF NOT EXISTS start_date DATE;
ALTER TABLE programs ADD COLUMN IF NOT EXISTS end_date DATE;

-- =============================================================================
-- CREATE PROGRAM SPONSORSHIPS TABLES
-- =============================================================================

CREATE TABLE IF NOT EXISTS program_sponsorship_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID REFERENCES programs(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  message TEXT,
  logo_url TEXT,
  is_approved BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS program_sponsors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID REFERENCES programs(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  logo_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- Enable RLS but create completely permissive policies
ALTER TABLE program_sponsorship_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE program_sponsors ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all on program_sponsorship_applications" ON program_sponsorship_applications;
CREATE POLICY "Allow all on program_sponsorship_applications" 
ON program_sponsorship_applications FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all on program_sponsors" ON program_sponsors;
CREATE POLICY "Allow all on program_sponsors" 
ON program_sponsors FOR ALL USING (true) WITH CHECK (true);

-- =============================================================================
-- CREATE PROGRAM SPONSORS STORAGE BUCKET
-- =============================================================================

-- Create the bucket for program sponsors logos
INSERT INTO storage.buckets (id, name, public)
VALUES ('program-sponsors', 'program-sponsors', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Drop existing policies if they exist to avoid conflicts when re-running
DROP POLICY IF EXISTS "Public access for program-sponsors bucket" ON storage.objects;
DROP POLICY IF EXISTS "Allow uploads to program-sponsors bucket" ON storage.objects;

-- Create permissive policies for the bucket
CREATE POLICY "Public access for program-sponsors bucket" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'program-sponsors');

CREATE POLICY "Allow uploads to program-sponsors bucket" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'program-sponsors');
