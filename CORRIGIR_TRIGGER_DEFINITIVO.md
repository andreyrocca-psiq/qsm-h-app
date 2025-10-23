# 🔧 CORREÇÃO DEFINITIVA DO TRIGGER - Passo a Passo

## ⚠️ IMPORTANTE
Siga TODOS os passos na ordem. Este guia vai diagnosticar e corrigir TODOS os problemas.

---

## 📋 PASSO A PASSO

### 1️⃣ Acesse o Supabase

1. Vá para https://app.supabase.com
2. Faça login
3. Selecione seu projeto **qsm-h-app**

---

### 2️⃣ Abra o SQL Editor

1. No menu lateral esquerdo, clique em **SQL Editor** (ícone `</>`)
2. Clique em **+ New query**

---

### 3️⃣ Execute o Script de Correção

1. Abra o arquivo `supabase/fix-complete.sql` deste projeto
2. **Copie TODO o conteúdo** (Ctrl+A, Ctrl+C)
3. **Cole** no SQL Editor do Supabase
4. Clique em **Run** (ou Ctrl/Cmd + Enter)

---

### 4️⃣ Verifique os Resultados

Você deve ver várias mensagens no painel de resultados:

**Mensagens esperadas:**
```
✅ Extensão uuid-ossp habilitada
✅ Enum user_role já existe (ou criado)
✅ Tabela profiles verificada/criada
⚠️  RLS desabilitado temporariamente para debug
🧹 Triggers e funções antigas removidas
✅ Função handle_new_user() criada com debug
✅ Trigger on_auth_user_created criado
✅ TRIGGER CONFIRMADO: on_auth_user_created está ativo
✅ Criados X perfis retroativamente (ou nenhum)
✅ RLS reabilitado com políticas de segurança
========================================
✅ CONFIGURAÇÃO COMPLETA!
========================================
Total de usuários: X
Total de perfis: X
✅ SUCESSO: Todos os usuários têm perfil!
```

**E uma tabela mostrando todos os usuários com status `✅ TEM PERFIL`**

---

### 5️⃣ Verifique Perfis Criados

Execute esta query para ver os perfis:

```sql
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

SELECT
  id,
  full_name,
  role,
  created_at
FROM profiles
ORDER BY created_at DESC;

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
```

Você deve ver **TODOS os perfis** dos usuários existentes.

---

### 6️⃣ TESTE REAL - Criar Novo Usuário

Agora vamos testar se o trigger funciona para novos usuários:

#### A. Deletar Usuário de Teste Antigo (se existir)

1. No Supabase, vá em **Authentication** > **Users**
2. Procure por usuários de teste antigos
3. Delete-os (clique nos `...` > **Delete user**)

#### B. Criar Novo Usuário

1. Abra http://localhost:3000 no navegador
2. Clique em **"Criar Conta"**
3. Preencha:
   - **Nome:** João Teste Trigger
   - **Email:** joao.trigger@teste.com
   - **Senha:** 123456
   - **Role:** Paciente
4. Aceite os termos
5. Clique em **"Criar Conta"**

#### C. Verificar se Perfil Foi Criado

Volte ao SQL Editor do Supabase e execute:

```sql
-- Ver o perfil do João
SELECT
  u.email,
  p.full_name,
  p.role,
  p.created_at
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE u.email = 'joao.trigger@teste.com';
```

**Resultado esperado:**
```
email: joao.trigger@teste.com
full_name: João Teste Trigger
role: patient
created_at: (data atual)
```

✅ **Se aparecer o nome "João Teste Trigger", o trigger ESTÁ FUNCIONANDO!**

---

## 🔍 Verificar Logs (Se Não Funcionar)

Se o perfil NÃO foi criado:

1. Vá em **Database** > **Logs** > **Postgres Logs**
2. Procure por mensagens com:
   - 🔵 "Trigger executado"
   - ❌ "ERRO ao criar perfil"
3. Anote a mensagem de erro e me envie

---

## 🐛 Problemas Comuns

### ❌ Erro: "relation auth.users does not exist"

**Solução:** Você precisa ter permissões de administrador. Execute o script como usuário admin no Supabase.

---

### ❌ Erro: "type user_role does not exist"

**Solução:** Execute apenas a parte do PASSO 2 do script:

```sql
CREATE TYPE user_role AS ENUM ('patient', 'doctor');
```

Depois execute o script completo novamente.

---

### ❌ Erro: "permission denied for schema auth"

**Solução:** Este erro indica que o Supabase não está permitindo acesso ao schema `auth`.

**Workaround:** Use a função `auth.uid()` em vez de acessar diretamente:

```sql
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role, phone)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Usuário'),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'patient'),
    NEW.raw_user_meta_data->>'phone'
  );
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Não falhar mesmo se houver erro
  RAISE WARNING 'Erro: %', SQLERRM;
  RETURN NEW;
END;
$$;
```

---

### ❌ Perfil criado mas não aparece

**Causa:** RLS está bloqueando.

**Solução:** Desabilite temporariamente:

```sql
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Verificar
SELECT * FROM profiles;

-- Reabilitar
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
```

---

## 📸 Envie Screenshots

Se nada funcionar, tire screenshots de:

1. **Mensagens do script** no SQL Editor
2. **Logs do Postgres** (Database > Logs > Postgres Logs)
3. **Erro no console do navegador** (F12 > Console)
4. **Resultado da query de verificação** de perfis

E me envie para eu analisar!

---

## ✅ Checklist Final

Marque cada item após completar:

- [ ] Executei o script `fix-complete.sql` completo
- [ ] Vi a mensagem "✅ CONFIGURAÇÃO COMPLETA!"
- [ ] Todos os usuários existentes apareceram com "✅ TEM PERFIL"
- [ ] Criei um novo usuário de teste (João)
- [ ] O perfil do João foi criado automaticamente
- [ ] Verifiquei os logs e não há erros

**Se todos os itens estão marcados: FUNCIONOU! 🎉**

---

## 🚀 Próximos Passos

Após confirmar que está funcionando:

1. ✅ Fazer merge do Pull Request no GitHub
2. ✅ Configurar variáveis de ambiente no Netlify
3. ✅ Fazer deploy no Netlify
4. ✅ Testar cadastro em produção

---

**Boa sorte! Me avise quando funcionar! 😊**
