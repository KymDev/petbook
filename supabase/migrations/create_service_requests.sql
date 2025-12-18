-- Tabela para solicitações de serviço aos profissionais
CREATE TABLE IF NOT EXISTS service_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  professional_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  service_type TEXT NOT NULL,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'completed', 'cancelled')),
  scheduled_date TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_service_requests_professional ON service_requests(professional_id);
CREATE INDEX IF NOT EXISTS idx_service_requests_pet ON service_requests(pet_id);
CREATE INDEX IF NOT EXISTS idx_service_requests_status ON service_requests(status);
CREATE INDEX IF NOT EXISTS idx_service_requests_created_at ON service_requests(created_at DESC);

-- RLS (Row Level Security)
ALTER TABLE service_requests ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso
-- Profissionais podem ver solicitações direcionadas a eles
CREATE POLICY "Profissionais podem ver suas solicitações"
  ON service_requests
  FOR SELECT
  USING (professional_id = auth.uid());

-- Usuários podem ver suas próprias solicitações
CREATE POLICY "Usuários podem ver suas solicitações"
  ON service_requests
  FOR SELECT
  USING (pet_id IN (
    SELECT id FROM pets WHERE user_id = auth.uid()
  ));

-- Usuários podem criar solicitações
CREATE POLICY "Usuários podem criar solicitações"
  ON service_requests
  FOR INSERT
  WITH CHECK (pet_id IN (
    SELECT id FROM pets WHERE user_id = auth.uid()
  ));

-- Profissionais podem atualizar status de suas solicitações
CREATE POLICY "Profissionais podem atualizar suas solicitações"
  ON service_requests
  FOR UPDATE
  USING (professional_id = auth.uid());

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_service_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER service_requests_updated_at
  BEFORE UPDATE ON service_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_service_requests_updated_at();

-- Tabela para avaliações de serviços
CREATE TABLE IF NOT EXISTS service_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_request_id UUID NOT NULL REFERENCES service_requests(id) ON DELETE CASCADE,
  professional_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(service_request_id) -- Uma avaliação por serviço
);

-- Índices para avaliações
CREATE INDEX IF NOT EXISTS idx_service_reviews_professional ON service_reviews(professional_id);
CREATE INDEX IF NOT EXISTS idx_service_reviews_rating ON service_reviews(rating);

-- RLS para avaliações
ALTER TABLE service_reviews ENABLE ROW LEVEL SECURITY;

-- Políticas para avaliações
CREATE POLICY "Todos podem ver avaliações"
  ON service_reviews
  FOR SELECT
  USING (true);

CREATE POLICY "Usuários podem criar avaliações de seus serviços"
  ON service_reviews
  FOR INSERT
  WITH CHECK (
    pet_id IN (SELECT id FROM pets WHERE user_id = auth.uid())
    AND service_request_id IN (
      SELECT id FROM service_requests WHERE pet_id IN (
        SELECT id FROM pets WHERE user_id = auth.uid()
      )
    )
  );
