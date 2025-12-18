-- Migration: Add service_providers table for pet services directory

-- 1. Create enum for service types
CREATE TYPE public.service_type AS ENUM ('veterinario', 'banho_tosa', 'passeador', 'loja', 'hotel');

-- 2. Create service_providers table
CREATE TABLE public.service_providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  service_type service_type NOT NULL,
  description TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  latitude REAL,
  longitude REAL,
  is_verified BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.service_providers ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS Policies
-- Policy to allow anyone to view service providers
CREATE POLICY "Anyone can view service providers" ON public.service_providers FOR SELECT TO public USING (true);

-- Policy to allow admins to insert new service providers (para controle inicial)
CREATE POLICY "Admins can insert service providers" ON public.service_providers FOR INSERT TO authenticated 
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Policy to allow admins to update service providers
CREATE POLICY "Admins can update service providers" ON public.service_providers FOR UPDATE TO authenticated 
  USING (public.has_role(auth.uid(), 'admin'));

-- Policy to allow admins to delete service providers
CREATE POLICY "Admins can delete service providers" ON public.service_providers FOR DELETE TO authenticated 
  USING (public.has_role(auth.uid(), 'admin'));

-- 5. Create a GIST index for faster geospatial queries (optional but recommended for proximity search)
CREATE INDEX service_providers_location_idx ON public.service_providers USING GIST (point(longitude, latitude));
