-- ============================================
-- DIAGNÓSTICO E CORREÇÃO DO SISTEMA DE CONVITES
-- ============================================
-- Este script diagnostica e corrige problemas com o sistema de convites
-- Execute este script no SQL Editor do Supabase
-- ============================================

-- PASSO 1: Verificar todos os usuários e seus perfis
-- ============================================
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE '🔍 DIAGNÓSTICO DO SISTEMA DE CONVITES';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
END $$;

-- PASSO 2: Contar usuários vs perfis
-- ============================================
DO $$
DECLARE
  v_total_users INTEGER;
  v_total_profiles INTEGER;
  v_missing INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_total_users FROM auth.users;
  SELECT COUNT(*) INTO v_total_profiles FROM profiles;
  v_missing := v_total_users - v_total_profiles;

  RAISE NOTICE '📊 ESTATÍSTICAS:';
  RAISE NOTICE '   Total de usuários: %', v_total_users;
  RAISE NOTICE '   Total de perfis: %', v_total_profiles;
  RAISE NOTICE '   Usuários sem perfil: %', v_missing;
  RAISE NOTICE '';

  IF v_missing > 0 THEN
    RAISE WARNING '⚠️  PROBLEMA: % usuários não têm perfil!', v_missing;
  ELSE
    RAISE NOTICE '✅ Todos os usuários têm perfil';
  END IF;
  RAISE NOTICE '';
END $$;

-- PASSO 3: Listar usuários e seus perfis
-- ============================================
DO $$
BEGIN
  RAISE NOTICE '📋 LISTA DE USUÁRIOS E PERFIS:';
  RAISE NOTICE '';
END $$;

SELECT
  u.email,
  u.created_at as usuario_criado,
  u.raw_user_meta_data->>'role' as metadata_role,
  p.full_name,
  p.role as perfil_role,
  p.created_at as perfil_criado,
  CASE
    WHEN p.id IS NULL THEN '❌ SEM PERFIL'
    WHEN p.role IS NULL THEN '⚠️  SEM ROLE'
    ELSE '✅ OK'
  END as status
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
ORDER BY u.created_at DESC;

-- PASSO 4: Verificar perfis com role NULL
-- ============================================
DO $$
DECLARE
  v_null_roles INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_null_roles
  FROM profiles
  WHERE role IS NULL;

  RAISE NOTICE '';
  IF v_null_roles > 0 THEN
    RAISE WARNING '⚠️  PROBLEMA: % perfis têm role NULL!', v_null_roles;
  ELSE
    RAISE NOTICE '✅ Todos os perfis têm role definido';
  END IF;
  RAISE NOTICE '';
END $$;

-- PASSO 5: CORRIGIR - Criar perfis para usuários sem perfil
-- ============================================
DO $$
BEGIN
  RAISE NOTICE '🔧 CORREÇÃO 1: Criando perfis faltantes...';
END $$;

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
    RAISE NOTICE '✅ Criados % perfis', v_created;
  ELSE
    RAISE NOTICE '✅ Nenhum perfil precisou ser criado';
  END IF;
  RAISE NOTICE '';
END $$;

-- PASSO 6: CORRIGIR - Atualizar perfis com role NULL
-- ============================================
DO $$
BEGIN
  RAISE NOTICE '🔧 CORREÇÃO 2: Corrigindo perfis com role NULL...';
END $$;

UPDATE profiles p
SET role = COALESCE((
  SELECT (u.raw_user_meta_data->>'role')::user_role
  FROM auth.users u
  WHERE u.id = p.id
), 'patient')
WHERE p.role IS NULL;

DO $$
DECLARE
  v_updated INTEGER;
BEGIN
  GET DIAGNOSTICS v_updated = ROW_COUNT;
  IF v_updated > 0 THEN
    RAISE NOTICE '✅ Atualizados % perfis', v_updated;
  ELSE
    RAISE NOTICE '✅ Nenhum perfil precisou ser atualizado';
  END IF;
  RAISE NOTICE '';
END $$;

-- PASSO 7: Verificar resultado final
-- ============================================
DO $$
DECLARE
  v_total_users INTEGER;
  v_total_profiles INTEGER;
  v_profiles_with_role INTEGER;
  v_doctors INTEGER;
  v_patients INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_total_users FROM auth.users;
  SELECT COUNT(*) INTO v_total_profiles FROM profiles;
  SELECT COUNT(*) INTO v_profiles_with_role FROM profiles WHERE role IS NOT NULL;
  SELECT COUNT(*) INTO v_doctors FROM profiles WHERE role = 'doctor';
  SELECT COUNT(*) INTO v_patients FROM profiles WHERE role = 'patient';

  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ RESULTADO FINAL';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Total de usuários: %', v_total_users;
  RAISE NOTICE 'Total de perfis: %', v_total_profiles;
  RAISE NOTICE 'Perfis com role: %', v_profiles_with_role;
  RAISE NOTICE '   - Médicos: %', v_doctors;
  RAISE NOTICE '   - Pacientes: %', v_patients;
  RAISE NOTICE '';

  IF v_total_users = v_total_profiles AND v_total_profiles = v_profiles_with_role THEN
    RAISE NOTICE '✅ SUCESSO: Sistema de convites corrigido!';
    RAISE NOTICE '✅ Todos os usuários têm perfil com role definido!';
  ELSE
    RAISE WARNING '⚠️  ATENÇÃO: Ainda há problemas';
    IF v_total_users != v_total_profiles THEN
      RAISE WARNING '   - % usuários sem perfil', (v_total_users - v_total_profiles);
    END IF;
    IF v_total_profiles != v_profiles_with_role THEN
      RAISE WARNING '   - % perfis sem role', (v_total_profiles - v_profiles_with_role);
    END IF;
  END IF;

  RAISE NOTICE '';
  RAISE NOTICE '📋 Próximos passos:';
  RAISE NOTICE '1. Teste o sistema de convites na aplicação';
  RAISE NOTICE '2. Verifique os logs detalhados no console (F12)';
  RAISE NOTICE '3. Se ainda houver problemas, compartilhe os logs';
  RAISE NOTICE '';
END $$;

-- PASSO 8: Mostrar lista final de usuários
-- ============================================
DO $$
BEGIN
  RAISE NOTICE '📊 LISTA ATUALIZADA DE USUÁRIOS:';
  RAISE NOTICE '';
END $$;

SELECT
  u.email,
  p.full_name,
  p.role,
  CASE
    WHEN p.id IS NULL THEN '❌ SEM PERFIL'
    WHEN p.role IS NULL THEN '⚠️  SEM ROLE'
    WHEN p.role = 'doctor' THEN '👨‍⚕️ MÉDICO'
    WHEN p.role = 'patient' THEN '👤 PACIENTE'
    ELSE '✅ OK'
  END as status
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
ORDER BY p.role, u.created_at DESC;

-- ============================================
-- VERIFICAÇÕES ADICIONAIS
-- ============================================

-- Verificar se há emails duplicados
DO $$
DECLARE
  v_duplicates INTEGER;
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '🔍 VERIFICAÇÃO ADICIONAL: Emails duplicados';

  SELECT COUNT(*) INTO v_duplicates
  FROM (
    SELECT email, COUNT(*) as count
    FROM profiles
    GROUP BY email
    HAVING COUNT(*) > 1
  ) sub;

  IF v_duplicates > 0 THEN
    RAISE WARNING '⚠️  PROBLEMA: % emails duplicados encontrados', v_duplicates;
  ELSE
    RAISE NOTICE '✅ Não há emails duplicados';
  END IF;
  RAISE NOTICE '';
END $$;

-- ============================================
-- FIM DO DIAGNÓSTICO
-- ============================================
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ DIAGNÓSTICO E CORREÇÃO CONCLUÍDOS';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
END $$;
