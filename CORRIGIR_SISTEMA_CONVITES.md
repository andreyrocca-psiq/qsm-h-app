# 🔧 Guia de Correção do Sistema de Convites

## 🎯 Problema Identificado

O erro "médico ou paciente não encontrado" ocorre quando:
1. Usuários foram cadastrados mas seus perfis não foram criados na tabela `profiles`
2. Perfis existem mas o campo `role` não foi preenchido corretamente
3. O trigger de criação automática de perfis não estava funcionando ou não foi executado

## ✅ Solução em 3 Passos

### Passo 1: Executar o Script de Correção no Supabase

1. Acesse https://app.supabase.com
2. Faça login e selecione seu projeto **qsm-h-app**
3. No menu lateral, clique em **SQL Editor** (ícone `</>`)
4. Clique em **+ New query**
5. Abra o arquivo `supabase/fix-invite-system.sql` deste projeto
6. **Copie TODO o conteúdo** do arquivo
7. **Cole** no SQL Editor do Supabase
8. Clique em **Run** (ou pressione Ctrl/Cmd + Enter)

### Passo 2: Verificar os Resultados

Após executar o script, você verá várias mensagens no console:

**Mensagens esperadas:**
```
🔍 DIAGNÓSTICO DO SISTEMA DE CONVITES
========================================
📊 ESTATÍSTICAS:
   Total de usuários: X
   Total de perfis: X
   Usuários sem perfil: 0
✅ Todos os usuários têm perfil

🔧 CORREÇÃO 1: Criando perfis faltantes...
✅ Nenhum perfil precisou ser criado

🔧 CORREÇÃO 2: Corrigindo perfis com role NULL...
✅ Nenhum perfil precisou ser atualizado

========================================
✅ RESULTADO FINAL
========================================
Total de usuários: X
Total de perfis: X
Perfis com role: X
   - Médicos: X
   - Pacientes: X

✅ SUCESSO: Sistema de convites corrigido!
✅ Todos os usuários têm perfil com role definido!
```

Você também verá **duas tabelas**:
1. **Lista de Usuários e Perfis** - mostrando todos os usuários com seus perfis e roles
2. **Lista Atualizada de Usuários** - confirmando que todos estão corretos

### Passo 3: Testar o Sistema de Convites

#### A. Teste como Médico

1. Faça login como médico
2. Vá para o Dashboard do Médico
3. Clique em "Convidar Paciente"
4. Digite o email de um paciente cadastrado
5. Envie o convite
6. **Abra o console do navegador (F12 > Console)**
7. Procure pelos logs com emojis:
   - 🔍 Buscando paciente com email: ...
   - 📊 Resultado da busca de paciente: ...

**Se ainda der erro:**
- Copie a mensagem de erro completa (incluindo o campo `debug`)
- Envie para análise

#### B. Teste como Paciente

1. Faça login como paciente
2. Vá para o Dashboard do Paciente
3. Clique em "Compartilhar com Médico"
4. Busque um médico pelo email
5. Se o médico não aparecer:
   - **Abra o console do navegador (F12 > Console)**
   - Procure pelos logs com emojis
   - Copie a mensagem de erro completa

## 🐛 Problemas Comuns

### ❌ "Usuários sem perfil: X" (onde X > 0)

**Causa:** Alguns usuários não têm perfil na tabela `profiles`

**Solução:** O script já corrige isso automaticamente. Se ainda houver usuários sem perfil após executar o script:

1. Verifique se o trigger está ativo:
```sql
SELECT trigger_name, event_manipulation, event_object_table
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';
```

2. Se não aparecer nada, execute o script `supabase/fix-complete.sql`

### ❌ "X perfis têm role NULL"

**Causa:** Perfis foram criados mas o campo `role` está vazio

**Solução:** O script já corrige isso automaticamente. Se ainda houver perfis com role NULL:

1. Execute manualmente:
```sql
UPDATE profiles
SET role = 'patient'
WHERE role IS NULL;
```

### ❌ "Médico/Paciente não encontrado" mas usuário existe

**Causa:** O usuário tem role diferente do esperado (ex: médico tentando convidar outro médico)

**Solução:** Verifique a role do usuário:

1. No Supabase, vá para **SQL Editor**
2. Execute:
```sql
SELECT email, full_name, role
FROM profiles
WHERE email = 'email@do-usuario.com';
```

3. Se a role estiver errada, corrija:
```sql
UPDATE profiles
SET role = 'patient'  -- ou 'doctor'
WHERE email = 'email@do-usuario.com';
```

### ❌ Mensagem de erro com campo "debug"

**Exemplo:**
```json
{
  "error": "Paciente não encontrado ou email inválido",
  "debug": {
    "searchedEmail": "teste@example.com",
    "foundAnyUser": true,
    "userRole": "doctor",
    "hint": "Usuário encontrado mas com role diferente de 'patient'"
  }
}
```

**Solução:**
- Se `foundAnyUser` é `true` mas `userRole` é diferente:
  - O usuário foi cadastrado com role errado
  - Corrija a role no banco de dados
- Se `foundAnyUser` é `false`:
  - O usuário não existe na tabela `profiles`
  - Execute o script de correção novamente

## 📊 Verificações Adicionais

### Verificar se o trigger está ativo

```sql
SELECT
  trigger_name,
  event_manipulation,
  event_object_table,
  action_timing
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';
```

**Resultado esperado:** Uma linha indicando que o trigger está criado

### Ver todos os perfis

```sql
SELECT
  id,
  email,
  full_name,
  role,
  created_at
FROM profiles
ORDER BY created_at DESC;
```

### Ver perfis sem role

```sql
SELECT
  id,
  email,
  full_name,
  role
FROM profiles
WHERE role IS NULL;
```

## 🚀 Melhorias Implementadas

As seguintes melhorias foram feitas no código:

1. **Logs Detalhados na API:**
   - A API de convites agora registra logs detalhados
   - Quando um usuário não é encontrado, a API tenta buscar sem filtro de role
   - Os logs aparecem no console do navegador (F12)

2. **Mensagens de Erro Melhoradas:**
   - Erros agora incluem campo `debug` com informações úteis
   - Dicas sobre o que pode estar errado
   - Informações sobre a role encontrada

3. **Script de Diagnóstico:**
   - Novo script SQL para diagnosticar e corrigir problemas
   - Cria perfis faltantes automaticamente
   - Corrige perfis com role NULL
   - Mostra estatísticas detalhadas

## 📞 Precisa de Ajuda?

Se após seguir todos os passos o problema persistir:

1. **Colete as seguintes informações:**
   - Resultado completo do script SQL
   - Logs do console do navegador (F12 > Console)
   - Mensagem de erro exata (incluindo campo `debug`)
   - Email dos usuários envolvidos (médico e paciente)

2. **Execute essas queries e envie os resultados:**
```sql
-- Ver todos os usuários e seus perfis
SELECT
  u.email,
  p.full_name,
  p.role,
  u.raw_user_meta_data->>'role' as metadata_role
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
ORDER BY u.created_at DESC;

-- Ver estatísticas
SELECT
  'Total de usuários' as metric,
  COUNT(*) as count
FROM auth.users
UNION ALL
SELECT
  'Total de perfis' as metric,
  COUNT(*) as count
FROM profiles
UNION ALL
SELECT
  'Perfis com role doctor' as metric,
  COUNT(*) as count
FROM profiles
WHERE role = 'doctor'
UNION ALL
SELECT
  'Perfis com role patient' as metric,
  COUNT(*) as count
FROM profiles
WHERE role = 'patient'
UNION ALL
SELECT
  'Perfis com role NULL' as metric,
  COUNT(*) as count
FROM profiles
WHERE role IS NULL;
```

## ✅ Checklist Final

Marque cada item após completar:

- [ ] Executei o script `fix-invite-system.sql` no Supabase
- [ ] Vi a mensagem "✅ SUCESSO: Sistema de convites corrigido!"
- [ ] Todos os usuários têm perfil com role definido
- [ ] Testei criar convite como médico
- [ ] Testei buscar médico como paciente
- [ ] Verifiquei os logs no console do navegador
- [ ] Sistema de convites está funcionando

**Se todos os itens estão marcados: FUNCIONOU! 🎉**

---

**Data de criação:** 2025-10-25
**Versão:** 1.0
