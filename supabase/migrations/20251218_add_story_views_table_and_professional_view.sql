-- Data: 2025-12-18
-- Descrição: Adiciona a tabela story_views e a coluna is_professional para rastrear visualizações de stories por profissionais.

-- 1. Criar a tabela story_views
CREATE TABLE public.story_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID REFERENCES public.stories(id) ON DELETE CASCADE NOT NULL,
  viewer_pet_id UUID REFERENCES public.pets(id) ON DELETE CASCADE NOT NULL,
  is_professional BOOLEAN DEFAULT FALSE NOT NULL, -- Novo campo para indicar se o visualizador é um profissional
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  UNIQUE (story_id, viewer_pet_id)
);

-- 2. Habilitar RLS
ALTER TABLE public.story_views ENABLE ROW LEVEL SECURITY;

-- 3. Políticas de RLS
-- Qualquer pet autenticado pode inserir uma visualização
CREATE POLICY "Authenticated pets can insert story views" ON public.story_views FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.pets WHERE pets.id = viewer_pet_id AND pets.user_id = auth.uid()));

-- O dono do story pode ver todas as visualizações
CREATE POLICY "Story owner can view all story views" ON public.story_views FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.stories s
    JOIN public.pets p ON s.pet_id = p.id
    WHERE s.id = story_id AND p.user_id = auth.uid()
  ));

-- 4. Criar a tabela stories (se ainda não existir, mas o código-fonte indica que existe)
-- Se a tabela stories não estiver na migração inicial, ela deve ser criada aqui.
-- Assumindo que 'stories' existe, vamos apenas adicionar a coluna 'is_professional' na 'story_views'
-- O código do StoryViewer.tsx já faz o INSERT na tabela 'story_views', então vamos garantir que ela exista.

-- 5. Função para verificar se o pet visualizador pertence a um usuário profissional
CREATE OR REPLACE FUNCTION public.is_viewer_professional(pet_id_in UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  is_prof BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1
    FROM public.pets p
    JOIN public.user_profiles up ON p.user_id = up.id
    WHERE p.id = pet_id_in AND up.account_type = 'professional'
  ) INTO is_prof;
  RETURN is_prof;
END;
$$;

-- 6. Trigger para preencher is_professional automaticamente no INSERT
CREATE OR REPLACE FUNCTION public.set_is_professional_on_story_view()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.is_professional = public.is_viewer_professional(NEW.viewer_pet_id);
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_story_view_insert
  BEFORE INSERT ON public.story_views
  FOR EACH ROW EXECUTE FUNCTION public.set_is_professional_on_story_view();
