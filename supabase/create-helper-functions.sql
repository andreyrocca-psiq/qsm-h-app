-- Criar uma view que une auth.users e profiles
-- Isso facilita buscas por email sem precisar de funções RPC

CREATE OR REPLACE VIEW user_profiles AS
SELECT
  p.id,
  p.role,
  p.full_name,
  p.phone,
  p.created_at,
  p.updated_at,
  u.email
FROM profiles p
INNER JOIN auth.users u ON u.id = p.id;

-- Configurar RLS para a view
ALTER VIEW user_profiles SET (security_invoker = on);

-- Função helper para buscar usuários por email e role
CREATE OR REPLACE FUNCTION get_user_by_email_and_role(
  search_email TEXT,
  search_role user_role
)
RETURNS TABLE (
  id UUID,
  full_name TEXT,
  role user_role,
  email TEXT
)
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.full_name,
    p.role,
    u.email
  FROM profiles p
  INNER JOIN auth.users u ON u.id = p.id
  WHERE LOWER(u.email) = LOWER(search_email)
    AND p.role = search_role
  LIMIT 1;
END;
$$;

-- Conceder permissões
GRANT SELECT ON user_profiles TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_by_email_and_role(TEXT, user_role) TO authenticated;

DO $$
BEGIN
  RAISE NOTICE '✅ View user_profiles criada com sucesso!';
  RAISE NOTICE '✅ Função get_user_by_email_and_role criada com sucesso!';
  RAISE NOTICE '';
  RAISE NOTICE '📝 A view user_profiles une auth.users e profiles';
  RAISE NOTICE '   permitindo buscar usuários por email de forma eficiente.';
END $$;
