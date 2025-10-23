-- ============================================
-- TRIGGER CRÍTICO: Criar perfil automaticamente ao cadastrar usuário
-- ============================================
-- Este trigger é ESSENCIAL para o funcionamento do cadastro!
-- Sem ele, você terá erro "Database error saving new user"
-- ============================================

-- Passo 1: Criar a função que cria o perfil
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Usuário'),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'patient')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Passo 2: Remover trigger antigo se existir (para evitar erro)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Passo 3: Criar o trigger que executa a função
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- ============================================
-- VERIFICAÇÃO: Execute esta query para confirmar que o trigger foi criado
-- ============================================
SELECT
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement,
  action_timing
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

-- Se retornar uma linha, o trigger foi criado com sucesso! ✅
