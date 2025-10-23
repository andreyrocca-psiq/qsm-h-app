-- ============================================
-- VERIFICAÇÃO COMPLETA DO TRIGGER
-- ============================================
-- Execute estas queries no SQL Editor do Supabase para verificar
-- se o trigger foi realmente criado
-- ============================================

-- QUERY 1: Verificar se o trigger existe (método 1)
SELECT
  trigger_name,
  event_manipulation,
  event_object_schema,
  event_object_table,
  action_timing,
  action_statement
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

-- Se retornar UMA linha, o trigger existe! ✅
-- Se retornar VAZIO, o trigger NÃO foi criado ❌

-- ============================================

-- QUERY 2: Verificar se o trigger existe (método 2 - direto do PostgreSQL)
SELECT
  tgname AS trigger_name,
  tgrelid::regclass AS table_name,
  proname AS function_name,
  tgenabled AS enabled
FROM pg_trigger t
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE tgname = 'on_auth_user_created';

-- enabled = 'O' significa que o trigger está ativo ✅

-- ============================================

-- QUERY 3: Verificar se a FUNÇÃO existe
SELECT
  routine_name,
  routine_schema,
  routine_type
FROM information_schema.routines
WHERE routine_name = 'handle_new_user';

-- Se retornar uma linha, a função existe ✅

-- ============================================

-- QUERY 4: Ver TODOS os triggers na tabela auth.users
SELECT
  trigger_name,
  action_timing || ' ' || event_manipulation AS trigger_type
FROM information_schema.triggers
WHERE event_object_schema = 'auth'
  AND event_object_table = 'users';

-- Isso mostra TODOS os triggers na tabela auth.users
-- O trigger 'on_auth_user_created' deve aparecer aqui

-- ============================================

-- QUERY 5: TESTE REAL - Criar usuário fake para testar o trigger
-- ATENÇÃO: Isso vai criar um usuário de teste no seu sistema!
-- Só execute se quiser testar

-- Primeiro, veja quantos perfis existem agora:
SELECT COUNT(*) as total_profiles_antes FROM profiles;

-- Anote o número. Depois crie um usuário de teste no cadastro
-- e execute esta query novamente:
SELECT COUNT(*) as total_profiles_depois FROM profiles;

-- Se o número aumentou em 1, o trigger está funcionando! ✅

-- ============================================

-- QUERY 6: Ver os últimos perfis criados
SELECT
  id,
  full_name,
  role,
  created_at
FROM profiles
ORDER BY created_at DESC
LIMIT 5;

-- Isso mostra os 5 perfis mais recentes
-- Se você criar um usuário de teste, ele deve aparecer aqui

-- ============================================

-- RESUMO:
-- 1. Execute as queries 1, 2 e 3 para verificar se trigger e função existem
-- 2. Execute a query 4 para ver todos os triggers em auth.users
-- 3. Se tudo existir, faça um teste real criando um usuário
-- 4. Use as queries 5 e 6 para verificar se o perfil foi criado automaticamente
