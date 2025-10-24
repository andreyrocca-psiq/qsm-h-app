-- ============================================
-- CONFIRMAR EMAILS - VERSÃO CORRIGIDA
-- ============================================
-- Este script confirma emails SEM tocar na coluna confirmed_at
-- (que é gerada automaticamente pelo Supabase)
-- ============================================

-- PASSO 1: Ver status atual
SELECT
  email,
  email_confirmed_at,
  CASE
    WHEN email_confirmed_at IS NULL THEN '❌ NÃO CONFIRMADO'
    ELSE '✅ JÁ CONFIRMADO'
  END as status
FROM auth.users
ORDER BY created_at DESC;

-- ============================================
-- PASSO 2: CONFIRMAR EMAILS (VERSÃO CORRIGIDA)
-- ============================================
-- Apenas atualiza email_confirmed_at
-- NÃO toca em confirmed_at (coluna gerada)

UPDATE auth.users
SET email_confirmed_at = NOW()
WHERE email_confirmed_at IS NULL;

-- Mostrar quantos foram confirmados
DO $$
DECLARE
  v_count INTEGER;
BEGIN
  GET DIAGNOSTICS v_count = ROW_COUNT;

  IF v_count > 0 THEN
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ SUCESSO! % emails confirmados!', v_count;
    RAISE NOTICE '========================================';
    RAISE NOTICE '';
    RAISE NOTICE '🎉 Agora você pode fazer LOGIN!';
    RAISE NOTICE '';
  ELSE
    RAISE NOTICE '✅ Todos os emails já estavam confirmados!';
  END IF;
END $$;

-- ============================================
-- PASSO 3: VERIFICAR resultado
-- ============================================
SELECT
  email,
  email_confirmed_at,
  created_at,
  '✅ CONFIRMADO - PODE FAZER LOGIN!' as status
FROM auth.users
ORDER BY created_at DESC;

-- ============================================
-- TODOS devem ter email_confirmed_at preenchido
-- Se aparecer uma data, está CONFIRMADO! ✅
-- ============================================

-- ============================================
-- PASSO 4: Ver usuários com seus perfis
-- ============================================
SELECT
  u.email,
  u.email_confirmed_at,
  p.full_name,
  p.role,
  CASE
    WHEN u.email_confirmed_at IS NOT NULL AND p.id IS NOT NULL THEN '✅✅ TUDO OK - PODE LOGAR!'
    WHEN u.email_confirmed_at IS NULL THEN '❌ EMAIL NÃO CONFIRMADO'
    WHEN p.id IS NULL THEN '❌ PERFIL NÃO CRIADO'
    ELSE '⚠️ VERIFICAR'
  END as status
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
ORDER BY u.created_at DESC;

-- ============================================
-- RESULTADO ESPERADO:
-- Status: ✅✅ TUDO OK - PODE LOGAR!
-- ============================================
