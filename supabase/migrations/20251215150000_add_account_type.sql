-- Migration: Add account_type to support user/professional account switching

-- 1. Create enum for account types
CREATE TYPE public.account_type AS ENUM ('user', 'professional');

-- 2. Add account_type column to profiles table (assuming profiles table exists)
-- If profiles table doesn't exist, we'll create a user_profiles table
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  account_type account_type DEFAULT 'user' NOT NULL,
  is_professional_verified BOOLEAN DEFAULT FALSE NOT NULL,
  professional_bio TEXT,
  professional_specialties TEXT[],
  professional_phone TEXT,
  professional_whatsapp TEXT,
  professional_address TEXT,
  professional_service_type service_type,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS Policies
-- Policy to allow users to view their own profile
CREATE POLICY "Users can view own profile" ON public.user_profiles FOR SELECT TO authenticated 
  USING (auth.uid() = id);

-- Policy to allow users to update their own profile
CREATE POLICY "Users can update own profile" ON public.user_profiles FOR UPDATE TO authenticated 
  USING (auth.uid() = id);

-- Policy to allow users to insert their own profile
CREATE POLICY "Users can insert own profile" ON public.user_profiles FOR INSERT TO authenticated 
  WITH CHECK (auth.uid() = id);

-- Policy to allow anyone to view professional profiles
CREATE POLICY "Anyone can view professional profiles" ON public.user_profiles FOR SELECT TO public 
  USING (account_type = 'professional');

-- 5. Create function to auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, account_type)
  VALUES (NEW.id, 'user');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Create trigger to auto-create profile
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 7. Create updated_at trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
