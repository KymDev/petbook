-- Fix RLS for pets to ensure all authenticated users can view all pets

-- Drop old policy (o nome original era "Anyone can view pets" no arquivo de migração inicial)
DROP POLICY IF EXISTS "Anyone can view pets" ON public.pets;

-- New policy: Authenticated users can view all pets
CREATE POLICY "Authenticated users can view all pets" ON public.pets FOR SELECT TO authenticated 
  USING (true);

-- As políticas de UPDATE, INSERT e DELETE permanecem inalteradas para segurança.
