-- ============================================
-- VERIFICAR E CORRIGIR PROBLEMA DE LOGIN
-- ============================================
-- Execute este script no SQL Editor do Supabase
-- ============================================

-- PASSO 1: Verificar usuários e status de email
-- ============================================
SELECT
  id,
  email,
  email_confirmed_at,
  created_at,
  CASE
    WHEN email_confirmed_at IS NULL THEN '❌ EMAIL NÃO CONFIRMADO'
    ELSE '✅ EMAIL CONFIRMADO'
  END as status_email,
  CASE
    WHEN email_confirmed_at IS NULL THEN '⚠️ NÃO PODE FAZER LOGIN'
    ELSE '✅ PODE FAZER LOGIN'
  END as pode_logar
FROM auth.users
ORDER BY created_at DESC;

-- ============================================
-- PASSO 2: CONFIRMAR TODOS OS EMAILS automaticamente
-- ============================================
-- ATENÇÃO: Isso confirma os emails de TODOS os usuários
-- Use apenas em desenvolvimento/teste!
UPDATE auth.users
SET email_confirmed_at = NOW()
WHERE email_confirmed_at IS NULL;

-- Ver quantos foram confirmados
DO $$
DECLARE
  v_count INTEGER;
BEGIN
  GET DIAGNOSTICS v_count = ROW_COUNT;
  IF v_count > 0 THEN
    RAISE NOTICE '✅ % emails confirmados!', v_count;
  ELSE
    RAISE NOTICE '✅ Todos os emails já estavam confirmados';
  END IF;
END $$;

-- ============================================
-- PASSO 3: Verificar novamente
-- ============================================
SELECT
  email,
  email_confirmed_at,
  CASE
    WHEN email_confirmed_at IS NOT NULL THEN '✅ CONFIRMADO - PODE LOGAR'
    ELSE '❌ NÃO CONFIRMADO'
  END as status
FROM auth.users
ORDER BY created_at DESC;

-- ============================================
-- PASSO 4: Ver dados completos do último usuário
-- ============================================
SELECT
  u.id,
  u.email,
  u.email_confirmed_at,
  u.created_at as usuario_criado,
  p.full_name,
  p.role,
  p.created_at as perfil_criado
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
ORDER BY u.created_at DESC
LIMIT 1;

-- ============================================
-- RESULTADO ESPERADO:
-- Todos os usuários devem ter email_confirmed_at preenchido
-- Status: ✅ CONFIRMADO - PODE LOGAR
-- ============================================
