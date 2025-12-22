-- Data: 2025-12-18
-- Descrição: Adiciona a tabela pet_badges para implementar o sistema de selos simples.

-- 1. Criar enum para os tipos de selos
CREATE TYPE public.badge_type AS ENUM (
  'primeiro_dia',
  'pet_ativo',
  'pet_em_destaque'
);

-- 2. Criar a tabela pet_badges
CREATE TABLE public.pet_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id UUID REFERENCES public.pets(id) ON DELETE CASCADE NOT NULL,
  badge_type badge_type NOT NULL,
  awarded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  UNIQUE (pet_id, badge_type) -- Garante que um pet só tenha um selo de cada tipo
);

-- 3. Habilitar RLS
ALTER TABLE public.pet_badges ENABLE ROW LEVEL SECURITY;

-- 4. Políticas de RLS
-- Qualquer um pode ver os selos de um pet
CREATE POLICY "Anyone can view pet badges" ON public.pet_badges FOR SELECT TO authenticated
  USING (true);

-- O dono do pet pode inserir/deletar selos (embora a lógica de concessão seja no backend)
CREATE POLICY "Pet owner can manage own badges" ON public.pet_badges FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.pets WHERE pets.id = pet_id AND pets.user_id = auth.uid()));
