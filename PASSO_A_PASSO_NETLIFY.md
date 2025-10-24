# 🚀 Guia Passo-a-Passo: Corrigir "Não Autenticado" no Netlify

## ⚠️ PROBLEMA
Quando você tenta convidar paciente ou compartilhar com médico em https://questionariodehumor.netlify.app, aparece erro "Não autenticado".

## ✅ SOLUÇÃO EM 5 PASSOS

---

## PASSO 1: Configurar Site URL no Supabase

### O que fazer:
1. Acesse: https://app.supabase.com
2. Selecione seu projeto
3. No menu lateral, clique em **Authentication**
4. Clique em **URL Configuration** (ou Configuração de URL)
5. Localize o campo **Site URL**
6. Mude para: `https://questionariodehumor.netlify.app`
7. Clique em **Save** (Salvar)

### Por que:
O Supabase precisa saber qual é o domínio oficial da sua aplicação para validar os cookies de autenticação.

---

## PASSO 2: Adicionar Redirect URLs

### O que fazer:
1. Na mesma página (Authentication → URL Configuration)
2. Role até a seção **Redirect URLs**
3. Adicione cada uma destas URLs (clicando em "Add URL" entre cada):

```
https://questionariodehumor.netlify.app/*
```

**IMPORTANTE**: O `/*` no final é essencial! Ele permite qualquer caminho dentro do domínio.

4. Clique em **Save** após adicionar

### Por que:
O Supabase só permite redirecionamentos após login para URLs que estão nesta lista. Sem isso, o login funciona mas a aplicação não consegue redirecionar corretamente.

---

## PASSO 3: Verificar Variáveis de Ambiente no Netlify

### O que fazer:
1. Acesse: https://app.netlify.com
2. Selecione seu site "questionariodehumor"
3. Vá em **Site configuration** (no menu lateral)
4. Clique em **Environment variables**
5. Verifique se TODAS estas variáveis existem:

```bash
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
NEXT_PUBLIC_APP_URL
```

### Como adicionar se estiver faltando:
1. Clique em **Add a variable**
2. Coloque o **Key** (nome da variável)
3. Coloque o **Value** (valor)
4. Escolha **All scopes** (ou Production)
5. Clique em **Create variable**

### Valores corretos:

**NEXT_PUBLIC_SUPABASE_URL**
- Vá no Supabase → Settings → API
- Copie a "Project URL"
- Exemplo: `https://abcdefgh.supabase.co`

**NEXT_PUBLIC_SUPABASE_ANON_KEY**
- Vá no Supabase → Settings → API
- Copie a "anon / public" key
- É uma chave longa começando com "eyJ..."

**NEXT_PUBLIC_APP_URL**
- Cole: `https://questionariodehumor.netlify.app`

---

## PASSO 4: Fazer Novo Deploy no Netlify

### O que fazer:
1. No painel do Netlify
2. Vá em **Deploys** (no menu)
3. Clique no botão **Trigger deploy**
4. Selecione **Clear cache and deploy site**
5. Aguarde o deploy completar (pode levar 2-5 minutos)

### Por que:
O Netlify precisa reconstruir o site com as novas variáveis de ambiente e configurações.

---

## PASSO 5: Testar a Aplicação

### O que fazer:
1. **IMPORTANTE**: Limpe os cookies do navegador ou use uma aba anônima
2. Acesse: https://questionariodehumor.netlify.app
3. Faça login com sua conta
4. Tente as funcionalidades:
   - **Como médico**: Convidar paciente
   - **Como paciente**: Compartilhar com médico
5. Não deve mais aparecer "Não autenticado"!

---

## 🐛 DEBUG: Se Ainda Não Funcionar

### Teste 1: Verificar Autenticação
Enquanto logado, acesse:
```
https://questionariodehumor.netlify.app/api/test-auth
```

**Se aparecer `"authenticated": true`** → Autenticação está OK!
**Se aparecer `"authenticated": false`** → Volte no PASSO 1 e revise

### Teste 2: Verificar no Supabase
1. Abra o SQL Editor no Supabase
2. Cole e execute o script em: `supabase/verificar-configuracao.sql`
3. Veja se seus usuários estão confirmados

### Teste 3: Forçar Confirmação de Email
Se o problema for email não confirmado:

1. No Supabase, vá em **SQL Editor**
2. Cole este código:
```sql
UPDATE auth.users
SET email_confirmed_at = NOW()
WHERE email_confirmed_at IS NULL;
```
3. Clique em **Run**
4. Faça logout e login novamente no site

---

## 📋 CHECKLIST FINAL

Marque quando completar cada passo:

- [ ] Site URL configurado no Supabase: `https://questionariodehumor.netlify.app`
- [ ] Redirect URLs adicionada: `https://questionariodehumor.netlify.app/*`
- [ ] Variáveis de ambiente verificadas no Netlify
- [ ] Deploy feito no Netlify (Clear cache and deploy)
- [ ] Cookies do navegador limpos
- [ ] Login testado
- [ ] Convite/compartilhamento testado SEM erro "Não autenticado"

---

## 💡 DICA PRO

Sempre que mudar configurações no Supabase:
1. Faça logout do site
2. Limpe os cookies (ou use aba anônima)
3. Faça login novamente

Isso garante que você está usando os tokens novos com as configurações atualizadas.

---

## 🆘 PRECISA DE AJUDA?

Se seguiu todos os passos e ainda não funciona, me envie:

1. O resultado de: https://questionariodehumor.netlify.app/api/test-auth
2. Screenshot das variáveis de ambiente no Netlify (pode censurar os valores)
3. Screenshot da URL Configuration no Supabase

Assim consigo diagnosticar o problema específico!
