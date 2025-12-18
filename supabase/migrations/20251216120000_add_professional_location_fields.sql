-- Migration: Adiciona campos de localização e preço para perfis profissionais
-- Data: 2025-12-16
-- Descrição: Adiciona colunas professional_city, professional_state, professional_zip 
--            e professional_price_range à tabela user_profiles

-- 1. Adicionar as novas colunas à tabela user_profiles
ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS professional_city TEXT,
ADD COLUMN IF NOT EXISTS professional_state VARCHAR(2),
ADD COLUMN IF NOT EXISTS professional_zip VARCHAR(10),
ADD COLUMN IF NOT EXISTS professional_price_range TEXT;

-- 2. Adicionar comentários às colunas para documentação
COMMENT ON COLUMN public.user_profiles.professional_city IS 'Cidade onde o profissional atua';
COMMENT ON COLUMN public.user_profiles.professional_state IS 'Estado (UF) onde o profissional atua - 2 caracteres';
COMMENT ON COLUMN public.user_profiles.professional_zip IS 'CEP do profissional';
COMMENT ON COLUMN public.user_profiles.professional_price_range IS 'Faixa de preço dos serviços oferecidos';

-- 3. Criar índice para facilitar buscas por localização
CREATE INDEX IF NOT EXISTS idx_user_profiles_location 
ON public.user_profiles(professional_city, professional_state) 
WHERE account_type = 'professional';

-- 4. Opcional: Validação para garantir que professional_state tenha exatamente 2 caracteres
ALTER TABLE public.user_profiles
ADD CONSTRAINT check_professional_state_length 
CHECK (professional_state IS NULL OR LENGTH(professional_state) = 2);
