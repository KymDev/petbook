-- Alterar a tabela followers para suportar usuários (profissionais) seguindo pets

-- 1. Renomear a coluna follower_pet_id para follower_id
ALTER TABLE followers RENAME COLUMN follower_pet_id TO follower_id;

-- 2. Adicionar a coluna is_user_follower (default false para pets)
ALTER TABLE followers ADD COLUMN is_user_follower BOOLEAN NOT NULL DEFAULT FALSE;

-- 3. Remover a restrição de chave estrangeira (FK) antiga (se existir)
-- Nota: A FK antiga provavelmente era 'followers_follower_pet_id_fkey'
-- O nome exato pode variar, mas vamos tentar remover a que referencia a tabela 'pets'
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'followers_follower_pet_id_fkey') THEN
        ALTER TABLE followers DROP CONSTRAINT followers_follower_pet_id_fkey;
    END IF;
END
$$;

-- 4. Adicionar uma nova restrição de chave estrangeira condicional (para pets)
-- Isso é complexo em SQL puro, mas vamos garantir que a coluna follower_id possa aceitar UUIDs de pets E de user_profiles.
-- No entanto, para simplificar e seguir o padrão do código, vamos manter a coluna como UUID e confiar na lógica da aplicação.

-- 5. Atualizar dados existentes (se houver) para refletir a nova coluna
-- Se a coluna follower_id (antiga follower_pet_id) já tinha dados, eles são de pets, então is_user_follower deve ser FALSE (que é o default).

-- 6. Adicionar uma restrição de unicidade mais robusta
ALTER TABLE followers DROP CONSTRAINT IF EXISTS followers_pkey;
ALTER TABLE followers ADD PRIMARY KEY (follower_id, target_pet_id, is_user_follower);

-- 7. Atualizar as políticas RLS para usar a nova coluna follower_id e is_user_follower

-- Política de INSERT (para Guardiões)
CREATE OR REPLACE POLICY "Pets podem seguir outros pets"
  ON followers
  FOR INSERT
  WITH CHECK (
    is_user_follower = FALSE AND
    follower_id IN (SELECT id FROM pets WHERE user_id = auth.uid())
  );

-- Política de INSERT (para Profissionais)
CREATE OR REPLACE POLICY "Profissionais podem seguir pets"
  ON followers
  FOR INSERT
  WITH CHECK (
    is_user_follower = TRUE AND
    follower_id = auth.uid()
  );

-- Política de SELECT (para Guardiões)
CREATE OR REPLACE POLICY "Pets podem ver quem seguem"
  ON followers
  FOR SELECT
  USING (
    is_user_follower = FALSE AND
    follower_id IN (SELECT id FROM pets WHERE user_id = auth.uid())
  );

-- Política de SELECT (para Profissionais)
CREATE OR REPLACE POLICY "Profissionais podem ver quem seguem"
  ON followers
  FOR SELECT
  USING (
    is_user_follower = TRUE AND
    follower_id = auth.uid()
  );

-- Política de DELETE (para Guardiões)
CREATE OR REPLACE POLICY "Pets podem deixar de seguir"
  ON followers
  FOR DELETE
  USING (
    is_user_follower = FALSE AND
    follower_id IN (SELECT id FROM pets WHERE user_id = auth.uid())
  );

-- Política de DELETE (para Profissionais)
CREATE OR REPLACE POLICY "Profissionais podem deixar de seguir"
  ON followers
  FOR DELETE
  USING (
    is_user_follower = TRUE AND
    follower_id = auth.uid()
  );

-- Política de SELECT (para ver seguidores de um pet - público)
CREATE OR REPLACE POLICY "Todos podem ver seguidores"
  ON followers
  FOR SELECT
  USING (true);
