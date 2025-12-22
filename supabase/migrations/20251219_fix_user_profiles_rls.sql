-- Fix RLS for user_profiles to allow authenticated users to view all profiles

-- Drop old policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Anyone can view professional profiles" ON public.user_profiles;

-- New policy: Authenticated users can view all profiles
CREATE POLICY "Authenticated users can view all profiles" ON public.user_profiles FOR SELECT TO authenticated 
  USING (true);

-- As políticas de UPDATE e INSERT permanecem inalteradas para segurança.
