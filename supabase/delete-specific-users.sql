-- Script para deletar usuários específicos do sistema
-- Execute este script no SQL Editor do Supabase Dashboard

DO $$
DECLARE
    v_user_id_1 uuid;
    v_user_id_2 uuid;
BEGIN
    RAISE NOTICE '🗑️  Iniciando exclusão de usuários...';
    RAISE NOTICE '';

    -- Buscar ID do primeiro usuário
    SELECT id INTO v_user_id_1
    FROM auth.users
    WHERE email = 'andrey.rocca@gmail.com';

    -- Buscar ID do segundo usuário
    SELECT id INTO v_user_id_2
    FROM auth.users
    WHERE email = 'rocca.medicina@gmail.com';

    -- Deletar primeiro usuário
    IF v_user_id_1 IS NOT NULL THEN
        RAISE NOTICE '📧 Deletando andrey.rocca@gmail.com...';

        -- Deletar connections relacionadas
        DELETE FROM connections WHERE doctor_id = v_user_id_1 OR patient_id = v_user_id_1;
        RAISE NOTICE '   ✅ Conexões deletadas';

        -- Deletar invites relacionados
        DELETE FROM invites WHERE doctor_id = v_user_id_1 OR patient_id = v_user_id_1;
        RAISE NOTICE '   ✅ Convites deletados';

        -- Deletar questionários
        DELETE FROM questionnaires WHERE patient_id = v_user_id_1;
        RAISE NOTICE '   ✅ Questionários deletados';

        -- Deletar audit logs
        DELETE FROM audit_logs WHERE doctor_id = v_user_id_1;
        RAISE NOTICE '   ✅ Logs de auditoria deletados';

        -- Deletar perfil
        DELETE FROM profiles WHERE id = v_user_id_1;
        RAISE NOTICE '   ✅ Perfil deletado';

        -- Deletar usuário do auth
        DELETE FROM auth.users WHERE id = v_user_id_1;
        RAISE NOTICE '   ✅ Usuário deletado do auth.users';
        RAISE NOTICE '';
    ELSE
        RAISE NOTICE '⚠️  andrey.rocca@gmail.com não encontrado';
        RAISE NOTICE '';
    END IF;

    -- Deletar segundo usuário
    IF v_user_id_2 IS NOT NULL THEN
        RAISE NOTICE '📧 Deletando rocca.medicina@gmail.com...';

        -- Deletar connections relacionadas
        DELETE FROM connections WHERE doctor_id = v_user_id_2 OR patient_id = v_user_id_2;
        RAISE NOTICE '   ✅ Conexões deletadas';

        -- Deletar invites relacionados
        DELETE FROM invites WHERE doctor_id = v_user_id_2 OR patient_id = v_user_id_2;
        RAISE NOTICE '   ✅ Convites deletados';

        -- Deletar questionários
        DELETE FROM questionnaires WHERE patient_id = v_user_id_2;
        RAISE NOTICE '   ✅ Questionários deletados';

        -- Deletar audit logs
        DELETE FROM audit_logs WHERE doctor_id = v_user_id_2;
        RAISE NOTICE '   ✅ Logs de auditoria deletados';

        -- Deletar perfil
        DELETE FROM profiles WHERE id = v_user_id_2;
        RAISE NOTICE '   ✅ Perfil deletado';

        -- Deletar usuário do auth
        DELETE FROM auth.users WHERE id = v_user_id_2;
        RAISE NOTICE '   ✅ Usuário deletado do auth.users';
        RAISE NOTICE '';
    ELSE
        RAISE NOTICE '⚠️  rocca.medicina@gmail.com não encontrado';
        RAISE NOTICE '';
    END IF;

    RAISE NOTICE '✅ Processo de exclusão concluído!';
    RAISE NOTICE '';
    RAISE NOTICE '📝 Agora você pode criar novos cadastros com esses emails.';
END $$;
