-- ============================================
-- CRIAR TRIGGER COM DEBUG E TRATAMENTO DE ERROS
-- ============================================
-- Versão melhorada que loga erros e mostra o que está acontecendo
-- ============================================

-- PASSO 1: Verificar se a tabela profiles existe
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') THEN
    RAISE EXCEPTION 'ERRO: Tabela profiles não existe! Execute o schema.sql primeiro.';
  END IF;
END $$;

-- PASSO 2: Verificar se o enum user_role existe
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    RAISE EXCEPTION 'ERRO: Enum user_role não existe! Execute o schema.sql primeiro.';
  END IF;
END $$;

-- PASSO 3: Criar função com tratamento de erros e LOG
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_full_name TEXT;
  v_role user_role;
BEGIN
  -- Extrair dados do usuário
  v_full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', 'Usuário');
  v_role := COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'patient');

  -- LOG para debug (aparece nos logs do Supabase)
  RAISE LOG 'Trigger executado para usuário: % (nome: %, role: %)', NEW.id, v_full_name, v_role;

  -- Tentar inserir o perfil
  BEGIN
    INSERT INTO public.profiles (id, full_name, role, phone)
    VALUES (
      NEW.id,
      v_full_name,
      v_role,
      NEW.raw_user_meta_data->>'phone'
    );

    RAISE LOG 'Perfil criado com sucesso para usuário: %', NEW.id;

  EXCEPTION
    WHEN unique_violation THEN
      RAISE LOG 'Perfil já existe para usuário: %', NEW.id;
      -- Não falhar, apenas logar
    WHEN OTHERS THEN
      -- Logar o erro mas não falhar o cadastro do usuário
      RAISE LOG 'ERRO ao criar perfil: % - %', SQLERRM, SQLSTATE;
      RAISE WARNING 'Não foi possível criar perfil automaticamente: %', SQLERRM;
  END;

  RETURN NEW;
END;
$$;

-- PASSO 4: Comentar a função (para documentação)
COMMENT ON FUNCTION handle_new_user() IS 'Cria automaticamente um perfil quando um novo usuário é cadastrado via Supabase Auth';

-- PASSO 5: Remover trigger antigo se existir
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- PASSO 6: Criar o trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- PASSO 7: Comentar o trigger (para documentação)
COMMENT ON TRIGGER on_auth_user_created ON auth.users IS 'Trigger que cria perfil automaticamente ao cadastrar usuário';

-- ============================================
-- VERIFICAÇÃO AUTOMÁTICA
-- ============================================

-- Verificar se a função foi criada
DO $$
DECLARE
  v_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_count
  FROM information_schema.routines
  WHERE routine_name = 'handle_new_user';

  IF v_count = 0 THEN
    RAISE EXCEPTION '❌ ERRO: Função handle_new_user NÃO foi criada!';
  ELSE
    RAISE NOTICE '✅ Função handle_new_user criada com sucesso!';
  END IF;
END $$;

-- Verificar se o trigger foi criado
DO $$
DECLARE
  v_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_count
  FROM information_schema.triggers
  WHERE trigger_name = 'on_auth_user_created';

  IF v_count = 0 THEN
    RAISE EXCEPTION '❌ ERRO: Trigger on_auth_user_created NÃO foi criado!';
  ELSE
    RAISE NOTICE '✅ Trigger on_auth_user_created criado com sucesso!';
  END IF;
END $$;

-- ============================================
-- RESULTADO FINAL
-- ============================================
-- Se você viu as mensagens ✅ acima, está tudo certo!
-- Agora faça um teste criando um usuário
-- ============================================

SELECT
  '✅ TRIGGER CRIADO COM SUCESSO!' as status,
  trigger_name,
  event_object_schema || '.' || event_object_table as tabela,
  action_timing || ' ' || event_manipulation as quando,
  action_statement as acao
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';
