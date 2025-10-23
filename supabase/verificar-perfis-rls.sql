-- ============================================
-- VERIFICAR PERFIS CRIADOS (IGNORANDO RLS)
-- ============================================
-- Use estas queries para ver TODOS os perfis,
-- independente das políticas de segurança
-- ============================================

-- QUERY 1: Ver TODOS os perfis (ignora RLS)
-- Execute como Service Role ou desabilite RLS temporariamente
SELECT
  id,
  full_name,
  role,
  phone,
  created_at
FROM profiles
ORDER BY created_at DESC;

-- Se não aparecer nada, o RLS está bloqueando.
-- Execute a query abaixo para ver sem RLS:

-- ============================================

-- QUERY 2: Desabilitar RLS temporariamente para verificar
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Agora execute novamente:
SELECT
  id,
  full_name,
  role,
  phone,
  created_at
FROM profiles
ORDER BY created_at DESC;

-- Você deve ver TODOS os perfis criados! ✅

-- ============================================

-- QUERY 3: Contar perfis (sem RLS)
SELECT COUNT(*) as total_perfis FROM profiles;

-- ============================================

-- QUERY 4: Ver perfis e usuários lado a lado
SELECT
  u.id,
  u.email,
  u.created_at as usuario_criado_em,
  p.full_name,
  p.role,
  p.created_at as perfil_criado_em,
  CASE
    WHEN p.id IS NOT NULL THEN '✅ Perfil existe'
    ELSE '❌ Perfil NÃO existe (ERRO!)'
  END as status
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
ORDER BY u.created_at DESC;

-- Isso mostra TODOS os usuários e se eles têm perfil
-- Todos devem ter ✅

-- ============================================

-- QUERY 5: REABILITAR RLS (IMPORTANTE!)
-- Depois de verificar, reabilite a segurança:
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- ============================================

-- QUERY 6: Ver políticas RLS ativas
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'profiles';

-- Isso mostra as políticas de segurança
-- Elas podem estar bloqueando a visualização dos dados

-- ============================================

-- RESUMO DO PROBLEMA:
-- O trigger ESTÁ funcionando (perfil foi criado)
-- Mas o RLS está bloqueando você de VER os dados
-- quando executa queries no SQL Editor
--
-- SOLUÇÃO:
-- 1. Desabilite RLS temporariamente (QUERY 2)
-- 2. Verifique os dados (QUERY 3 e 4)
-- 3. Reabilite RLS (QUERY 5)
-- ============================================
