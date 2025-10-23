# 🚨 Como Criar o Trigger Crítico no Supabase

## ⚠️ IMPORTANTE
Sem este trigger, você terá o erro: **"Database error saving new user"**

Este trigger cria automaticamente o perfil do usuário na tabela `profiles` quando alguém se cadastra.

---

## Passo a Passo

### 1. Acesse o Supabase
1. Vá para https://app.supabase.com
2. Faça login
3. Selecione seu projeto: **qsm-h-app** (ou o nome que você deu)

### 2. Abra o SQL Editor
1. No menu lateral esquerdo, clique em **SQL Editor** (ícone de banco de dados com </>)
2. Clique em **+ New query** (botão no canto superior direito)

### 3. Execute o Script do Trigger
1. Abra o arquivo `supabase/create-trigger.sql` deste projeto
2. **Copie TODO o conteúdo** do arquivo
3. **Cole** no SQL Editor do Supabase
4. Clique em **Run** (ou pressione Ctrl/Cmd + Enter)

### 4. Verifique se Funcionou
Você deve ver uma mensagem de sucesso e uma tabela com estas colunas:

```
trigger_name            | on_auth_user_created
event_manipulation      | INSERT
event_object_table      | users
action_statement        | EXECUTE FUNCTION handle_new_user()
action_timing           | AFTER
```

✅ **Se você ver essa linha, o trigger foi criado com sucesso!**

---

## Verificação Manual (Opcional)

### Verificar se a Função Existe
1. No Supabase, vá em **Database** > **Functions**
2. Procure por `handle_new_user`
3. Deve aparecer na lista

### Verificar se o Trigger Existe
1. No Supabase, vá em **Database** > **Triggers**
2. Procure por `on_auth_user_created`
3. Deve aparecer na lista ligado à tabela `auth.users`

---

## Testar o Cadastro

Após criar o trigger, teste:

### 1. Limpar Cache (Importante!)
```bash
# No seu terminal
npm run dev
```

### 2. Criar Usuário de Teste
1. Acesse http://localhost:3000
2. Clique em **"Criar Conta"**
3. Preencha o formulário:
   - Nome: Teste Trigger
   - Email: teste.trigger@example.com
   - Senha: 123456
   - Role: Paciente
4. Aceite os termos
5. Clique em **"Criar Conta"**

### 3. Verificar no Supabase

#### Verificar Usuário Criado
1. No Supabase, vá em **Authentication** > **Users**
2. Deve aparecer o usuário `teste.trigger@example.com`

#### Verificar Perfil Criado (CRÍTICO!)
1. No Supabase, vá em **Table Editor** > **profiles**
2. Deve aparecer UMA linha com:
   - **id**: mesmo UUID do usuário
   - **full_name**: "Teste Trigger"
   - **role**: "patient"
   - **created_at**: data/hora de agora

✅ **Se o perfil foi criado automaticamente, o trigger está funcionando!**

❌ **Se não aparecer nada na tabela `profiles`, o trigger NÃO está funcionando.**

---

## Problemas Comuns

### ❌ Erro: "relation auth.users does not exist"

**Causa**: Você está tentando criar o trigger em um schema errado.

**Solução**:
1. Certifique-se de que você está executando o SQL no **SQL Editor** do Supabase
2. O Supabase tem acesso à tabela `auth.users` por padrão

### ❌ Erro: "type user_role does not exist"

**Causa**: O enum `user_role` não foi criado.

**Solução**:
Execute PRIMEIRO o schema completo antes de criar o trigger:
```sql
-- Execute isto ANTES do trigger
CREATE TYPE user_role AS ENUM ('patient', 'doctor');
```

### ❌ Erro: "table profiles does not exist"

**Causa**: A tabela `profiles` não foi criada.

**Solução**:
1. Execute o arquivo `supabase/schema.sql` completo PRIMEIRO
2. Depois execute o trigger

### ❌ Trigger criado mas perfil não é criado

**Possíveis causas**:
1. **Políticas RLS muito restritivas**
   - Vá em **Table Editor** > **profiles** > **...** > **View policies**
   - Temporariamente desabilite RLS para testar: `ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;`
   - Teste o cadastro novamente
   - Se funcionar, o problema são as políticas RLS

2. **Erro na função**
   - Vá em **Database** > **Logs** > **Postgres Logs**
   - Procure por erros relacionados a `handle_new_user`

---

## Script Completo (Se nada funcionar)

Se nada estiver funcionando, execute este script completo:

```sql
-- 1. Criar enum (se não existir)
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('patient', 'doctor');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 2. Criar tabela profiles (se não existir)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  role user_role NOT NULL DEFAULT 'patient',
  full_name TEXT NOT NULL,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- 3. Desabilitar RLS temporariamente (para debug)
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- 4. Criar função
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Usuário'),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'patient')
  );
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG 'Erro ao criar perfil: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Remover trigger antigo
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 6. Criar trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- 7. Verificar
SELECT
  trigger_name,
  event_object_table,
  action_timing
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';
```

---

## Depois de Funcionar

### Reabilitar RLS (IMPORTANTE!)
```sql
-- Depois de testar e confirmar que está funcionando
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Criar políticas RLS
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);
```

---

## Precisa de Ajuda?

Se continuar com problemas:

1. **Copie os logs de erro** do Supabase:
   - Database > Logs > Postgres Logs

2. **Verifique o console do navegador**:
   - Pressione F12
   - Vá na aba Console
   - Procure por erros em vermelho

3. **Tire screenshots** de:
   - Erro no navegador
   - Logs do Supabase
   - Tabela de triggers vazia

---

**Boa sorte! 🚀**
