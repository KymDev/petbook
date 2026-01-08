-- 1. Tabelas de Padronização (Catálogos)
CREATE TABLE public.health_standards_vaccines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  species text[] NOT NULL, -- ['dog', 'cat']
  description text,
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.health_standards_exams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL, -- 'laboratorial', 'imagem', 'outros'
  created_at timestamp with time zone DEFAULT now()
);

-- 2. Tabela de Histórico (Versionamento e Imutabilidade)
CREATE TABLE public.health_records_history (
  history_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  record_id uuid NOT NULL,
  pet_id uuid NOT NULL,
  changed_by uuid REFERENCES auth.users(id),
  old_data jsonb,
  new_data jsonb,
  operation_type text NOT NULL, -- 'INSERT', 'UPDATE', 'DELETE'
  created_at timestamp with time zone DEFAULT now()
);

-- Desabilitar updates e deletes na tabela de histórico para garantir imutabilidade
ALTER TABLE public.health_records_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "History is read-only" ON public.health_records_history FOR SELECT USING (true);
-- (Outras políticas de RLS serão adicionadas para restringir quem vê o histórico)

-- 3. Atualização da tabela health_records
ALTER TABLE public.health_records 
ADD COLUMN vaccine_id uuid REFERENCES public.health_standards_vaccines(id),
ADD COLUMN exam_id uuid REFERENCES public.health_standards_exams(id),
ADD COLUMN version integer DEFAULT 1,
ADD COLUMN is_annulled boolean DEFAULT false,
ADD COLUMN annulled_reason text;

-- 4. Trigger para Versionamento Automático
CREATE OR REPLACE FUNCTION public.handle_health_record_audit()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    INSERT INTO public.health_records_history (record_id, pet_id, changed_by, new_data, operation_type)
    VALUES (NEW.id, NEW.pet_id, auth.uid(), to_jsonb(NEW), 'INSERT');
    RETURN NEW;
  ELSIF (TG_OP = 'UPDATE') THEN
    -- Incrementar versão no registro principal
    NEW.version = OLD.version + 1;
    INSERT INTO public.health_records_history (record_id, pet_id, changed_by, old_data, new_data, operation_type)
    VALUES (NEW.id, NEW.pet_id, auth.uid(), to_jsonb(OLD), to_jsonb(NEW), 'UPDATE');
    RETURN NEW;
  ELSIF (TG_OP = 'DELETE') THEN
    INSERT INTO public.health_records_history (record_id, pet_id, changed_by, old_data, operation_type)
    VALUES (OLD.id, OLD.pet_id, auth.uid(), to_jsonb(OLD), 'DELETE');
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER audit_health_records
BEFORE INSERT OR UPDATE OR DELETE ON public.health_records
FOR EACH ROW EXECUTE FUNCTION public.handle_health_record_audit();

-- 5. Acesso Temporário para Veterinários
CREATE TABLE public.health_temporary_access (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id uuid NOT NULL REFERENCES public.pets(id),
  professional_id uuid NOT NULL REFERENCES auth.users(id),
  expires_at timestamp with time zone NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- 6. Inserir alguns dados iniciais de exemplo (Seed)
INSERT INTO public.health_standards_vaccines (name, species) VALUES 
('V10 (Polivalente)', ARRAY['dog']),
('Antirrábica', ARRAY['dog', 'cat']),
('V5 (Quíntupla Felina)', ARRAY['cat']);

INSERT INTO public.health_standards_exams (name, category) VALUES 
('Hemograma Completo', 'laboratorial'),
('Ultrassonografia Abdominal', 'imagem'),
('Bioquímico Renal', 'laboratorial');
