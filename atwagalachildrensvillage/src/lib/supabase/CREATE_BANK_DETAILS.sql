-- Create function for updating timestamps if it doesn't exist
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create the bank_details table to store direct bank transfer information
CREATE TABLE IF NOT EXISTS public.bank_details (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    account_name TEXT NOT NULL,
    bank_name TEXT NOT NULL,
    account_number TEXT NOT NULL,
    swift_code TEXT,
    intermediate_bank TEXT,
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Disable Row Level Security (RLS) to match development environment setup
ALTER TABLE public.bank_details DISABLE ROW LEVEL SECURITY;

-- Create a trigger to automatically update the 'updated_at' column
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_bank_details_updated_at') THEN
        CREATE TRIGGER trg_bank_details_updated_at
        BEFORE UPDATE ON public.bank_details
        FOR EACH ROW
        EXECUTE FUNCTION public.update_updated_at_column();
    END IF;
END $$;
