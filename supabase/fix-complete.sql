-- ============================================
-- DIAGNÓSTICO COMPLETO E CORREÇÃO
-- ============================================
-- Execute este script COMPLETO no SQL Editor do Supabase
-- Ele vai diagnosticar e corrigir TODOS os problemas
-- ============================================

-- PASSO 1: Verificar se as extensões necessárias existem
-- ============================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DO $$
BEGIN
  RAISE NOTICE '✅ Extensão uuid-ossp habilitada';
END $$;

-- ============================================
-- PASSO 2: Verificar e criar o ENUM user_role
-- ============================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE user_role AS ENUM ('patient', 'doctor');
    RAISE NOTICE '✅ Enum user_role criado';
  ELSE
    RAISE NOTICE '✅ Enum user_role já existe';
  END IF;
END $$;

-- ============================================
-- PASSO 3: Verificar e criar a tabela PROFILES
-- ============================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  role user_role NOT NULL DEFAULT 'patient',
  full_name TEXT NOT NULL,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

DO $$
BEGIN
  RAISE NOTICE '✅ Tabela profiles verificada/criada';
END $$;

-- ============================================
-- PASSO 4: DESABILITAR RLS temporariamente (para debug)
-- ============================================
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  RAISE NOTICE '⚠️  RLS desabilitado temporariamente para debug';
END $$;

-- ============================================
-- PASSO 5: Limpar triggers e funções antigas
-- ============================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;

DO $$
BEGIN
  RAISE NOTICE '🧹 Triggers e funções antigas removidas';
END $$;

-- ============================================
-- PASSO 6: Criar FUNÇÃO com DEBUG e tratamento de erros
-- ============================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_full_name TEXT;
  v_role TEXT;
  v_phone TEXT;
BEGIN
  -- Extrair dados do metadata
  v_full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', 'Usuário');
  v_role := COALESCE(NEW.raw_user_meta_data->>'role', 'patient');
  v_phone := NEW.raw_user_meta_data->>'phone';

  -- Log para debug
  RAISE NOTICE '🔵 Trigger executado para usuário: %', NEW.id;
  RAISE NOTICE '📝 Dados: full_name=%, role=%, phone=%', v_full_name, v_role, v_phone;

  -- Tentar inserir o perfil
  BEGIN
    INSERT INTO public.profiles (id, full_name, role, phone)
    VALUES (
      NEW.id,
      v_full_name,
      v_role::user_role,
      v_phone
    );

    RAISE NOTICE '✅ Perfil criado com sucesso para usuário: %', NEW.id;

  EXCEPTION
    WHEN unique_violation THEN
      RAISE NOTICE '⚠️  Perfil já existe para usuário: %', NEW.id;
    WHEN foreign_key_violation THEN
      RAISE WARNING '❌ Erro FK: Usuário % não existe em auth.users', NEW.id;
    WHEN OTHERS THEN
      RAISE WARNING '❌ ERRO ao criar perfil: % (código: %)', SQLERRM, SQLSTATE;
      -- Re-lançar o erro para ver no log
      RAISE;
  END;

  RETURN NEW;
END;
$$;

DO $$
BEGIN
  RAISE NOTICE '✅ Função handle_new_user() criada com debug';
END $$;

-- ============================================
-- PASSO 7: Criar TRIGGER
-- ============================================
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

DO $$
BEGIN
  RAISE NOTICE '✅ Trigger on_auth_user_created criado';
END $$;

-- ============================================
-- PASSO 8: VERIFICAR se trigger foi criado
-- ============================================
DO $$
DECLARE
  v_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_count
  FROM information_schema.triggers
  WHERE trigger_name = 'on_auth_user_created';

  IF v_count > 0 THEN
    RAISE NOTICE '✅ TRIGGER CONFIRMADO: on_auth_user_created está ativo';
  ELSE
    RAISE EXCEPTION '❌ ERRO: Trigger NÃO foi criado!';
  END IF;
END $$;

-- ============================================
-- PASSO 9: Verificar usuários SEM perfil
-- ============================================
DO $$
DECLARE
  v_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_count
  FROM auth.users u
  LEFT JOIN profiles p ON u.id = p.id
  WHERE p.id IS NULL;

  IF v_count > 0 THEN
    RAISE NOTICE '⚠️  Existem % usuários SEM perfil!', v_count;
    RAISE NOTICE '👉 Execute o PASSO 10 para corrigir';
  ELSE
    RAISE NOTICE '✅ Todos os usuários têm perfil!';
  END IF;
END $$;

-- ============================================
-- PASSO 10: CRIAR PERFIS para usuários que não têm
-- ============================================
-- Este script cria perfis para usuários que foram criados
-- antes do trigger ser configurado corretamente
INSERT INTO profiles (id, full_name, role, phone)
SELECT
  u.id,
  COALESCE(u.raw_user_meta_data->>'full_name', 'Usuário'),
  COALESCE((u.raw_user_meta_data->>'role')::user_role, 'patient'),
  u.raw_user_meta_data->>'phone'
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;

DO $$
DECLARE
  v_created INTEGER;
BEGIN
  GET DIAGNOSTICS v_created = ROW_COUNT;
  IF v_created > 0 THEN
    RAISE NOTICE '✅ Criados % perfis retroativamente', v_created;
  ELSE
    RAISE NOTICE '✅ Nenhum perfil precisou ser criado';
  END IF;
END $$;

-- ============================================
-- PASSO 11: VERIFICAR RESULTADO FINAL
-- ============================================
SELECT
  u.email,
  u.created_at as usuario_criado,
  p.full_name,
  p.role,
  p.created_at as perfil_criado,
  CASE
    WHEN p.id IS NOT NULL THEN '✅ TEM PERFIL'
    ELSE '❌ SEM PERFIL'
  END as status
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
ORDER BY u.created_at DESC;

-- ============================================
-- PASSO 12: REABILITAR RLS
-- ============================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Criar políticas básicas
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;

CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

DO $$
BEGIN
  RAISE NOTICE '✅ RLS reabilitado com políticas de segurança';
END $$;

-- ============================================
-- PASSO 13: RESUMO FINAL
-- ============================================
DO $$
DECLARE
  v_total_users INTEGER;
  v_total_profiles INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_total_users FROM auth.users;
  SELECT COUNT(*) INTO v_total_profiles FROM profiles;

  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ CONFIGURAÇÃO COMPLETA!';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Total de usuários: %', v_total_users;
  RAISE NOTICE 'Total de perfis: %', v_total_profiles;

  IF v_total_users = v_total_profiles THEN
    RAISE NOTICE '✅ SUCESSO: Todos os usuários têm perfil!';
  ELSE
    RAISE WARNING '⚠️  ATENÇÃO: % usuários sem perfil', (v_total_users - v_total_profiles);
  END IF;

  RAISE NOTICE '';
  RAISE NOTICE '🧪 TESTE AGORA:';
  RAISE NOTICE '1. Crie um novo usuário no site';
  RAISE NOTICE '2. Execute a query abaixo para verificar';
  RAISE NOTICE '';
END $$;

-- ============================================
-- QUERY PARA TESTAR (execute depois de criar usuário)
-- ============================================
-- SELECT * FROM profiles ORDER BY created_at DESC LIMIT 5;
