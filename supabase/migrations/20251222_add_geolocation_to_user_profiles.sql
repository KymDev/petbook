-- Adicionar campos de geolocalização à tabela user_profiles
-- Esta migração permite armazenar a localização exata dos profissionais

ALTER TABLE public.user_profiles
ADD COLUMN professional_latitude real,
ADD COLUMN professional_longitude real;

-- Criar índice para otimizar buscas de proximidade
CREATE INDEX idx_user_profiles_location ON public.user_profiles USING gist(
  ll_to_earth(COALESCE(professional_latitude, 0), COALESCE(professional_longitude, 0))
) WHERE professional_latitude IS NOT NULL AND professional_longitude IS NOT NULL;

-- Comentários para documentação
COMMENT ON COLUMN public.user_profiles.professional_latitude IS 'Latitude da localização do profissional (para geolocalização)';
COMMENT ON COLUMN public.user_profiles.professional_longitude IS 'Longitude da localização do profissional (para geolocalização)';
