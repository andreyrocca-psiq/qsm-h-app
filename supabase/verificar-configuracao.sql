-- Script para verificar configuração do Supabase para produção

-- 1. Verificar usuários existentes
SELECT
  id,
  email,
  email_confirmed_at,
  created_at
FROM auth.users
ORDER BY created_at DESC;

-- 2. Verificar perfis criados
SELECT
  p.id,
  p.full_name,
  p.role,
  au.email,
  au.email_confirmed_at IS NOT NULL as email_confirmado
FROM profiles p
LEFT JOIN auth.users au ON p.id = au.id
ORDER BY p.created_at DESC;

-- 3. Verificar conexões médico-paciente
SELECT
  dp.id,
  d.full_name as medico,
  d.email as email_medico,
  p.full_name as paciente,
  p.email as email_paciente,
  dp.invited_at,
  dp.accepted_at,
  CASE
    WHEN dp.accepted_at IS NOT NULL THEN 'Conectado'
    ELSE 'Pendente'
  END as status
FROM doctor_patient dp
LEFT JOIN profiles d ON dp.doctor_id = d.id
LEFT JOIN profiles p ON dp.patient_id = p.id
ORDER BY dp.invited_at DESC;

-- 4. Forçar confirmação de todos os emails (se necessário)
-- DESCOMENTAR APENAS SE NECESSÁRIO:
-- UPDATE auth.users
-- SET email_confirmed_at = NOW()
-- WHERE email_confirmed_at IS NULL;

-- 5. Verificar trigger de criação de perfil
SELECT
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'auth'
AND event_object_table = 'users';

-- 6. Verificar RLS policies
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename IN ('profiles', 'doctor_patient', 'questionnaires')
ORDER BY tablename, policyname;
