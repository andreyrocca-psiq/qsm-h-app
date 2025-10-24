# Configuração de Produção no Netlify

## Problema: "Não autenticado" no Netlify

Quando a aplicação roda no Netlify mas dá erro "Não autenticado" nas API routes, o problema está na configuração do Supabase para aceitar o domínio de produção.

## Solução: Configurar Supabase para Netlify

### 1. Configurar Site URL no Supabase

1. Acesse o [Painel do Supabase](https://app.supabase.com)
2. Selecione seu projeto
3. Vá em **Authentication** → **URL Configuration**
4. Configure:

```
Site URL: https://questionariodehumor.netlify.app
```

### 2. Adicionar Redirect URLs Permitidas

Na mesma página (Authentication → URL Configuration), adicione estas URLs em **Redirect URLs**:

```
https://questionariodehumor.netlify.app
https://questionariodehumor.netlify.app/auth/callback
https://questionariodehumor.netlify.app/patient/dashboard
https://questionariodehumor.netlify.app/doctor/dashboard
https://questionariodehumor.netlify.app/*
```

**IMPORTANTE**: Clique em "Save" após adicionar cada URL!

### 3. Verificar Variáveis de Ambiente no Netlify

1. Acesse o painel do Netlify
2. Vá em **Site configuration** → **Environment variables**
3. Verifique se estas variáveis estão configuradas:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anonima
NEXT_PUBLIC_APP_URL=https://questionariodehumor.netlify.app
NEXT_PUBLIC_VAPID_PUBLIC_KEY=sua-chave-vapid-publica
VAPID_PRIVATE_KEY=sua-chave-vapid-privada
```

### 4. Desabilitar Confirmação de Email (Opcional)

Se os usuários não conseguem confirmar email em produção:

1. No Supabase, vá em **Authentication** → **Providers** → **Email**
2. Desabilite **"Confirm email"**
3. Clique em **Save**

Ou force a confirmação via SQL:

```sql
-- No SQL Editor do Supabase
UPDATE auth.users
SET email_confirmed_at = NOW()
WHERE email_confirmed_at IS NULL;
```

### 5. Deploy com Novas Configurações

Após configurar o Supabase:

1. No Netlify, vá em **Deploys**
2. Clique em **Trigger deploy** → **Clear cache and deploy site**
3. Aguarde o deploy completar

## Como Testar

1. Acesse: https://questionariodehumor.netlify.app
2. Faça login com uma conta existente
3. Tente convidar paciente (médico) ou compartilhar com médico (paciente)
4. Deve funcionar sem erro "Não autenticado"

## Debug: Verificar Autenticação

Acesse (enquanto logado):
```
https://questionariodehumor.netlify.app/api/test-auth
```

Se aparecer `"authenticated": false`, o problema está em uma destas configurações:
- Site URL incorreto no Supabase
- Redirect URLs não incluem o domínio do Netlify
- Variáveis de ambiente ausentes no Netlify

## Problemas Comuns

### 1. Erro: "Email not confirmed"
**Solução**: Desabilitar confirmação de email (passo 4 acima)

### 2. Erro: "Invalid redirect URL"
**Solução**: Adicionar todas as URLs do Netlify em Redirect URLs (passo 2)

### 3. Erro: "Não autenticado" após login
**Solução**: Verificar que Site URL está correto (passo 1)

### 4. Cookies não persistem
**Solução**: Verificar que o domínio está correto em todas as configurações

## Checklist Completo

- [ ] Site URL configurado no Supabase com domínio do Netlify
- [ ] Redirect URLs adicionadas no Supabase (incluindo /*)
- [ ] Variáveis de ambiente configuradas no Netlify
- [ ] Site deployed no Netlify após configurações
- [ ] Confirmação de email desabilitada (ou emails forçados como confirmados)
- [ ] Testado login e funcionalidades de convite

## Observação Importante

Toda vez que mudar configurações no Supabase (Site URL, Redirect URLs), você precisa:
1. **Fazer logout** da aplicação
2. **Limpar cookies** do navegador
3. **Fazer login novamente**

Caso contrário, o navegador pode manter tokens antigos que não funcionam.
