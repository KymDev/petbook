-- Migration: Rename follows table to followers and update column names
-- This migration synchronizes the local schema with changes made directly in Supabase

-- Rename the table from 'follows' to 'followers'
ALTER TABLE IF EXISTS public.follows RENAME TO followers;

-- Rename the column 'following_pet_id' to 'target_pet_id'
ALTER TABLE public.followers RENAME COLUMN following_pet_id TO target_pet_id;

-- Update the unique constraint to reflect the new column name
-- First, drop the old constraint
ALTER TABLE public.followers DROP CONSTRAINT IF EXISTS follows_follower_pet_id_following_pet_id_key;

-- Add the new constraint with updated column names
ALTER TABLE public.followers ADD CONSTRAINT followers_follower_pet_id_target_pet_id_key 
  UNIQUE (follower_pet_id, target_pet_id);

-- Drop old RLS policies from 'follows' table (if they still exist)
DROP POLICY IF EXISTS "Anyone can view follows" ON public.followers;
DROP POLICY IF EXISTS "Pet owners can follow" ON public.followers;
DROP POLICY IF EXISTS "Pet owners can unfollow" ON public.followers;

-- Create new RLS policies for 'followers' table with updated names
CREATE POLICY "Anyone can view followers" ON public.followers 
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Pet owners can follow other pets" ON public.followers 
  FOR INSERT TO authenticated 
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.pets 
    WHERE pets.id = follower_pet_id AND pets.user_id = auth.uid()
  ));

CREATE POLICY "Pet owners can unfollow other pets" ON public.followers 
  FOR DELETE TO authenticated 
  USING (EXISTS (
    SELECT 1 FROM public.pets 
    WHERE pets.id = follower_pet_id AND pets.user_id = auth.uid()
  ));

-- Add comment to document the change
COMMENT ON TABLE public.followers IS 'Stores follower relationships between pets. Previously named "follows".';
COMMENT ON COLUMN public.followers.target_pet_id IS 'The pet being followed. Previously named "following_pet_id".';
