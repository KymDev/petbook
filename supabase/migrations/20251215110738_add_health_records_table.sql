-- Migration: Add health_records table for pet health and well-being tracking

-- 1. Create enum for health record types
CREATE TYPE public.health_record_type AS ENUM ('vaccine', 'vet_visit', 'medication', 'diet', 'grooming', 'other');

-- 2. Create health_records table
CREATE TABLE public.health_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id UUID REFERENCES public.pets(id) ON DELETE CASCADE NOT NULL,
  record_type health_record_type NOT NULL,
  title TEXT NOT NULL, -- Adicionando um título para melhor organização
  record_date TIMESTAMP WITH TIME ZONE NOT NULL,
  notes TEXT,
  attachment_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.health_records ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS Policies
-- Policy to allow pet owners to view their pet's health records
CREATE POLICY "Pet owners can view their health records" ON public.health_records FOR SELECT TO authenticated 
  USING (EXISTS (SELECT 1 FROM public.pets WHERE pets.id = pet_id AND pets.user_id = auth.uid()));

-- Policy to allow pet owners to insert new health records
CREATE POLICY "Pet owners can insert their health records" ON public.health_records FOR INSERT TO authenticated 
  WITH CHECK (EXISTS (SELECT 1 FROM public.pets WHERE pets.id = pet_id AND pets.user_id = auth.uid()));

-- Policy to allow pet owners to update their health records
CREATE POLICY "Pet owners can update their health records" ON public.health_records FOR UPDATE TO authenticated 
  USING (EXISTS (SELECT 1 FROM public.pets WHERE pets.id = pet_id AND pets.user_id = auth.uid()));

-- Policy to allow pet owners to delete their health records
CREATE POLICY "Pet owners can delete their health records" ON public.health_records FOR DELETE TO authenticated 
  USING (EXISTS (SELECT 1 FROM public.pets WHERE pets.id = pet_id AND pets.user_id = auth.uid()));

-- 5. Add to RLS list in the initial migration file (for completeness, though not strictly necessary for Supabase CLI)
-- I will instruct the user to manually add "ALTER TABLE public.health_records ENABLE ROW LEVEL SECURITY;" to the end of the initial migration file if they want to keep a single source of truth for RLS enabling.
