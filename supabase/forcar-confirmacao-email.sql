-- ============================================
-- FORÇAR CONFIRMAÇÃO DE EMAILS (SOLUÇÃO IMEDIATA)
-- ============================================
-- Este script confirma TODOS os emails sem precisar clicar em link
-- Use em DESENVOLVIMENTO apenas!
-- ============================================

-- PASSO 1: Ver status atual dos usuários
SELECT
  id,
  email,
  email_confirmed_at,
  created_at,
  CASE
    WHEN email_confirmed_at IS NULL THEN '❌ NÃO CONFIRMADO - NÃO PODE LOGAR'
    ELSE '✅ CONFIRMADO - PODE LOGAR'
  END as status,
  CASE
    WHEN email_confirmed_at IS NULL THEN 'Execute o PASSO 2'
    ELSE 'Já pode fazer login!'
  END as acao
FROM auth.users
ORDER BY created_at DESC;

-- ============================================
-- PASSO 2: CONFIRMAR TODOS OS EMAILS (FORÇAR)
-- ============================================
-- ATENÇÃO: Isso FORÇA a confirmação sem precisar de link/email
-- Use apenas em desenvolvimento!

-- CORRIGIDO: Não toca em confirmed_at (é coluna gerada)
UPDATE auth.users
SET email_confirmed_at = NOW()
WHERE email_confirmed_at IS NULL;

-- Mostrar resultado
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
    RAISE NOTICE '📝 Próximos passos:';
    RAISE NOTICE '1. Vá para http://localhost:3000';
    RAISE NOTICE '2. Clique em "Entrar"';
    RAISE NOTICE '3. Use seu email e senha';
    RAISE NOTICE '';
  ELSE
    RAISE NOTICE '✅ Todos os emails já estavam confirmados!';
  END IF;
END $$;

-- ============================================
-- PASSO 3: VERIFICAR se funcionou
-- ============================================
SELECT
  email,
  email_confirmed_at,
  '✅ CONFIRMADO - PODE FAZER LOGIN!' as status
FROM auth.users
ORDER BY created_at DESC;

-- ============================================
-- TODOS devem aparecer com email_confirmed_at preenchido
-- Se aparecer uma data/hora, está CONFIRMADO! ✅
-- ============================================

-- ============================================
-- PASSO 4: Ver perfis também
-- ============================================
SELECT
  u.email,
  u.email_confirmed_at as email_confirmado_em,
  p.full_name,
  p.role,
  '✅ PODE LOGAR AGORA!' as status
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
ORDER BY u.created_at DESC;

-- ============================================
-- RESULTADO ESPERADO:
-- - Todos os usuários com email_confirmed_at preenchido
-- - Status: ✅ PODE LOGAR AGORA!
-- - Agora você consegue fazer login no site!
-- ============================================
