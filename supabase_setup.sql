
-- SQL script to set up the 'profiles' table in Supabase
-- Run this in the Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)

-- Create the profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
    id TEXT PRIMARY KEY, -- Firebase UID (String)
    name TEXT,
    email TEXT,
    age TEXT,
    phone TEXT,
    linkedin_url TEXT,
    resume_url TEXT,
    education JSONB DEFAULT '[]'::jsonb,
    specialised_courses JSONB DEFAULT '[]'::jsonb,
    career_preferences JSONB DEFAULT '{}'::jsonb,
    is_profile_complete BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies (Simplistic policies for Firebase-to-Supabase integration via Anon Key)
-- Note: In a production app, you might want to use a more secure way to verify the user identity.

-- Policy: Anyone can check if a profile exists if they know the ID
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone" 
ON public.profiles FOR SELECT 
USING (true);

-- Policy: Users can insert their own profile
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile" 
ON public.profiles FOR INSERT 
WITH CHECK (true);

-- Policy: Users can update their own profile
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE 
USING (true);

-- Add a trigger to update 'updated_at' on every update
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ==========================================
-- STORAGE SETUP (Run this separately if needed)
-- ==========================================

-- Note: Supabase Storage buckets are usually managed via the dashboard, 
-- but these SQL statements can help set up permissions.

-- 1. Create the 'resumes' bucket (If using extensions)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('resumes', 'resumes', true);

-- 2. Storage Policies for 'resumes' bucket
-- Policy: Allow public access to read resumes
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'resumes');

-- Policy: Allow authenticated users to upload resumes
DROP POLICY IF EXISTS "Allow Authenticated Upload" ON storage.objects;
CREATE POLICY "Allow Authenticated Upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'resumes');

-- Policy: Allow users to update their own resumes
DROP POLICY IF EXISTS "Allow User Update" ON storage.objects;
CREATE POLICY "Allow User Update" ON storage.objects FOR UPDATE USING (bucket_id = 'resumes');
