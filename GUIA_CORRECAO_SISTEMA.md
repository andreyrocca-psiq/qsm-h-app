# Guia de Correção do Sistema de Convites

## Problema Identificado

O sistema de convites não estava funcionando porque a API tentava buscar usuários por email na tabela `profiles`, mas **o email está na tabela `auth.users`**, não em `profiles`.

## Solução Implementada

1. **Criada uma view `user_profiles`** que une `auth.users` e `profiles`
2. **Atualizada a API** para buscar usando a view ao invés de `profiles` diretamente
3. **Scripts SQL** para deletar usuários específicos e criar as estruturas necessárias

---

## Instruções Passo a Passo

### 1️⃣ Deletar Seus Usuários Antigos (OPCIONAL)

⚠️ **Apenas execute se você precisa deletar os emails `andrey.rocca@gmail.com` e `rocca.medicina@gmail.com` para refazer o cadastro.**

1. Acesse o Supabase Dashboard: https://supabase.com/dashboard
2. Selecione seu projeto **qsm-h-app**
3. No menu lateral, clique em **SQL Editor**
4. Cole o conteúdo do arquivo `/supabase/delete-specific-users.sql`
5. Clique em **RUN** ou pressione `Ctrl+Enter`
6. Verifique as mensagens de sucesso

**O que este script faz:**
- Deleta todos os dados relacionados (connections, invites, questionários, logs)
- Deleta o perfil
- Deleta o usuário de `auth.users`
- Permite que você crie novos cadastros com os mesmos emails

---

### 2️⃣ Criar View e Funções Necessárias (OBRIGATÓRIO)

Este passo é **obrigatório** para o sistema de convites funcionar corretamente.

1. No **SQL Editor** do Supabase
2. Cole o conteúdo do arquivo `/supabase/create-helper-functions.sql`
3. Clique em **RUN** ou pressione `Ctrl+Enter`
4. Verifique as mensagens de sucesso:
   - ✅ View user_profiles criada
   - ✅ Função get_user_by_email_and_role criada

**O que este script faz:**
- Cria a view `user_profiles` que une `auth.users` e `profiles`
- Cria uma função SQL helper para buscar usuários por email e role
- Configura as permissões corretas

---

### 3️⃣ Verificar Trigger de Criação Automática de Perfis (OPCIONAL, mas recomendado)

Para garantir que novos usuários tenham perfis criados automaticamente:

1. No **SQL Editor** do Supabase
2. Cole o conteúdo do arquivo `/supabase/fix-invite-system.sql`
3. Clique em **RUN**
4. Verifique se o trigger está ativo:
   - ✅ Trigger on_auth_user_created está ativo
   - ⚠️ Se aparecer que o trigger NÃO está ativo, execute `/supabase/fix-complete.sql`

---

## Como Testar

### Teste 1: Cadastrar Novos Usuários

1. **Cadastre um usuário como PACIENTE:**
   - Acesse `/auth/signup`
   - Preencha os dados
   - Escolha **PACIENTE**
   - Complete o cadastro

2. **Cadastre outro usuário como PROFISSIONAL DE SAÚDE:**
   - Use outro email
   - Escolha **PROFISSIONAL DE SAÚDE**
   - Complete o cadastro

### Teste 2: Enviar Convite

1. **Como Profissional de Saúde:**
   - Faça login com a conta de profissional
   - No dashboard, clique em "Convidar Paciente"
   - **Opção 1:** Compartilhe a mensagem de WhatsApp com alguém para que se cadastre
   - **Opção 2:** Digite o email de um paciente já cadastrado e envie o convite direto

2. **Como Paciente:**
   - Faça login com a conta de paciente
   - No dashboard, clique em "Compartilhar com Profissional"
   - Digite o email do profissional
   - Envie o compartilhamento

### Teste 3: Verificar Conexão

1. O profissional deve ver o paciente na lista
2. O paciente deve ver o profissional na lista
3. Ambos devem conseguir visualizar os dados compartilhados

---

## Mensagens de Erro Melhoradas

Agora, quando você tentar convidar alguém, o sistema mostra mensagens mais claras:

### ❌ Se o usuário não existe:
```
"Nenhum usuário encontrado com este email. Verifique se já fez o cadastro."
```

### ❌ Se o usuário existe mas tem role errado:
```
"Usuário encontrado mas cadastrado como PACIENTE"
(quando você buscou por profissional)
```

### ✅ Se deu certo:
```
"Convite enviado para [Nome do Paciente]"
ou
"Compartilhamento com [Nome do Profissional] realizado com sucesso"
```

---

## Estrutura dos Arquivos Criados

```
/supabase/
├── delete-specific-users.sql       # Deletar usuários específicos
├── create-helper-functions.sql     # Criar view e funções (OBRIGATÓRIO)
└── fix-invite-system.sql           # Diagnóstico geral (opcional)

/src/app/api/invites/
└── route.ts                        # API de convites (ATUALIZADA)
```

---

## Próximos Passos

Após executar os scripts SQL:

1. ✅ Faça novos cadastros de teste
2. ✅ Teste o sistema de convites
3. ✅ Verifique se os dados estão sendo compartilhados corretamente
4. ✅ Se tudo funcionar, você pode fazer o merge do PR

---

## Suporte

Se ainda houver problemas:

1. **Verifique o console do navegador** (F12 → Console) para ver erros
2. **Verifique os logs do Supabase** (Dashboard → Logs)
3. **Verifique se executou todos os scripts SQL obrigatórios**
4. **Entre em contato** com os detalhes do erro

---

## Resumo Rápido

```bash
# O que você DEVE fazer:
1. Executar /supabase/create-helper-functions.sql (OBRIGATÓRIO)

# O que você PODE fazer (se necessário):
2. Executar /supabase/delete-specific-users.sql (se precisar deletar seus emails)
3. Executar /supabase/fix-invite-system.sql (para diagnóstico)

# Depois:
4. Fazer novos cadastros
5. Testar o sistema de convites
6. Fazer o merge do PR quando tudo funcionar
```

---

**Boa sorte!** 🚀
